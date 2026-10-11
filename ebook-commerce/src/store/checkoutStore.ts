import { create } from 'zustand';
import { axiosInstance } from '../http/index';

// TypeScript types
export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  city: string;
  zipCode: string;
}

// The server looks up title, price and file by id; only the id and quantity are sent.
export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  orderId: string;
}

export interface PaymentConfirmResponse {
  success: boolean;
  message: string;
  orderId: string;
}

export interface OrderStatus {
  orderId: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  totalAmount: number;
  items: Array<{
    productId: number;
    title: string;
    price: number;
    quantity: number;
  }>;
  createdAt: string;
}

export interface CheckoutState {
  // State
  customerInfo: CustomerInfo;
  currentOrderId: string | null;
  clientSecret: string | null;
  isLoading: boolean;
  error: string | null;
  paymentStatus: 'idle' | 'processing' | 'completed' | 'failed';
  
  // Actions
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  createPaymentIntent: (items: OrderItem[]) => Promise<PaymentIntentResponse>;
  confirmPayment: (paymentIntentId: string) => Promise<PaymentConfirmResponse>;
  getOrderStatus: (orderId: string) => Promise<OrderStatus>;
  resetCheckout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPaymentStatus: (status: 'idle' | 'processing' | 'completed' | 'failed') => void;
}

// Initial state
const initialCustomerInfo: CustomerInfo = {
  email: '',
  firstName: '',
  lastName: '',
  country: '',
  address: '',
  city: '',
  zipCode: ''
};

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  // Initial state
  customerInfo: initialCustomerInfo,
  currentOrderId: null,
  clientSecret: null,
  isLoading: false,
  error: null,
  paymentStatus: 'idle',

  // Actions
  setCustomerInfo: (info) => {
    set((state) => ({
      customerInfo: { ...state.customerInfo, ...info },
      error: null // Clear any previous errors when updating customer info
    }));
  },

  createPaymentIntent: async (items) => {
    const { customerInfo } = get();
    
    try {
      set({ isLoading: true, error: null });

      // Validate customer info
      const requiredFields = ['email', 'firstName', 'lastName', 'country', 'address', 'city', 'zipCode'];
      const missingFields = requiredFields.filter(field => 
        !customerInfo[field as keyof CustomerInfo]?.trim()
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const response = await axiosInstance.post<PaymentIntentResponse>(
        '/api/payment/create-payment-intent',
        {
          items,
          customerInfo
        }
      );

      set({
        clientSecret: response.data.clientSecret,
        currentOrderId: response.data.orderId,
        isLoading: false,
        error: null
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create payment intent';
      set({ 
        isLoading: false, 
        error: errorMessage,
        paymentStatus: 'failed'
      });
      throw new Error(errorMessage);
    }
  },

  confirmPayment: async (paymentIntentId) => {
    const { currentOrderId } = get();
    
    if (!currentOrderId) {
      throw new Error('No active order found');
    }

    try {
      set({ isLoading: true, error: null, paymentStatus: 'processing' });

      const response = await axiosInstance.post<PaymentConfirmResponse>(
        '/api/payment/confirm-payment',
        {
          paymentIntentId,
          orderId: currentOrderId
        }
      );

      set({
        isLoading: false,
        error: null,
        paymentStatus: 'completed'
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to confirm payment';
      set({ 
        isLoading: false, 
        error: errorMessage,
        paymentStatus: 'failed'
      });
      throw new Error(errorMessage);
    }
  },

  getOrderStatus: async (orderId) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axiosInstance.get<OrderStatus>(
        `/api/payment/order/${orderId}`
      );

      set({ isLoading: false, error: null });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get order status';
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      throw new Error(errorMessage);
    }
  },

  resetCheckout: () => {
    set({
      customerInfo: initialCustomerInfo,
      currentOrderId: null,
      clientSecret: null,
      isLoading: false,
      error: null,
      paymentStatus: 'idle'
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  setPaymentStatus: (status) => {
    set({ paymentStatus: status });
  }
}));

// Selectors for easier usage
export const useCheckoutSelectors = () => {
  const store = useCheckoutStore();
  
  return {
    // State selectors
    customerInfo: store.customerInfo,
    currentOrderId: store.currentOrderId,
    clientSecret: store.clientSecret,
    isLoading: store.isLoading,
    error: store.error,
    paymentStatus: store.paymentStatus,
    
    // Computed selectors
    isCustomerInfoValid: () => {
      const { customerInfo } = store;
      const requiredFields = ['email', 'firstName', 'lastName', 'country', 'address', 'city', 'zipCode'];
      return requiredFields.every(field => 
        customerInfo[field as keyof CustomerInfo]?.trim()
      );
    },
    
    isReadyForPayment: () => {
      return store.clientSecret && store.currentOrderId && !store.isLoading;
    },
    
    // Action selectors
    actions: {
      setCustomerInfo: store.setCustomerInfo,
      createPaymentIntent: store.createPaymentIntent,
      confirmPayment: store.confirmPayment,
      getOrderStatus: store.getOrderStatus,
      resetCheckout: store.resetCheckout,
      setLoading: store.setLoading,
      setError: store.setError,
      setPaymentStatus: store.setPaymentStatus
    }
  };
};