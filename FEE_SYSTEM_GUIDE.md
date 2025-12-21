# Fee System Setup Guide

## Overview
Added automatic platform fee (1π per product) and configurable delivery fees for physical products.

## Features Implemented

### 1. Platform Fee (Fixed)
- **Amount**: 1π per product (automatic)
- **Applied to**: All products
- **Display**: Shown in checkout breakdown
- **Purpose**: Marketplace listing fee

### 2. Delivery Fee (Configurable)
- **For**: Physical products only
- **Digital products**: Always free delivery
- **Merchant configurable**: Set via DeliverySettings component
- **Free delivery threshold**: Optional minimum order amount

## Database Migration

Run this SQL to add fee columns:

```sql
-- Apply the fee system update
\i database-fees-update.sql
```

Or manually run:
```powershell
cd "c:\Users\SIBIYA GAMING\dropstores"
psql -h YOUR_DB_HOST -U postgres -d YOUR_DB_NAME -f database-fees-update.sql
```

## New Files Created

### 1. `database-fees-update.sql`
Adds columns:
- `stores.delivery_fee` - Delivery charge (π)
- `stores.free_delivery_threshold` - Min order for free delivery
- `stores.delivery_enabled` - Toggle delivery option
- `products.platform_fee` - Fixed 1π per product
- `orders.subtotal` - Order subtotal
- `orders.delivery_fee` - Applied delivery fee
- `orders.platform_fee` - Applied platform fee
- `orders.discount_amount` - Discount applied

### 2. `src/components/store/DeliverySettings.tsx`
Merchant settings component for:
- Enable/disable delivery
- Set delivery fee amount
- Configure free delivery threshold
- View platform fee info

## Updated Files

### `PaymentModalEnhanced.tsx`
- Fetches store delivery settings
- Calculates fees dynamically:
  - Subtotal (product price × quantity)
  - Platform Fee (1π fixed)
  - Delivery Fee (for physical products)
  - Free delivery check (threshold)
- Shows detailed fee breakdown
- Updates all total displays

### `ProductFormEnhanced.tsx`
- Added platform fee notice on price field
- Informs merchants about 1π listing fee

## Fee Calculation Logic

```typescript
const platformFee = 1.00; // Fixed
const subtotal = product.price * quantity;

// Delivery fee logic
if (product.product_type === 'digital') {
  deliveryFee = 0; // Digital = Free
} else if (subtotal >= freeDeliveryThreshold) {
  deliveryFee = 0; // Free delivery threshold met
} else {
  deliveryFee = store.delivery_fee; // Apply delivery fee
}

const total = subtotal + platformFee + deliveryFee;
```

## Checkout Fee Breakdown Display

```
Subtotal:          20.00 π
Platform Fee:       1.00 π
Delivery Fee:       5.00 π (or FREE)
─────────────────────────
Total:             26.00 π
```

### Delivery Fee States:
1. **Digital Products**: "Digital delivery - No shipping fee"
2. **Free Threshold Met**: "Free delivery applied!"
3. **Physical Products**: Shows delivery fee amount

## Integration Steps

### 1. Add DeliverySettings to Store Management

```tsx
import { DeliverySettings } from '@/components/store/DeliverySettings';

// In StoreManagement.tsx or Settings page
<DeliverySettings storeId={storeId} />
```

### 2. Update PaymentModalEnhanced Calls

Add `storeId` prop:

```tsx
<PaymentModalEnhanced
  open={paymentOpen}
  onOpenChange={setPaymentOpen}
  cart={cart}
  cartTotal={cartTotal}
  storeName={storeName}
  storeId={storeId}  // ← Add this
  primaryColor={primaryColor}
  merchantWallet={merchantWallet}
  onSubmit={handleCheckout}
  submitting={submitting}
/>
```

### 3. Update Order Creation

When creating orders, save fee breakdown:

```tsx
const orderData = {
  // ... existing fields
  subtotal: subtotal,
  platform_fee: 1.00,
  delivery_fee: deliveryFee,
  discount_amount: discountAmount || 0,
  total_amount: finalTotal
};
```

## Example Scenarios

### Scenario 1: Digital Product
- Product: 20π
- Platform Fee: 1π
- Delivery: 0π (digital)
- **Total: 21π**

### Scenario 2: Physical Product with Delivery
- Product: 50π
- Platform Fee: 1π
- Delivery: 5π
- **Total: 56π**

### Scenario 3: Free Delivery Threshold Met
- Product: 100π (above 80π threshold)
- Platform Fee: 1π
- Delivery: ~~5π~~ 0π (FREE)
- **Total: 101π**

### Scenario 4: Multiple Items
- Products: 2 × 15π = 30π
- Platform Fee: 1π (per product listing, not per quantity)
- Delivery: 5π
- **Total: 36π**

## Merchant Configuration

Merchants can configure in store settings:

1. **Enable/Disable Delivery**
   - Toggle delivery option for physical products

2. **Set Delivery Fee**
   - Enter amount in π (e.g., 5.00)
   - Set to 0 for always free

3. **Free Delivery Threshold**
   - Set minimum order amount (e.g., 80π)
   - Leave empty to always charge delivery
   - When order subtotal ≥ threshold → FREE delivery

## Platform Fee Revenue

Platform earns 1π per product listing, calculated:

- 100 products sold = 100π platform revenue
- Independent of product price
- Consistent per-listing fee model
- Automatically added at checkout

## Testing Checklist

- [ ] Digital product shows no delivery fee
- [ ] Physical product includes delivery fee
- [ ] Free delivery threshold works correctly
- [ ] Platform fee always appears (1π)
- [ ] Fee breakdown displays properly
- [ ] Total calculation is accurate
- [ ] Delivery settings save correctly
- [ ] Orders record fee breakdown

## Notes

- Platform fee is **non-negotiable** (1π fixed)
- Delivery fee is **merchant configurable**
- Digital products **never** have delivery fees
- Free delivery only applies to **physical products**
- Fees are shown **before** payment confirmation
- All amounts in **Pi (π) currency**
