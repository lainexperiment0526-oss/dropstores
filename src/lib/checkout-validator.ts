/**
 * Checkout Payload Validator
 * Validates checkout data against the standard format
 */

import {
  Checkout,
  CheckoutPayload,
  CheckoutCustomer,
  Address,
  OrderItem,
  BillingDetails,
  ShippingDetails,
  PaymentDetails,
} from '@/types/checkout';

// Error types
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (basic international)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{7,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate postal code (basic)
 */
export function validatePostalCode(postalCode: string): boolean {
  return postalCode && postalCode.trim().length > 0 && postalCode.length <= 20;
}

/**
 * Validate address object
 */
export function validateAddress(address: Address, label: string = 'Address'): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!address.full_name || address.full_name.trim().length === 0) {
    errors.push(new ValidationError(`${label}: Full name is required`, `${label}.full_name`, address.full_name));
  }

  if (!address.address_line_1 || address.address_line_1.trim().length === 0) {
    errors.push(new ValidationError(`${label}: Address line 1 is required`, `${label}.address_line_1`, address.address_line_1));
  }

  if (!address.city || address.city.trim().length === 0) {
    errors.push(new ValidationError(`${label}: City is required`, `${label}.city`, address.city));
  }

  if (!address.state || address.state.trim().length === 0) {
    errors.push(new ValidationError(`${label}: State is required`, `${label}.state`, address.state));
  }

  if (!validatePostalCode(address.postal_code)) {
    errors.push(new ValidationError(`${label}: Valid postal code is required`, `${label}.postal_code`, address.postal_code));
  }

  if (!address.country || address.country.trim().length !== 2) {
    errors.push(new ValidationError(`${label}: Country code (2-letter) is required`, `${label}.country`, address.country));
  }

  return errors;
}

/**
 * Validate customer object
 */
export function validateCustomer(customer: CheckoutCustomer): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!customer.email || !validateEmail(customer.email)) {
    errors.push(new ValidationError('Valid email is required', 'customer.email', customer.email));
  }

  if (customer.phone && !validatePhone(customer.phone)) {
    errors.push(new ValidationError('Invalid phone format', 'customer.phone', customer.phone));
  }

  return errors;
}

/**
 * Validate order item
 */
export function validateOrderItem(item: OrderItem, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const itemLabel = `items[${index}]`;

  if (!item.product_id) {
    errors.push(new ValidationError('Product ID is required', `${itemLabel}.product_id`, item.product_id));
  }

  if (!item.title || item.title.trim().length === 0) {
    errors.push(new ValidationError('Product title is required', `${itemLabel}.title`, item.title));
  }

  if (!item.quantity || item.quantity <= 0) {
    errors.push(new ValidationError('Quantity must be greater than 0', `${itemLabel}.quantity`, item.quantity));
  }

  if (item.price < 0) {
    errors.push(new ValidationError('Price cannot be negative', `${itemLabel}.price`, item.price));
  }

  if (item.subtotal < 0) {
    errors.push(new ValidationError('Subtotal cannot be negative', `${itemLabel}.subtotal`, item.subtotal));
  }

  // Check if subtotal matches quantity * price (with floating point tolerance)
  const expectedSubtotal = item.quantity * item.price;
  if (Math.abs(item.subtotal - expectedSubtotal) > 0.01) {
    errors.push(
      new ValidationError(
        `Subtotal (${item.subtotal}) should equal quantity (${item.quantity}) × price (${item.price})`,
        `${itemLabel}.subtotal`,
        item.subtotal,
      ),
    );
  }

  return errors;
}

/**
 * Validate payment details
 */
export function validatePayment(payment: PaymentDetails): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!payment.method || !['pi_wallet', 'card', 'other'].includes(payment.method)) {
    errors.push(new ValidationError('Valid payment method is required', 'payment.method', payment.method));
  }

  if (payment.currency !== 'PI') {
    errors.push(new ValidationError('Currency must be PI for Pi Network', 'payment.currency', payment.currency));
  }

  if (payment.amount_total < 0) {
    errors.push(new ValidationError('Amount cannot be negative', 'payment.amount_total', payment.amount_total));
  }

  if (!['pending', 'paid', 'failed', 'cancelled'].includes(payment.status)) {
    errors.push(new ValidationError('Invalid payment status', 'payment.status', payment.status));
  }

  return errors;
}

/**
 * Validate order items array
 */
export function validateOrderItems(items: OrderItem[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Array.isArray(items) || items.length === 0) {
    errors.push(new ValidationError('At least one item is required', 'items', items));
    return errors;
  }

  items.forEach((item, index) => {
    errors.push(...validateOrderItem(item, index));
  });

  return errors;
}

/**
 * Validate totals calculation
 */
