# Customer Checkout Details - Merchant Dashboard Guide

## ✅ What's Implemented

Customer checkout information is now **fully collected, stored, and displayed** in the merchant dashboard.

---

## 📋 Customer Information Collected at Checkout

When a customer completes a purchase, the following information is collected:

### Customer Details
- **Name**: Customer's full name
- **Email**: Contact email address
- **Phone**: Optional phone number
- **Shipping Address**: Delivery address

### Order Information
- **Items Purchased**: Product name, quantity, price
- **Variant Details**: Selected product variant (if any)
- **Gift Message**: Personal message (if included)
- **Order Total**: Total amount paid in Pi (π)
- **Timestamp**: Date and time of purchase

### Additional Data
- **Order Notes**: Any special notes from customer
- **Payment Status**: paid/pending/failed/cancelled
- **Order Status**: pending/confirmed/shipped/delivered/completed

---

## 📊 How to View Customer Details in Merchant Dashboard

### Step 1: Go to Store Management
1. Login to your store
2. Click "Store Management"
3. Select your store (Droplink)

### Step 2: Navigate to Orders Tab
1. Click the **"Orders"** tab
2. See all orders from customers

### Step 3: View Order Details
Each order card shows:

**Customer Information**:
- 📧 Customer email
- 📱 Customer phone (if provided)
- 📍 Shipping address (if provided)
- 📝 Order notes (if any)

**Order Summary**:
- ✅ Status badge (Pending, Paid, Completed, etc.)
- 💰 Total amount in Pi (π)
- 📅 Date and time of order

**Items Purchased**:
- Product name
- Selected variant (if any)
- 🎁 Gift message (if added)
- Quantity
- Item total price

---

## 🔄 Order Status Workflow

Track orders through their lifecycle:

| Status | Meaning |
|--------|---------|
| **Pending** | Order placed, awaiting confirmation |
| **Paid** | Payment received |
| **Confirmed** | Order confirmed and being prepared |
| **Shipped** | Order has been shipped |
| **Delivered** | Order delivered to customer |
| **Completed** | Order completed and closed |
| **Cancelled** | Order cancelled by merchant or customer |

### How to Update Status:
1. Open an order card
2. Click the status dropdown
3. Select new status
4. Status updates immediately

---

## 💾 Database Fields Stored

All customer information is stored in the `orders` table:

```typescript
interface Order {
  id: string;                    // Unique order ID
  customer_name: string;         // Full name
  customer_email: string;        // Email
  customer_phone: string | null; // Phone
  shipping_address: string | null; // Address
  notes: string | null;          // Special notes
  items: OrderItem[];            // Array of purchased items
  total: number;                 // Total amount (π)
  status: string;                // Current status
  created_at: string;            // Timestamp
  pi_payment_id: string | null;  // Pi payment reference
  pi_txid: string | null;        // Pi transaction ID
}

interface OrderItem {
  product_id: string;
  variant_id?: string;
  name: string;
  quantity: number;
  price: number;
  variant_name?: string;
  gift_message?: string;
  product_type?: string;
  sku?: string;
}
```

---

## 🎯 Features Available to Merchants

### ✅ View Customer Info
- Full contact details
- Shipping address
- Order notes and special requests

### ✅ Track Items
- See exactly what was ordered
- View variant selections
- See gift messages

### ✅ Manage Orders
- Update order status
- Track fulfillment progress
- Mark as delivered/completed

### ✅ Analytics
- View total orders
- Track pending orders
- See completed orders count
- Calculate revenue

---

## 📱 Mobile Friendly

The order dashboard is fully responsive:
- ✅ Works on desktop
- ✅ Works on tablet
- ✅ Works on mobile
- ✅ Easy status updates on any device

---

## 🔐 Data Privacy

All customer information is:
- ✅ Securely stored in Supabase
- ✅ Only visible to store owner
- ✅ Protected with Row Level Security (RLS)
- ✅ Never shared publicly

---

## 📧 Customer Flow

```
Customer visits store
        ↓
Adds product to cart
        ↓
Fills checkout form:
  - Name
  - Email
  - Phone
  - Address
  - Special requests
  - Gift message
        ↓
Submits order
        ↓
Order saved to database
        ↓
Appears in Merchant Dashboard
        ↓
Merchant can view and update status
        ↓
Customer receives order confirmation
```

---

## ✨ Recent Enhancements

### Improved Order Display:
- **Status Badges**: Color-coded status (green for completed, red for cancelled)
- **Better Organization**: Grouped customer info, order summary, and items
- **Item Details**: Shows variant names and gift messages
- **Time Information**: Displays full date and time of order
- **Emoji Icons**: Quick visual reference (📧 email, 📱 phone, 📍 address, etc.)

---

## 🚀 Summary

The merchant dashboard now provides **complete visibility** into:
- ✅ Who bought what
- ✅ How much they paid
- ✅ What address to ship to
- ✅ Any special requests or gifts
- ✅ Real-time order status updates

All customer checkout details flow seamlessly from the public store → database → merchant dashboard.
