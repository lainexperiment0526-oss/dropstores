/**
 * Checkout Types - Standard format for DropStore/Pi Network
 * Based on industry standards (Shopify, Stripe) adapted for Pi Network
 */

// Customer Identity
export interface CheckoutCustomer {
  customer_id: string | null; // UUID or null for guests
  email: string;
  phone?: string;
}

// Address (reusable for billing and shipping)
export interface Address {
  full_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// Billing Details
export interface BillingDetails {
  address: Address;
}

// Shipping Details
export interface ShippingDetails {
  address: Address;
  shipping_method: 'standard' | 'express' | 'pickup' | 'digital';
  shipping_cost: number;
}

// Order Item
export interface OrderItem {
  product_id: string;
  variant_id?: string;
  title: string;
  quantity: number;
  price: number; // Unit price
  subtotal: number; // price * quantity
}

// Discount
export interface Discount {
  code?: string;
  amount: number;
  percentage?: number;
}

// Tax
export interface Tax {
  rate: number; // 0.08 for 8%
  amount: number;
}

// Payment Details - Pi Network specific
export interface PaymentDetails {
  method: 'pi_wallet' | 'card' | 'other';
  currency: 'PI'; // Pi Network uses PI
  amount_total: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  transaction_id?: string; // Pi Horizon transaction hash
  timestamp?: string;
}

// Checkout Metadata
export interface CheckoutMetadata {
  checkout_id: string;
  order_id?: string;
  source: 'web' | 'app' | 'droplink';
  ip_address?: string;
  device: 'mobile' | 'desktop';
  user_agent?: string;
  created_at: string;
  updated_at?: string;
}

// Complete Checkout Object
export interface Checkout {
  // Customer Info
  customer: CheckoutCustomer;

  // Addresses
  billing?: BillingDetails;
  shipping?: ShippingDetails;

  // Order Data
  items: OrderItem[];
  subtotal: number;

  // Discounts & Taxes
  discount?: Discount;
  tax?: Tax;

  // Payment
  payment: PaymentDetails;

  // Metadata
  metadata: CheckoutMetadata;

  // Additional fields
  notes?: string;
  gift_message?: string;
}

// Minimal Checkout (for digital products / Pi Apps)
export interface MinimalCheckout {
  email: string;
  pi_wallet?: string;
  items: OrderItem[];
  amount_total: number;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

// Checkout Request Payload
export interface CheckoutPayload extends Checkout {
  store_id: string; // Which store this checkout is for
}

// Checkout Response (from API)
export interface CheckoutResponse {
  success: boolean;
  checkout_id: string;
  order_id: string;
  payment_link?: string; // Pi payment link
  message: string;
  data?: Checkout;
}

// Checkout Status
export type CheckoutStatus = 'draft' | 'pending' | 'completed' | 'failed' | 'abandoned';

// Checkout Session (for tracking)
export interface CheckoutSession {
  id: string;
  store_id: string;
  customer: CheckoutCustomer;
  items: OrderItem[];
  status: CheckoutStatus;
  created_at: string;
  updated_at: string;
  expires_at: string;
  data: Checkout;
}
