# Edge Functions Testing Guide

This guide helps you test all Edge functions in your Drop Store platform.

## 🧪 Prerequisites

- Pi Browser installed
- Drop Store app open in Pi Browser
- Active internet connection
- Some Pi cryptocurrency for testing payments

---

## 1️⃣ Test Pi Authentication

### Steps:
1. Open app in Pi Browser: `https://dropshops.space`
2. Click "Sign In with Pi"
3. Grant permissions when prompted
4. Should redirect to dashboard

### Expected Result:
- ✅ User authenticated
- ✅ Pi username displayed
- ✅ User record created in database
- ✅ Session active

### Console Check:
```javascript
// In browser console
window.Pi !== undefined // Should be true
```

---

## 2️⃣ Test Subscription Payment

### Steps:
1. Navigate to `/subscription` page
2. Select "Basic" plan (20π)
3. Click "Subscribe with Pi"
4. Complete payment in Pi wallet
5. Wait for confirmation

### Expected Result:
- ✅ Payment approved
- ✅ Transaction verified on-chain
- ✅ Subscription created (30 days)
- ✅ Redirect to dashboard

### Database Check:
```sql
-- In Supabase SQL Editor
SELECT * FROM subscriptions 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC 
LIMIT 1;

-- Should show:
-- status: 'active'
-- plan_type: 'basic'
-- expires_at: 30 days from now
-- pi_payment_id: set
-- pi_transaction_id: set
```

---

## 3️⃣ Test Store Creation

### Steps:
1. Navigate to `/create-store`
2. Fill in store details:
   - Name: "Test Store"
   - Slug: "test-store-123"
   - Description: "Test description"
3. Click "Create Store"

### Expected Result:
- ✅ Store created
- ✅ Redirect to store management
- ✅ Store appears in dashboard

### Database Check:
```sql
SELECT * FROM stores 
WHERE owner_id = 'YOUR_USER_ID';
```

---

## 4️⃣ Test Public Store Access

### Steps:
1. Publish your store (toggle switch)
2. Visit public URL: `https://dropshops.space/shop/test-store-123`
3. Should display store page

### Expected Result:
- ✅ Store page loads
- ✅ Products displayed (if any)
- ✅ No authentication required
- ✅ Buy buttons work

---

## 5️⃣ Test Transaction Verification

### Use Case: Verify a product purchase

### API Call:
```bash
curl -X POST https://kvqfnmdkxaclsnyuzkyp.supabase.co/functions/v1/verify-pi-transaction \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "transaction_hash": "ACTUAL_TX_HASH",
    "order_id": "ORDER_UUID",
    "expected_amount": 10,
    "expected_recipient": "MERCHANT_WALLET",
    "auto_release": true
  }'
```

### Expected Result:
```json
{
  "verified": true,
  "transaction": {
    "verified": true,
    "transaction_hash": "...",
    "amount": 10,
    "recipient": "MERCHANT_WALLET",
    "sender": "CUSTOMER_WALLET"
  },
  "order_id": "ORDER_UUID",
  "auto_released": true,
  "message": "Payment verified on Pi Mainnet blockchain"
}
```

---

## 6️⃣ Test Merchant Payout Request

### Steps:
1. As a merchant, accumulate some sales
2. Navigate to payout section
3. Request payout:
   - Amount: Available balance
   - Wallet: Your Pi wallet address
4. Submit request

### Expected Result:
- ✅ Payout request created
- ✅ Sales marked as "processing"
- ✅ Admin notified

### Database Check:
```sql
SELECT * FROM merchant_payouts 
WHERE owner_id = 'YOUR_USER_ID' 
ORDER BY requested_at DESC;

-- Check sales status
SELECT * FROM merchant_sales 
WHERE owner_id = 'YOUR_USER_ID' 
AND payout_status = 'processing';
```

---

## 7️⃣ Test Admin Payout Processing (Admin Only)

### Prerequisites:
- Admin access
- Merchant has requested payout
- App has sufficient Pi balance

### API Call:
```bash
curl -X POST https://kvqfnmdkxaclsnyuzkyp.supabase.co/functions/v1/merchant-payout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "orderId": "ORDER_UUID"
  }'
```

