// src/types/index.ts

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  filePath: string;
  fileName: string;
  tags: string[];
  rating: number;
  pages: number;
  format: string;
  category: string;
}

export interface CartItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  filePath: string;
  fileName: string;
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface PaymentIntentRequest {
  amount: number;
  items: CartItem[];
  customerInfo: CustomerInfo;
}

export interface PaymentConfirmRequest {
  paymentIntentId: string;
  orderId: string;
}

export interface DownloadLink {
  title: string;
  downloadUrl: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}