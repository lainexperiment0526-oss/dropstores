/**
 * Order Confirmation & Email System
 * Handles order creation and customer notifications
 */

import { Checkout, CheckoutPayload } from '@/types/checkout';
import { supabase } from '@/integrations/supabase/client';

interface OrderData {
  id: string;
  checkout_id: string;
  store_id: string;
  customer_email: string;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Create order from checkout
 */
export async function createOrder(
  checkout: Checkout,
  checkoutId: string,
  storeId: string,
): Promise<{ success: boolean; orderId?: string; message: string }> {
  try {
    const orderId = `ORD-${checkoutId.slice(0, 8).toUpperCase()}-${Date.now()}`;

    const { error } = await supabase
      .from('orders')
      .insert([
        {
          id: orderId,
          store_id: storeId,
          customer_email: checkout.customer.email,
          customer_phone: checkout.customer.phone,
          customer_name: checkout.billing?.address.full_name || 'Customer',

          // Billing
          billing_name: checkout.billing?.address.full_name,
          billing_address_1: checkout.billing?.address.address_line_1,
          billing_address_2: checkout.billing?.address.address_line_2,
          billing_city: checkout.billing?.address.city,
          billing_state: checkout.billing?.address.state,
          billing_postal_code: checkout.billing?.address.postal_code,
          billing_country: checkout.billing?.address.country,

          // Shipping
          shipping_name: checkout.shipping?.address.full_name,
          shipping_address_1: checkout.shipping?.address.address_line_1,
          shipping_address_2: checkout.shipping?.address.address_line_2,
          shipping_city: checkout.shipping?.address.city,
          shipping_state: checkout.shipping?.address.state,
          shipping_postal_code: checkout.shipping?.address.postal_code,
          shipping_country: checkout.shipping?.address.country,

          // Totals
          subtotal: checkout.subtotal,
          shipping_cost: checkout.shipping?.shipping_cost || 0,
          tax_amount: checkout.tax?.amount || 0,
          discount_amount: checkout.discount?.amount || 0,
          total: checkout.payment.amount_total,

          // Status
          status: 'processing',
          payment_status: checkout.payment.status,
          payment_method: checkout.payment.method,
          transaction_id: checkout.payment.transaction_id,

          // Additional
          notes: checkout.notes,
          gift_message: checkout.gift_message,
          source: checkout.metadata.source,
        },
      ]);

    if (error) throw error;

    // Add order items
    for (const item of checkout.items) {
      const { error: itemError } = await supabase
        .from('order_items')
        .insert([
          {
            order_id: orderId,
            product_id: item.product_id,
            variant_id: item.variant_id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          },
        ]);

      if (itemError) {
        console.error('Error adding order item:', itemError);
      }
    }

    return {
      success: true,
      orderId,
      message: 'Order created successfully',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating order:', error);
    return {
      success: false,
      message: `Failed to create order: ${message}`,
    };
  }
}

/**
 * Generate order confirmation email HTML
 */
export function generateOrderConfirmationEmail(
  checkout: Checkout,
  orderId: string,
  storeId: string,
): EmailTemplate {
  const orderItems = checkout.items
    .map(
      item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.title}</strong><br>
        SKU: ${item.product_id.slice(0, 8)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
        π${item.price.toFixed(2)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
        π${item.subtotal.toFixed(2)}
      </td>
    </tr>
  `,
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }
    table { width: 100%; border-collapse: collapse; }
    .totals { margin-top: 20px; padding-top: 20px; border-top: 2px solid #ddd; }
    .total-row { display: flex; justify-content: space-between; margin: 10px 0; }
    .total-row.final { font-size: 20px; font-weight: bold; color: #667eea; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Order Confirmed</h1>
      <p>Thank you for your purchase!</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Order Details</div>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Order Date:</strong> ${new Date(checkout.metadata.created_at).toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-weight: bold;">Processing</span></p>
      </div>

      <div class="section">
        <div class="section-title">Items Ordered</div>
        <table>
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="padding: 12px; text-align: left;">Product</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <strong>π${checkout.subtotal.toFixed(2)}</strong>
          </div>
          ${
            checkout.shipping
              ? `<div class="total-row">
            <span>Shipping (${checkout.shipping.shipping_method}):</span>
            <strong>π${checkout.shipping.shipping_cost.toFixed(2)}</strong>
          </div>`
              : ''
          }
          ${
            checkout.tax
              ? `<div class="total-row">
            <span>Tax:</span>
            <strong>π${checkout.tax.amount.toFixed(2)}</strong>
          </div>`
              : ''
          }
          ${
            checkout.discount
              ? `<div class="total-row">
            <span>Discount (${checkout.discount.code || 'Applied'}):</span>
            <strong>-π${checkout.discount.amount.toFixed(2)}</strong>
          </div>`
              : ''
          }
          <div class="total-row final">
            <span>Total:</span>
            <strong>π${checkout.payment.amount_total.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Shipping Address</div>
        <p>
          ${checkout.shipping?.address.full_name}<br>
          ${checkout.shipping?.address.address_line_1}
          ${checkout.shipping?.address.address_line_2 ? '<br>' + checkout.shipping.address.address_line_2 : ''}<br>
          ${checkout.shipping?.address.city}, ${checkout.shipping?.address.state} ${checkout.shipping?.address.postal_code}<br>
          ${checkout.shipping?.address.country}
        </p>
      </div>

      <div class="section">
        <div class="section-title">Payment Method</div>
        <p><strong>Method:</strong> Pi Wallet</p>
        <p><strong>Status:</strong> <span style="background: #e3f2fd; color: #1565c0; padding: 4px 8px; border-radius: 4px; font-weight: bold;">Paid</span></p>
        ${checkout.payment.transaction_id ? `<p><strong>Transaction ID:</strong> ${checkout.payment.transaction_id.slice(0, 16)}...</p>` : ''}
      </div>

      ${
        checkout.notes
          ? `<div class="section">
        <div class="section-title">Order Notes</div>
        <p>${checkout.notes}</p>
      </div>`
          : ''
      }

      <div class="section">
        <a href="https://dropstore.example.com/orders/${orderId}" class="button">
          Track Your Order
        </a>
      </div>
    </div>

    <div class="footer">
      <p>If you have any questions, please reply to this email or visit our help center.</p>
      <p>&copy; 2026 DropStore. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
ORDER CONFIRMATION
==================

Order ID: ${orderId}
Date: ${new Date(checkout.metadata.created_at).toLocaleDateString()}

ITEMS ORDERED:
${checkout.items.map(item => `- ${item.title} x${item.quantity} π${item.subtotal.toFixed(2)}`).join('\n')}

TOTALS:
Subtotal: π${checkout.subtotal.toFixed(2)}
${checkout.shipping ? `Shipping: π${checkout.shipping.shipping_cost.toFixed(2)}` : ''}
${checkout.tax ? `Tax: π${checkout.tax.amount.toFixed(2)}` : ''}
${checkout.discount ? `Discount: -π${checkout.discount.amount.toFixed(2)}` : ''}
---
TOTAL: π${checkout.payment.amount_total.toFixed(2)}

SHIPPING ADDRESS:
${checkout.shipping?.address.full_name}
${checkout.shipping?.address.address_line_1}
${checkout.shipping?.address.address_line_2 ? checkout.shipping.address.address_line_2 + '\n' : ''}
${checkout.shipping?.address.city}, ${checkout.shipping?.address.state} ${checkout.shipping?.address.postal_code}
${checkout.shipping?.address.country}

Payment Status: Paid (Pi Wallet)
  `;

  return {
    subject: `Order Confirmation #${orderId}`,
    html,
    text,
  };
}

/**
 * Send order confirmation email (requires backend API)
 */
export async function sendOrderConfirmationEmail(
  checkout: Checkout,
  orderId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const emailData = generateOrderConfirmationEmail(checkout, orderId, '');

    // Call your backend email API
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: checkout.customer.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        type: 'order_confirmation',
        orderId,
      }),
    });

