// src/models/Order.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  customerEmail: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    country: string;
    address: string;
    city: string;
    zipCode: string;
  };
  items: Array<{
    productId: number;
    title: string;
    price: number;
    quantity: number;
    fileName: string;
  }>;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentIntentId: string;
  downloadTokens: string[];
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  customerEmail: { 
    type: String, 
    required: true 
  },
  customerInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  items: [{
    productId: { type: Number, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    fileName: { type: String, required: true }
  }],
  totalAmount: { 
    type: Number, 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  paymentIntentId: { 
    type: String, 
    required: true 
  },
  downloadTokens: [String],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model<IOrder>('Order', orderSchema);