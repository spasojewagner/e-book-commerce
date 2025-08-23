// src/utils/helpers.ts

export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `ORD-${timestamp}-${random}`;
};

export const generateDownloadToken = (): string => {
  const random = Math.random().toString(36).substr(2);
  const timestamp = Date.now().toString(36);
  return `${random}${timestamp}`;
};

export const calculateExpiryDate = (hours: number = 24): Date => {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

export const formatPrice = (price: number): number => {
  return Math.round(price * 100); // Convert to cents for Stripe
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};