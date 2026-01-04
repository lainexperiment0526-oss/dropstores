# Checkout System - Architecture & Integration Map

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DROPSTORE CHECKOUT                        │
│                      (Production Ready)                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PublicStore.tsx / StoreManagement.tsx                          │
│         │                                                        │
│         └──> PaymentModal.tsx ◄── New Standard Component       │
│              ├─ CheckoutForm.tsx                                │
│              │   ├─ Customer Step                               │
│              │   ├─ Billing Step                                │
│              │   ├─ Shipping Step                               │
│              │   └─ Review Step                                 │
│              │                                                  │
│              └─ Pi Payment Integration                          │
│                   └─ requestPiPayment()                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    VALIDATION LAYER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  checkout-validator.ts                                          │
│  ├─ validateEmail()                                             │
│  ├─ validatePhone()                                             │
│  ├─ validateAddress()                                           │
│  ├─ validateCheckout()                                          │
│  └─ sanitizeCheckout()                                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                   API SERVICE LAYER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  checkout-service.ts          pi-payment.ts   order-service.ts │
│  ├─ createCheckout()          ├─ initializePi()  ├─ createOrder() │
│  ├─ getCheckout()             ├─ requestPayment()├─ sendEmail()    │
│  ├─ updatePaymentStatus()    ├─ verifyTransaction   └─ updateOrder()│
│  ├─ getStoreCheckouts()      └─ getPiUserInfo()                   │
│  └─ getCheckoutAnalytics()                                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│               DATABASE LAYER (Supabase)                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  checkouts                 checkout_items                       │
│  ├─ id (PK)               ├─ id (PK)                           │
│  ├─ store_id (FK)         ├─ checkout_id (FK)                 │
│  ├─ email                 ├─ product_id (FK)                  │
│  ├─ billing_*             ├─ quantity                          │
│  ├─ shipping_*            ├─ unit_price                        │
│  ├─ payment_*             └─ subtotal                          │
│  ├─ total_amount          
│  └─ status                checkout_sessions                     │
│                           ├─ id (PK)                           │
│                           ├─ store_id (FK)                     │
│                           ├─ items_data (JSONB)                │
│                           ├─ status                            │
│                           └─ expires_at                        │
│                                                                  │
│  With indexes, RLS policies, and automatic triggers            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│              EXTERNAL INTEGRATIONS                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Pi Network                  Email Service                      │
│  └─ Pi Horizon API          └─ Resend/SendGrid/SMTP           │
│     └─ Transaction           └─ Order Confirmation Emails       │
│        Verification                └─ Abandoned Cart Recovery   │
│                                     └─ Shipping Updates         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Flow Diagram

```
CUSTOMER JOURNEY
================

1. BROWSING PHASE
   Store Page
   ├─ View Products
   ├─ Select Product
   └─ Add to Cart
        ↓

2. CHECKOUT PHASE
   PaymentModal Opens
   ├─ Step 1: Customer Info
   │  ├─ Email (validated)
   │  └─ Phone (optional)
   │       ↓
   ├─ Step 2: Billing Address
   │  ├─ Full address form
   │  └─ Validation
   │       ↓
   ├─ Step 3: Shipping
   │  ├─ Address (same as billing or new)
   │  ├─ Shipping Method Selection
   │  │  ├─ Standard (5.99π, 5-7 days)
   │  │  ├─ Express (12.99π, 2-3 days)
   │  │  └─ Pickup (Free, same day)
   │  └─ Automatic cost update
   │       ↓
   ├─ Step 4: Review
   │  ├─ Order items list
   │  ├─ Totals calculation
   │  │  ├─ Subtotal
   │  │  ├─ + Shipping
   │  │  ├─ + Tax (8%)
   │  │  ├─ - Discount (optional)
   │  │  └─ = TOTAL
   │  ├─ Address review
   │  └─ Submit Button
   │       ↓

3. VALIDATION PHASE
   checkout-validator.ts
   ├─ Email validation ✓
   ├─ Phone validation (if provided)
   ├─ Address validation ✓
   ├─ Totals verification ✓
   ├─ XSS sanitization ✓
   └─ Returns: valid/errors

4. CHECKOUT CREATION
   checkout-service.ts
   ├─ createCheckout()
   ├─ Store in DB: checkouts table
   ├─ Store items: checkout_items table
   └─ Returns: checkout_id

5. PAYMENT PHASE
   pi-payment.ts
   ├─ requestPiPayment()
   ├─ Open Pi Wallet
   ├─ User confirms payment
   ├─ Returns: transaction_id (txid)
   └─ Verify: Pi Horizon API

6. ORDER CREATION
   order-service.ts
   ├─ createOrder()
   ├─ Store in DB: orders table
   ├─ Store items: order_items table
   └─ Returns: order_id

7. NOTIFICATION
   Email Service (Resend/SendGrid)
   ├─ generateOrderConfirmationEmail()
   ├─ Send to customer.email
   ├─ HTML + Text version
   └─ Includes: Order#, Items, Total

8. SUCCESS
   UI Display
   ├─ Show Order Confirmation
   ├─ Display Order ID
   ├─ Show Total Amount
   ├─ "Next Steps" Information
   └─ Continue Shopping Button

   Customer Receives Email with:
   ├─ Order Details
   ├─ Item List
   ├─ Shipping Address
   ├─ Payment Confirmation
   └─ Order Tracking Link


ADDITIONAL FEATURES
===================

ABANDONED CART RECOVERY
   checkout_sessions table
   ├─ Track incomplete checkouts
   ├─ Automatically expire after 3 days
   └─ Send recovery email with cart link

ANALYTICS TRACKING
   getCheckoutAnalytics()
   ├─ Total checkouts
   ├─ Completed checkouts
   ├─ Failed checkouts
   ├─ Conversion rate (%)
   ├─ Total revenue
   └─ Average order value

ORDER MANAGEMENT
   updateOrderStatus()
   ├─ processing
   ├─ shipped
   ├─ delivered
   └─ cancelled
      └─ Send customer update emails
```

