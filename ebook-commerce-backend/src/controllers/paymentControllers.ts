// src/controllers/paymentController.ts
import { Request, Response } from 'express';
import Stripe from 'stripe';
import Order from '../models/Order';
import Download from '../models/Download';
import EmailService from '../utils/emailService';
import path from 'path';
import fs from 'fs';
import { 
  generateOrderId, 
  generateDownloadToken, 
  calculateExpiryDate, 
  formatPrice 
} from '../utils/helper';

// Validate Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY nije postavljen');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

interface CreatePaymentIntentRequest {
  amount: number;
  items: Array<{
    productId: number;
    title: string;
    price: number;
    quantity: number;
    filePath: string;
    fileName: string;
  }>;
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    country: string;
    address: string;
    city: string;
    zipCode: string;
  };
}

/**
 * Helper function to validate file existence
 */
const validateFileExists = (filePath: string): { exists: boolean; actualPath?: string } => {
  const possiblePaths = [
    path.resolve(filePath),
    path.resolve('public', filePath),
    filePath.startsWith('public/') 
      ? path.resolve(filePath.replace('public/', ''))
      : path.resolve('public', filePath),
    path.resolve('uploads', path.basename(filePath)),
    path.resolve('public/uploads', path.basename(filePath)),
  ];

  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      return { exists: true, actualPath: testPath };
    }
  }

  return { exists: false };
};

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, items, customerInfo }: CreatePaymentIntentRequest = req.body;

    console.log('💳 Kreiranje payment intent-a...');
    console.log('💰 Iznos:', amount);
    console.log('📚 Broj stavki:', items?.length);
    console.log('👤 Email:', customerInfo?.email);

    // Validacija
    if (!amount || !items?.length || !customerInfo?.email) {
      return res.status(400).json({ 
        error: 'Nedostaju obavezna polja' 
      });
    }

    // Detaljna validacija fajlova
    console.log('🔍 Validacija fajlova...');
    const fileValidation = [];
    
    for (const item of items) {
      console.log(`\n📁 Validiramo: ${item.title}`);
      console.log(`📂 Putanja: ${item.filePath}`);
      
      const validation = validateFileExists(item.filePath);
      
      if (validation.exists && validation.actualPath) {
        const stats = fs.statSync(validation.actualPath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        
        console.log(`✅ Fajl pronađen: ${validation.actualPath}`);
        console.log(`📊 Veličina: ${sizeMB}MB`);
        
        fileValidation.push({
          item,
          valid: true,
          actualPath: validation.actualPath,
          size: stats.size
        });
      } else {
        console.error(`❌ Fajl nije pronađen: ${item.filePath}`);
        fileValidation.push({
          item,
          valid: false,
          actualPath: null,
          size: 0
        });
      }
    }

    // Proveri da li su svi fajlovi validni
    const invalidFiles = fileValidation.filter(f => !f.valid);
    if (invalidFiles.length > 0) {
      console.error('❌ Neki fajlovi nisu pronađeni:');
      invalidFiles.forEach(f => {
        console.error(`   - ${f.item.title}: ${f.item.filePath}`);
      });
      
      return res.status(400).json({ 
        error: `Sledeci fajlovi nisu pronađeni na serveru: ${invalidFiles.map(f => f.item.title).join(', ')}` 
      });
    }

    console.log(`✅ Svi fajlovi su validni (${fileValidation.length})`);

    // Kreiraj Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatPrice(amount),
      currency: 'usd',
      metadata: {
        customerEmail: customerInfo.email,
        itemCount: items.length.toString(),
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`
      }
    });

    console.log('✅ Payment intent kreiran:', paymentIntent.id);

    // Kreiraj pending order
    const orderId = generateOrderId();
    const order = new Order({
      orderId,
      customerEmail: customerInfo.email,
      customerInfo,
      items,
      totalAmount: amount,
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'pending'
    });

    await order.save();
    console.log('✅ Order sačuvan:', orderId);

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: orderId
    });

  } catch (error) {
    console.error('❌ Greška pri kreiranju payment intent:', error);
    res.status(500).json({ 
      error: 'Greška pri kreiranju plaćanja' 
    });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    console.log('\n🔐 Potvrđuje se plaćanje...');
    console.log('💳 Payment Intent:', paymentIntentId);
    console.log('📋 Order ID:', orderId);

    if (!paymentIntentId || !orderId) {
      return res.status(400).json({ 
        error: 'Nedostaju payment intent ili order ID' 
      });
    }

    // Block mock payments
    if (paymentIntentId.startsWith('pi_mock_')) {
      return res.status(400).json({ 
        error: 'Neispravno plaćanje - koristite pravu karticu' 
      });
    }

    // Verifikuj plaćanje sa Stripe
    console.log('🔍 Verifikuje se plaćanje sa Stripe...');
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log('💳 Status plaćanja:', paymentIntent.status);
    console.log('💰 Iznos plaćanja:', paymentIntent.amount, 'centi');
    console.log('🧪 Test mod:', paymentIntentId.includes('_test_'));
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: `Plaćanje nije završeno. Status: ${paymentIntent.status}` 
      });
    }

    console.log('✅ Plaćanje verifikovano sa Stripe!');

    // Pronađi order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ 
        error: 'Order nije pronađen' 
      });
    }

    if (order.paymentStatus === 'completed') {
      console.log('⚠️ Order je već obrađen, šaljem postojeće informacije');
      return res.json({ 
        success: true, 
        message: 'Order je već obrađen - e-knjige su već poslate!',
        orderId: order.orderId,
        email: order.customerEmail
      });
    }

    // Proveri iznos
    const expectedAmountInCents = Math.round(order.totalAmount * 100);
    if (paymentIntent.amount !== expectedAmountInCents) {
      console.error('❌ Nepodudaranje iznosa:');
      console.error('   - Očekivano:', expectedAmountInCents, 'centi');
      console.error('   - Primljeno:', paymentIntent.amount, 'centi');
      
      return res.status(400).json({ 
        error: 'Iznos plaćanja se ne slaže sa order-om' 
      });
    }

    console.log('✅ Iznos se slaže:', expectedAmountInCents, 'centi');

    // Ažuriraj status
    order.paymentStatus = 'completed';
    
    // Generiši download tokene
    const downloadTokens: string[] = [];
    const downloadLinks: Array<{ title: string; downloadUrl: string }> = [];

    console.log('🎫 Generiše se download tokeni...');
    for (const item of order.items) {
      const token = generateDownloadToken();
      const expiresAt = calculateExpiryDate(24);

      const download = new Download({
        token,
        orderId,
        productId: item.productId,
        filePath: item.filePath,
        fileName: item.fileName,
        expiresAt
      });

      await download.save();
      downloadTokens.push(token);
      
      downloadLinks.push({
        title: item.title,
        downloadUrl: `${process.env.FRONTEND_URL}/download/${token}`
      });

      console.log(`✅ Token kreiran za: ${item.title}`);
    }

    order.downloadTokens = downloadTokens;
    await order.save();

    console.log('✅ Order ažuriran sa download tokenima');

    // POŠALJI EMAIL SA PDF ATTACHMENT-IMA
    try {
      console.log('\n📧 Pokušaj slanja emaila...');
      console.log('📧 Email prima:', order.customerEmail);
      console.log('📧 Ime prima:', order.customerInfo.firstName);
      console.log('📧 Broj fajlova:', order.items.length);
      
      // Pripremi attachment podatke
      const ebookAttachments = order.items.map(item => {
        console.log(`📚 Priprema za email: ${item.title}`);
        console.log(`📂 Putanja: ${item.filePath}`);
        
        return {
          title: item.title,
          filePath: item.filePath, // Email servis će sam resolvovati putanju
          fileName: item.fileName
        };
      });

      console.log('📎 Pozivam EmailService...');

      // Pozovi email servis
      await EmailService.sendEbookAttachments(
        order.customerEmail,
        order.customerInfo.firstName,
        ebookAttachments
      );

      console.log('✅ Email uspešno poslat sa PDF prilozima!');
      console.log('🎉 Kupac će dobiti e-knjige direktno u inbox!');
      
    } catch (emailError: any) {
      console.error('\n❌ GREŠKA PRI SLANJU EMAILA:');
      console.error('📧 Error message:', emailError.message);
      console.error('📧 Error stack:', emailError.stack);
      
      // Loguј email config za debug
      console.error('\n📧 Email Configuration Debug:');
      console.error('- EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET');
      console.error('- EMAIL_PORT:', process.env.EMAIL_PORT || 'NOT SET');
      console.error('- EMAIL_USER exists:', !!process.env.EMAIL_USER);
      console.error('- EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
      console.error('- EMAIL_FROM:', process.env.EMAIL_FROM || 'NOT SET');
      
      // Ne prekidaj zahtev zbog email greške, ali informiši korisnika
      console.error('⚠️ NAPOMENA: Plaćanje je uspešno, ali email nije poslat!');
      
      // Možeš dodati retry logiku ovde ili queue sistem
      
      return res.status(207).json({ // 207 Multi-Status
        success: true,
        message: 'Plaćanje potvrđeno, ali email nije poslat. Kontaktirajte podršku.',
        orderId: order.orderId,
        email: order.customerEmail,
        warning: 'Email nije poslat zbog tehnické greške'
      });
    }

    res.json({ 
      success: true, 
      message: 'Plaćanje potvrđeno i e-knjige poslate na email!',
      orderId: order.orderId,
      email: order.customerEmail,
      itemCount: order.items.length
    });

  } catch (error: any) {
    console.error('❌ Greška pri potvrdi plaćanja:', error);
    res.status(500).json({ 
      error: 'Greška pri potvrdi plaćanja: ' + error.message 
    });
  }
};

export const getOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ 
        error: 'Order nije pronađen' 
      });
    }

    res.json({
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      items: order.items.map(item => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      })),
      createdAt: order.createdAt,
      customerEmail: order.customerEmail,
      downloadTokens: order.downloadTokens || []
    });

  } catch (error) {
    console.error('❌ Greška pri dohvatanju order statusa:', error);
    res.status(500).json({ 
      error: 'Greška pri dohvatanju statusa' 
    });
  }
};