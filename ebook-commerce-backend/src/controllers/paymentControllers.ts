// src/controllers/paymentControllers.ts
import { Request, Response } from 'express';
import fs from 'fs';
import Stripe from 'stripe';
import { ebookPath, findProduct } from '../config/catalog';
import Download from '../models/Download';
import Order from '../models/Order';
import EmailService from '../utils/emailService';
import { calculateExpiryDate, generateDownloadToken, generateOrderId, toCents, validateEmail } from '../utils/helper';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

const CUSTOMER_FIELDS = ['email', 'firstName', 'lastName', 'country', 'address', 'city', 'zipCode'] as const;
const MAX_QUANTITY = 10;

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { items, customerInfo } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
      return res.status(400).json({ error: 'Korpa je prazna' });
    }
    for (const field of CUSTOMER_FIELDS) {
      const value = customerInfo?.[field];
      if (typeof value !== 'string' || !value.trim() || value.length > 200) {
        return res.status(400).json({ error: `Nedostaje polje: ${field}` });
      }
    }
    if (!validateEmail(customerInfo.email)) {
      return res.status(400).json({ error: 'Neispravan email' });
    }

    // Build the order from the server's catalog. Prices, titles and files sent by the browser are ignored.
    const quantities = new Map<number, number>();
    for (const item of items) {
      const id = Number(item?.productId);
      const quantity = Number(item?.quantity ?? 1);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
        return res.status(400).json({ error: 'Neispravna količina' });
      }
      if (!findProduct(id)) {
        return res.status(400).json({ error: `Proizvod ${item?.productId} ne postoji` });
      }
      quantities.set(id, Math.min(MAX_QUANTITY, (quantities.get(id) ?? 0) + quantity));
    }

    const lines = [...quantities].map(([id, quantity]) => {
      const product = findProduct(id)!;
      return { productId: id, title: product.title, price: product.price, quantity, fileName: product.downloadName };
    });

    const missing = lines.filter((line) => !fs.existsSync(ebookPath(findProduct(line.productId)!)));
    if (missing.length) {
      console.error('E-book files missing on the server:', missing.map((l) => l.productId).join(', '));
      return res.status(503).json({ error: 'Neke knjige trenutno nisu dostupne' });
    }

    const totalCents = lines.reduce((sum, line) => sum + toCents(line.price) * line.quantity, 0);
    const orderId = generateOrderId();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      metadata: { orderId },
      receipt_email: customerInfo.email,
    });

    await Order.create({
      orderId,
      customerEmail: customerInfo.email.trim(),
      customerInfo: Object.fromEntries(CUSTOMER_FIELDS.filter((f) => f !== 'email').map((f) => [f, customerInfo[f].trim()])),
      items: lines,
      totalAmount: totalCents / 100,
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'pending',
    });

    res.json({ clientSecret: paymentIntent.client_secret, orderId, amount: totalCents / 100 });
  } catch (error) {
    console.error('createPaymentIntent failed:', error);
    res.status(500).json({ error: 'Greška pri kreiranju plaćanja' });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, orderId } = req.body ?? {};
    if (typeof paymentIntentId !== 'string' || typeof orderId !== 'string') {
      return res.status(400).json({ error: 'Nedostaju payment intent ili order ID' });
    }

    const order = await Order.findOne({ orderId });
    // The payment must be the one created for this order, not any successful payment.
    if (!order || order.paymentIntentId !== paymentIntentId) {
      return res.status(404).json({ error: 'Porudžbina nije pronađena' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: `Plaćanje nije završeno (status: ${paymentIntent.status})` });
    }
    if (paymentIntent.amount !== toCents(order.totalAmount)) {
      return res.status(400).json({ error: 'Iznos plaćanja se ne slaže sa porudžbinom' });
    }

    // Flip pending -> completed in one step, so two confirmations at once can't both send the books.
    const claimed = await Order.findOneAndUpdate(
      { orderId, paymentStatus: 'pending' },
      { $set: { paymentStatus: 'completed' } },
      { new: true },
    );
    if (!claimed) {
      return res.json({ success: true, message: 'Porudžbina je već obrađena, knjige su poslate.', orderId });
    }

    const downloads = claimed.items.map((item) => ({
      token: generateDownloadToken(),
      orderId,
      productId: item.productId,
      fileName: item.fileName,
      expiresAt: calculateExpiryDate(24),
    }));
    await Download.insertMany(downloads);
    claimed.downloadTokens = downloads.map((d) => d.token);
    await claimed.save();

    try {
      await EmailService.sendEbooks(
        claimed.customerEmail,
        claimed.customerInfo.firstName,
        claimed.items.map((item, i) => ({
          title: item.title,
          fileName: item.fileName,
          filePath: ebookPath(findProduct(item.productId)!),
          downloadUrl: `${process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`}/api/download/${downloads[i].token}`,
        })),
      );
    } catch (emailError) {
      console.error('Sending the e-books failed:', (emailError as Error).message);
      return res.status(207).json({
        success: true,
        message: 'Plaćanje je potvrđeno, ali email nije poslat. Kontaktirajte podršku.',
        orderId,
      });
    }

    res.json({ success: true, message: 'Plaćanje potvrđeno i e-knjige poslate na email!', orderId, itemCount: claimed.items.length });
  } catch (error) {
    console.error('confirmPayment failed:', error);
    res.status(500).json({ error: 'Greška pri potvrdi plaćanja' });
  }
};

// Public order status for the success page: no email address and no download links.
export const getOrderStatus = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ orderId: String(req.params.orderId) });
    if (!order) {
      return res.status(404).json({ error: 'Porudžbina nije pronađena' });
    }

    res.json({
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      items: order.items.map(({ productId, title, price, quantity }) => ({ productId, title, price, quantity })),
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error('getOrderStatus failed:', error);
    res.status(500).json({ error: 'Greška pri dohvatanju statusa' });
  }
};