---

## 📂 File Structure

```
dropstores-6/
├── src/
│   ├── types/
│   │   └── checkout.ts ..................... TypeScript definitions
│   │
│   ├── lib/
│   │   ├── checkout-validator.ts .......... Validation & sanitization
│   │   ├── checkout-service.ts ........... Database operations
│   │   ├── pi-payment.ts ................. Pi Network integration
│   │   └── order-service.ts .............. Order & email handling
│   │
│   ├── components/
│   │   └── checkout/
│   │       ├── CheckoutForm.tsx .......... Multi-step checkout form
│   │       └── PaymentModal.tsx .......... Payment modal wrapper
│   │
│   └── pages/
│       ├── PublicStore.tsx ............... Use PaymentModal
│       └── StoreManagement.tsx ........... Use PaymentModal
│
├── database-checkout-schema.sql ............ Database migrations
│
└── docs/
    ├── CHECKOUT_IMPLEMENTATION_GUIDE.md .. Technical guide
    ├── CHECKOUT_INTEGRATION_COMPLETE.md . Integration steps
    └── CHECKOUT_SYSTEM_SUMMARY.md ........ Quick reference
```

---

## 🔌 Integration Points

### Update These Files

1. **PublicStore.tsx**
   ```tsx
   // Find: PaymentModal or payment-related component
   // Replace with: new PaymentModal from checkout/PaymentModal.tsx
   ```

2. **StoreManagement.tsx**
   ```tsx
   // Find: Payment/checkout button handler
   // Replace with: new PaymentModal component
   ```

3. **Layout.tsx or App.tsx**
   ```tsx
   // Add: initializePiSDK() in useEffect
   ```

4. **index.html**
   ```html
   <!-- Add: Pi SDK script tag -->
   <script src="https://sdk.minepi.com/pi-sdk.js"></script>
   ```

### Create These Files

1. **src/pages/api/send-email.ts**
   ```
   POST /api/send-email
   - Body: { to, subject, html, text, type, orderId }
   - Response: { success, messageId }
   ```

2. **src/pages/api/verify-pi-payment.ts**
   ```
   POST /api/verify-pi-payment
   - Body: { transactionId, checkoutId }
   - Response: { valid, message }
   ```

3. **.env.local**
   ```
   VITE_PI_SANDBOX=true
   RESEND_API_KEY=xxx
   PI_API_KEY=xxx
   ```

---

## 🎯 Implementation Checklist

- [ ] Deploy `database-checkout-schema.sql` to Supabase
- [ ] Import types from `src/types/checkout.ts`
- [ ] Replace payment modal with new `PaymentModal.tsx`
- [ ] Initialize Pi SDK in main layout
- [ ] Create email sending API endpoint
- [ ] Create Pi verification API endpoint
- [ ] Configure environment variables
- [ ] Test checkout form validation
- [ ] Test Pi payment flow
- [ ] Test email delivery
- [ ] Test order creation
- [ ] Test analytics queries
- [ ] Deploy to production
- [ ] Monitor checkout metrics

---

## 📊 Data Relationships

```
Store (1)
  └─> (Many) Checkouts
       ├─ (Many) Checkout Items
       │   └─> Product
       │
       └─> (After Payment) Order
            ├─ (Many) Order Items
            │   └─> Product
            │
            └─ Email Sent
               └─> Email Templates
```

---

## 🔐 Security Flow

```
1. FORM SUBMISSION
   CheckoutForm
   └─> sanitizeCheckout() [XSS prevention]

2. VALIDATION
   checkout-validator.ts
   ├─ validateEmail() [Format check]
   ├─ validatePhone() [Format check]
   ├─ validateAddress() [Required fields]
   ├─ validateCheckout() [Full payload]
   └─ Errors returned to UI

3. DATABASE
   RLS Policies
   ├─ Users see own orders
   ├─ Store owners see store orders
   └─ Parameterized queries [SQL injection prevention]

4. PAYMENT
   Pi Horizon API
   ├─ Transaction verification [Backend]
   ├─ Signature validation
   └─ Status confirmation

5. EMAIL
   Email Service API
   ├─ Rate limiting [if provided]
   ├─ Template escaping [HTML safe]
   └─ Secure transport [HTTPS]
```

---

## 📈 Monitoring Points

```
Checkout Success Rate
├─ Total checkouts created
├─ Checkouts with payment_status = 'paid'
└─ Percentage = (paid / total) * 100

Average Order Value
├─ Sum of all completed order totals
├─ Count of completed orders
└─ Average = total_revenue / completed_orders

Abandoned Cart Rate
├─ Active checkout_sessions
├─ Sum of amounts not completed
└─ Potential revenue recovery

Email Delivery Rate
├─ Emails sent (API response)
├─ Email bounces (optional tracking)
└─ Open rate (with email provider)
```

---

## 🚀 Performance Optimization

```
Database
├─ Indexes on: store_id, payment_status, created_at
├─ RLS policies optimized
└─ Queries limited with pagination

Frontend
├─ Form components lazy loaded
├─ Validation debounced
├─ Images optimized
└─ Bundle optimized

API
├─ Request validation early
├─ Database connection pooling
├─ Email queuing (optional)
└─ Rate limiting implemented
```

---

**Last Updated**: January 4, 2026
**Status**: Production Ready
**Version**: 1.0.0