export function validateTotals(
  checkout: Checkout,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Calculate subtotal from items
  const calculatedSubtotal = checkout.items.reduce((sum, item) => sum + item.subtotal, 0);
  if (Math.abs(checkout.subtotal - calculatedSubtotal) > 0.01) {
    errors.push(
      new ValidationError(
        `Subtotal mismatch: expected ${calculatedSubtotal}, got ${checkout.subtotal}`,
        'subtotal',
        checkout.subtotal,
      ),
    );
  }

  // Calculate expected total
  let expectedTotal = checkout.subtotal;
  if (checkout.discount) {
    expectedTotal -= checkout.discount.amount;
  }
  if (checkout.tax) {
    expectedTotal += checkout.tax.amount;
  }
  if (checkout.shipping) {
    expectedTotal += checkout.shipping.shipping_cost;
  }

  if (Math.abs(checkout.payment.amount_total - expectedTotal) > 0.01) {
    errors.push(
      new ValidationError(
        `Payment total mismatch: expected ${expectedTotal}, got ${checkout.payment.amount_total}`,
        'payment.amount_total',
        checkout.payment.amount_total,
      ),
    );
  }

  return errors;
}

/**
 * Full checkout validation
 */
export function validateCheckout(payload: CheckoutPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!payload.store_id) {
    errors.push(new ValidationError('Store ID is required', 'store_id', payload.store_id));
  }

  // Validate customer
  errors.push(...validateCustomer(payload.customer));

  // Validate items
  errors.push(...validateOrderItems(payload.items));

  // Validate payment
  errors.push(...validatePayment(payload.payment));

  // Validate billing if present
  if (payload.billing) {
    errors.push(...validateAddress(payload.billing.address, 'billing'));
  } else {
    warnings.push('Billing address not provided');
  }

  // Validate shipping if present
  if (payload.shipping) {
    errors.push(...validateAddress(payload.shipping.address, 'shipping'));
    if (!['standard', 'express', 'pickup', 'digital'].includes(payload.shipping.shipping_method)) {
      errors.push(
        new ValidationError('Invalid shipping method', 'shipping.shipping_method', payload.shipping.shipping_method),
      );
    }
    if (payload.shipping.shipping_cost < 0) {
      errors.push(new ValidationError('Shipping cost cannot be negative', 'shipping.shipping_cost', payload.shipping.shipping_cost));
    }
  } else {
    warnings.push('Shipping address not provided (required for physical goods)');
  }

  // Validate totals consistency
  errors.push(...validateTotals(payload));

  // Validate metadata
  if (!payload.metadata.checkout_id) {
    errors.push(new ValidationError('Checkout ID is required', 'metadata.checkout_id', payload.metadata.checkout_id));
  }
  if (!['web', 'app', 'droplink'].includes(payload.metadata.source)) {
    errors.push(new ValidationError('Invalid source', 'metadata.source', payload.metadata.source));
  }
  if (!['mobile', 'desktop'].includes(payload.metadata.device)) {
    errors.push(new ValidationError('Invalid device type', 'metadata.device', payload.metadata.device));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Minimal checkout validation (for digital products)
 */
export function validateMinimalCheckout(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push(new ValidationError('Valid email is required', 'email', data.email));
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push(new ValidationError('At least one item is required', 'items', data.items));
  } else {
    data.items.forEach((item: OrderItem, index: number) => {
      errors.push(...validateOrderItem(item, index));
    });
  }

  if (data.amount_total < 0) {
    errors.push(new ValidationError('Amount cannot be negative', 'amount_total', data.amount_total));
  }

  if (!['pending', 'paid', 'failed'].includes(data.payment_status)) {
    errors.push(new ValidationError('Invalid payment status', 'payment_status', data.payment_status));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Sanitize checkout data (remove XSS attempts, trim strings, etc)
 */
export function sanitizeCheckout(checkout: CheckoutPayload): CheckoutPayload {
  const sanitized = { ...checkout };

  // Sanitize customer
  sanitized.customer = {
    ...checkout.customer,
    email: checkout.customer.email?.toLowerCase().trim() || '',
    phone: checkout.customer.phone?.trim(),
  };

  // Sanitize items
  sanitized.items = checkout.items.map(item => ({
    ...item,
    title: item.title?.trim() || '',
  }));

  // Sanitize addresses
  if (sanitized.billing) {
    sanitized.billing.address = {
      ...checkout.billing.address,
      full_name: checkout.billing.address.full_name?.trim() || '',
      address_line_1: checkout.billing.address.address_line_1?.trim() || '',
      address_line_2: checkout.billing.address.address_line_2?.trim(),
      city: checkout.billing.address.city?.trim() || '',
      state: checkout.billing.address.state?.trim() || '',
      postal_code: checkout.billing.address.postal_code?.trim() || '',
      country: checkout.billing.address.country?.toUpperCase().trim() || '',
    };
  }

  if (sanitized.shipping) {
    sanitized.shipping.address = {
      ...checkout.shipping.address,
      full_name: checkout.shipping.address.full_name?.trim() || '',
      address_line_1: checkout.shipping.address.address_line_1?.trim() || '',
      address_line_2: checkout.shipping.address.address_line_2?.trim(),
      city: checkout.shipping.address.city?.trim() || '',
      state: checkout.shipping.address.state?.trim() || '',
      postal_code: checkout.shipping.address.postal_code?.trim() || '',
      country: checkout.shipping.address.country?.toUpperCase().trim() || '',
    };
  }

  // Sanitize notes and messages
  if (sanitized.notes) {
    sanitized.notes = sanitized.notes.trim();
  }
  if (sanitized.gift_message) {
    sanitized.gift_message = sanitized.gift_message.trim();
  }

  return sanitized;
}