### Expected Result:
```json
{
  "success": true,
  "payout": {
    "identifier": "PAYMENT_ID",
    ...
  },
  "merchant_wallet": "MERCHANT_WALLET",
  "amount": 10
}
```

---

## 8️⃣ Test Dashboard Data

### Steps:
1. Navigate to `/dashboard`
2. Should see stats:
   - Total stores
   - Total products
   - Total orders
   - Total revenue

### Expected Result:
- ✅ All stats display correctly
- ✅ Stores list shown
- ✅ Quick actions available

---

## 9️⃣ Test User Profile

### Steps:
1. Navigate to profile/settings
2. Update profile:
   - Full name
   - Avatar URL
3. Save changes

### Expected Result:
- ✅ Profile updated
- ✅ Changes reflected immediately
- ✅ Pi user data displayed if linked

---

## 🔟 Test Pi Ad Network (When Implemented)

### Console Test:
```javascript
// Check if ads are available
if (window.Pi && window.Pi.Ads) {
  console.log('Pi Ads available');
  
  // Check if rewarded ad is ready
  window.Pi.Ads.isAdReady('rewarded').then(ready => {
    console.log('Rewarded ad ready:', ready);
  });
  
  // Check if interstitial ad is ready
  window.Pi.Ads.isAdReady('interstitial').then(ready => {
    console.log('Interstitial ad ready:', ready);
  });
  
  // Show rewarded ad (test only)
  window.Pi.Ads.showAd('rewarded').then(result => {
    console.log('Ad result:', result);
    // result.adId - unique ad ID
    // result.reward - true if user watched full ad
  });
}
```

---

## 🔍 Debugging Tools

### Check Function Logs:
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on function name
4. View logs for errors

### Check Browser Console:
```javascript
// Check Pi SDK
console.log('Pi SDK available:', window.Pi !== undefined);

// Check environment
console.log('Environment:', import.meta.env.VITE_ENVIRONMENT);
console.log('Pi Network:', import.meta.env.VITE_PI_NETWORK);
console.log('Mainnet mode:', import.meta.env.VITE_PI_MAINNET_MODE);
```

### Check Database:
```sql
-- Active subscriptions
SELECT * FROM subscriptions WHERE status = 'active';

-- Recent payments
SELECT * FROM orders WHERE pi_txid IS NOT NULL ORDER BY created_at DESC LIMIT 10;

-- Payout requests
SELECT * FROM merchant_payouts WHERE status = 'pending';

-- Merchant sales
SELECT 
  store_id,
  COUNT(*) as total_sales,
  SUM(amount) as total_amount,
  SUM(net_amount) as net_amount
FROM merchant_sales
GROUP BY store_id;
```

---

## 🚨 Common Issues & Solutions

### Issue: "Pi SDK not available"
**Solution:** Make sure you're using Pi Browser and the SDK script is loaded.

### Issue: "Payment approval failed"
**Solution:** Check PI_API_KEY is correctly set in environment variables.

### Issue: "Transaction verification failed"
**Solution:** 
- Check recipient wallet is correct
- Verify amount matches
- Ensure transaction completed in Pi wallet

### Issue: "Merchant not linked to Pi account"
**Solution:** Merchant must authenticate with Pi first before receiving payouts.

### Issue: "Insufficient balance for payout"
**Solution:** Check merchant_sales table for available balance.

---

## ✅ Success Criteria

All tests passed when:
- [x] Pi authentication works
- [x] Subscription payment completes
- [x] Transaction verified on-chain
- [x] Store creation successful
- [x] Public store accessible
- [x] Payout request accepted
- [x] Dashboard shows correct stats
- [x] Profile updates work

---

## 📊 Performance Benchmarks

- Authentication: < 2 seconds
- Payment approval: < 1 second
- Payment completion: 2-4 seconds (includes on-chain verification)
- Store creation: < 1 second
- Dashboard load: < 2 seconds

---

## 🎯 Next Steps After Testing

1. Monitor production logs
2. Set up error alerting
3. Track payment success rate
4. Monitor payout processing time
5. Collect user feedback

---

**Happy Testing!** 🚀

For issues, check:
- `EDGE_FUNCTIONS_AUDIT.md` - Detailed function analysis
- `PI_MAINNET_VERIFICATION.md` - Pi integration details
- Supabase Edge Function logs
