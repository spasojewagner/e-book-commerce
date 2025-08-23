// src/routes/payment.ts
import { Router } from 'express';
import { 
  createPaymentIntent, 
  confirmPayment, 
  getOrderStatus 
} from '../controllers/paymentControllers';

const router = Router();

// POST /api/payment/create-payment-intent
router.post('/create-payment-intent', createPaymentIntent);

// POST /api/payment/confirm-payment
router.post('/confirm-payment', confirmPayment);

// GET /api/payment/order/:orderId
router.get('/order/:orderId', getOrderStatus);

export default router;