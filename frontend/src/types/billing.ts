import type { Patient } from './patient';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'insurance' | 'online';

export interface BillingItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Billing {
  id: string;
  patientId: string;
  appointmentId: string | null;
  invoiceNo: string;
  items: BillingItem[];
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  paidAmount: string;
  dueAmount: string;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  Patient?: Patient;
}

export interface BillingFormData {
  patientId: string;
  appointmentId: string;
  items: BillingItem[];
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  dueDate: string;
  paymentMethod: string;
}