    const data = await response.json();
    if (data.success) {
      return { success: true, message: 'Confirmation email sent' };
    } else {
      return { success: false, message: data.message || 'Failed to send email' };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending email:', error);
    return {
      success: false,
      message: `Failed to send email: ${message}`,
    };
  }
}

/**
 * Generate abandoned cart recovery email
 */
export function generateAbandonedCartEmail(
  customerEmail: string,
  items: any[],
  total: number,
  recoveryLink: string,
): EmailTemplate {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #fff3cd; color: #856404; padding: 20px; text-align: center; border-radius: 4px; }
    .content { padding: 30px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Don't Miss Out! Complete Your Order</h2>
      <p>We noticed you left items in your cart</p>
    </div>
    
    <div class="content">
      <p>Hi there!</p>
      <p>We noticed you have items in your cart. Your order total is <strong>π${total.toFixed(2)}</strong></p>
      
      <p>Complete your purchase now:</p>
      <a href="${recoveryLink}" class="button">Return to Checkout</a>
      
      <p>Items in your cart:</p>
      <ul>
        ${items.map(item => `<li>${item.title} x${item.quantity} - π${item.subtotal.toFixed(2)}</li>`).join('')}
      </ul>
      
      <p>This offer expires in 3 days.</p>
    </div>
  </div>
</body>
</html>
  `;

  return {
    subject: 'Don\'t forget your items!',
    html,
    text: `Complete your order for π${total.toFixed(2)}: ${recoveryLink}`,
  };
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled',
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
    return { success: true, message: 'Order status updated' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message };
  }
}
