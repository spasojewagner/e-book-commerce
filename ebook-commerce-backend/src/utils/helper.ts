// src/utils/helper.ts
import { randomBytes } from 'crypto';

export const generateOrderId = (): string => `ORD-${Date.now()}-${randomBytes(6).toString('hex')}`;

// 192 random bits: download links can't be guessed.
export const generateDownloadToken = (): string => randomBytes(24).toString('hex');

export const calculateExpiryDate = (hours: number = 24): Date => new Date(Date.now() + hours * 60 * 60 * 1000);

export const toCents = (price: number): number => Math.round(price * 100);

export const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
