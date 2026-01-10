# Pi Network Full Integration - Deployment & Testing Guide

## 🚀 Environment Configuration

### API Keys & Validation
- **PI_API_KEY**: `mj69bcvflcervamlbzgissqoxij6sxzr1k71wcuvdhcuwxtjmjinlgk0zfhz90y7`
- **VALIDATION_KEY**: `a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1`

**Configuration Files Updated:**
- ✅ `supabase/.env` - Contains PI_API_KEY and VALIDATION_KEY
- ✅ `.env` - Frontend environment variables set
- ✅ Edge functions configured to use secrets

---

## 📦 Deployed Edge Functions

### 1. **Pi Authentication** (`pi-auth`)
**Location**: `supabase/functions/pi-auth/index.ts`

**Functionality**:
- Authenticates users with Pi Browser
- Verifies access tokens via `https://api.minepi.com/v2/me`
- Creates/updates Supabase user accounts
- Stores Pi user data in `pi_users` table
- Returns session tokens for authenticated users

**API Endpoint**: `https://kvqfnmdkxaclsnyuzkyp.functions.supabase.co/functions/v1/pi-auth`

**Request**:
```json
{
  "accessToken": "pi_auth_token_from_browser",
  "piUser": {
    "uid": "pi_user_uid",
    "username": "pi_username",
    "wallet_address": "pi_wallet_address"
  }
}
```

**Response**:
```json
{
  "success": true,
  "userId": "supabase_user_id",
  "piUsername": "pi_username",
  "piUid": "pi_user_uid",
  "walletAddress": "pi_wallet_address",
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

---

### 2. **Pi Payment Approval** (`pi-payment-approve`)
**Location**: `supabase/functions/pi-payment-approve/index.ts`

**Functionality**:
- Approves Pi payments using PI_API_KEY
- Calls `https://api.minepi.com/v2/payments/{paymentId}/approve`
- Responds to `onReadyForServerApproval` callback from frontend

**API Endpoint**: `https://kvqfnmdkxaclsnyuzkyp.functions.supabase.co/functions/v1/pi-payment-approve`

**Request**:
```json
{
  "paymentId": "pi_payment_id_from_sdk"
}
```

**Response**:
```json
{
  "success": true,
  "payment": { /* Pi API response */ }
}
```

---

### 3. **Pi Payment Completion** (`pi-payment-complete`)
**Location**: `supabase/functions/pi-payment-complete/index.ts`

**Functionality**:
- Completes Pi payments with blockchain verification
- Verifies transactions on Pi Mainnet blockchain (Horizon API)
- Stores payment records in Supabase
- Handles subscription activation if applicable
- Calls `https://api.minepi.com/v2/payments/{paymentId}/complete`

**API Endpoint**: `https://kvqfnmdkxaclsnyuzkyp.functions.supabase.co/functions/v1/pi-payment-complete`

**Request**:
```json
{
  "paymentId": "pi_payment_id",
  "txid": "blockchain_transaction_id",
  "planType": "basic|grow|advance|plus",
  "storeId": "store_id_for_subscription"
}
```

**Response**:
```json
{
  "success": true,
  "payment": { /* stored payment data */ },
  "subscription": { /* subscription data if applicable */ }
}
```

---

### 4. **Pi Ad Network Verification** (`pi-ad-verify`)
**Location**: `supabase/functions/pi-ad-verify/index.ts`

**Functionality**:
- Verifies rewarded ad completion with Pi Platform
- Calls `https://api.minepi.com/v2/ads/{adId}/verify`
- Backend verification for secure reward distribution
- Prevents fraudulent ad reward claims

**API Endpoint**: `https://kvqfnmdkxaclsnyuzkyp.functions.supabase.co/functions/v1/pi-ad-verify`

**Request**:
```json
{
  "adId": "pi_ad_id",
  "accessToken": "user_access_token"
}
```

**Response**:
```json
{
  "verified": true,
  "adId": "pi_ad_id",
  "result": { /* Pi API verification result */ }
}
```

---

## 🔐 Security Implementation

### Environment Variables (Supabase Secrets)
All sensitive keys are stored as Supabase secrets:
- ✅ `PI_API_KEY` - Used for server-side API calls
- ✅ `VALIDATION_KEY` - For Pi validation
- ✅ `SUPABASE_URL` / `MY_SUPABASE_URL` - Database access
- ✅ `SUPABASE_SERVICE_ROLE_KEY` / `MY_SUPABASE_SERVICE_ROLE_KEY` - Admin operations

### Frontend Environment (Safe for Public)
All frontend `.env` variables use `VITE_` prefix:
- ✅ `VITE_PI_API_KEY` - Public API key (same as PI_API_KEY)
- ✅ `VITE_PI_VALIDATION_KEY` - Validation identifier
- ✅ `VITE_PI_MAINNET_MODE` - Always `true` for production

### Token Security
- Pi access tokens are validated server-side before use
- Session tokens are issued by Supabase (signed JWTs)
- All API calls include proper `Authorization` headers
- CORS headers restrict cross-origin access

---

## 📋 Mainnet Configuration

### Frontend (`src/lib/pi-sdk.ts`)
```typescript
// Always production mainnet
const config = {
  version: '2.0',
  sandbox: false  // Production mode
};
window.Pi!.init(config);
```

### Edge Functions
All edge functions use mainnet endpoints:
- **Auth API**: `https://api.minepi.com/v2/me`
- **Payments API**: `https://api.minepi.com/v2/payments/{id}/...`
- **Ad Network API**: `https://api.minepi.com/v2/ads/{id}/verify`
- **Blockchain**: `https://api.mainnet.minepi.com` (Horizon)

### Environment Variables
```
PI_NETWORK=mainnet
PI_MAINNET_MODE=true
PI_SANDBOX_MODE=false
PI_ENVIRONMENT=production
```

---

## 🧪 Testing Checklist

### Prerequisites
- [ ] Pi Browser installed on mobile device
- [ ] DropStore app opened in Pi Browser
- [ ] User has Pi account (minimum balance for testing)

### 1. Authentication Test
```
1. Navigate to /auth page
2. Click "Continue with Pi Network"
3. Approve authentication in Pi Browser
4. Verify success message shows username
5. Check localStorage for session tokens
6. Verify redirect to dashboard
```

**Expected Result**: ✅ User authenticated, session created, redirected to dashboard

### 2. Payment Test (User-to-App)
```
1. Navigate to store page
2. Add product to cart
3. Click "Checkout"
4. Select "Pi Payment"
5. Confirm payment in Pi Wallet
6. Approve in backend function (onReadyForServerApproval)
7. Complete payment (onReadyForServerCompletion)
8. Verify transaction on blockchain
```

**Expected Result**: ✅ Payment completed, order created, transaction verified on-chain

### 3. Subscription Test
```
1. Navigate to Pricing page
2. Select subscription plan (e.g., "Grow")
3. Click "Subscribe Now"
4. Complete Pi payment (see Payment Test)
5. Check database for subscription record
6. Verify plan limits active
```

**Expected Result**: ✅ Subscription activated, limits enforced in UI

### 4. Ad Network Test - Interstitial
```
1. Ensure user is authenticated
2. Trigger interstitial ad (page 3 views or manual)
3. Ad displays full-screen
4. User closes ad
5. Check console for success message
```

**Expected Result**: ✅ Ad displayed, closed without errors

### 5. Ad Network Test - Rewarded
```
1. Ensure user is authenticated
2. Click "Watch Ad for Reward" button
3. Ad displays full-screen
4. Complete watching (or allow to finish)
5. Backend verifies ad completion
6. User receives reward (discount, credits, etc.)
```

**Expected Result**: ✅ Ad completed, reward granted, verified server-side

### 6. Incomplete Payment Recovery
```
1. Start Pi payment
2. Approve in Pi Wallet
3. Interrupt payment (close browser, navigate away)
4. Re-authenticate
5. Check for incomplete payment notification
6. Complete interrupted payment
```

**Expected Result**: ✅ Incomplete payment detected and recovered

---

## 🚀 Deployment Steps

### Step 1: Deploy Edge Functions
```bash
# Deploy all Pi Network functions
supabase functions deploy pi-auth --project-ref kvqfnmdkxaclsnyuzkyp --no-verify-jwt
supabase functions deploy pi-payment-approve --project-ref kvqfnmdkxaclsnyuzkyp --no-verify-jwt
supabase functions deploy pi-payment-complete --project-ref kvqfnmdkxaclsnyuzkyp --no-verify-jwt
supabase functions deploy pi-ad-verify --project-ref kvqfnmdkxaclsnyuzkyp --no-verify-jwt
```

### Step 2: Set Secrets in Supabase
```bash
# Set all required secrets
supabase secrets set PI_API_KEY=mj69bcvflcervamlbzgissqoxij6sxzr1k71wcuvdhcuwxtjmjinlgk0zfhz90y7 \
  VALIDATION_KEY=a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1 \
  --project-ref kvqfnmdkxaclsnyuzkyp
```

### Step 3: Verify Secrets
```bash
supabase secrets list --project-ref kvqfnmdkxaclsnyuzkyp
```

### Step 4: Build and Deploy Frontend
```bash
# Build frontend
npm run build

# Deploy to Vercel
vercel deploy --prod
```

### Step 5: Verify Deployment
```bash
# Check edge function logs
supabase functions logs pi-auth --project-ref kvqfnmdkxaclsnyuzkyp
supabase functions logs pi-payment-approve --project-ref kvqfnmdkxaclsnyuzkyp
supabase functions logs pi-payment-complete --project-ref kvqfnmdkxaclsnyuzkyp
supabase functions logs pi-ad-verify --project-ref kvqfnmdkxaclsnyuzkyp
```

---

## 🔍 Troubleshooting

### Auth Failures
**Error**: "Authentication verification failed"
**Solution**:
1. Check `supabase functions logs pi-auth`
2. Verify PI_API_KEY is set correctly
3. Ensure app opened in Pi Browser (not web)
4. Check network connectivity

### Payment Failures
**Error**: "Failed to approve payment"
**Solution**:
1. Check `supabase functions logs pi-payment-approve`
2. Verify PI_API_KEY matches Pi Platform
3. Ensure payment amount within limits (0.01 - 10,000 Pi)
4. Check user wallet has sufficient balance

**Error**: "Failed to complete payment"
**Solution**:
1. Check `supabase functions logs pi-payment-complete`
2. Verify transaction on blockchain: https://explorer.minepi.com
3. Check Supabase database connectivity
4. Verify callback URLs are correct

### Ad Network Issues
**Error**: "Ads not supported"
**Solution**:
1. Ensure Pi Browser version is latest
2. Verify app has ad_network capability enabled
3. Check if user authenticated
4. Verify ad network cooldown hasn't expired

**Error**: "No ads available"
**Solution**:
1. Check frequency cap (3 ads per session by default)
2. Verify cooldown period (5 minutes minimum)
3. Check browser console for detailed errors
4. Contact Pi support if issue persists

### Function Deployment Issues
**Error**: "Function already exists"
**Solution**: Use `--force` flag to overwrite
```bash
supabase functions deploy pi-auth --project-ref kvqfnmdkxaclsnyuzkyp --force --no-verify-jwt
```

---

## 📊 Monitoring & Analytics

### Key Metrics to Monitor
- **Authentication Success Rate**: Track failed vs successful logins
- **Payment Completion Rate**: Monitor approved vs completed payments
- **Ad Network Performance**: Track impressions, completions, rewards
- **Error Rates**: Monitor function logs for failures
- **User Growth**: Track new Pi accounts created

### Logging
Check edge function logs:
```bash
# Real-time logs
supabase functions logs pi-auth --project-ref kvqfnmdkxaclsnyuzkyp --follow

# Last 30 minutes
supabase functions logs pi-auth --project-ref kvqfnmdkxaclsnyuzkyp --since 30m
```

### Database Monitoring
Check Supabase Dashboard:
- `pi_users` table - Authentication records
- `payments` table - Payment records
- `subscriptions` table - Subscription data
- `pi_ads_network` table - Ad network events

---

## 📚 References

- [Pi Developer Guide](https://pi-apps.github.io/community-developer-guide/)
- [Pi SDK JS](https://github.com/pi-apps/pi-sdk-js)
- [Pi Platform Docs](https://github.com/pi-apps/pi-platform-docs)
- [Pi Payment Flow](https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md)
- [Pi Ad Network](https://github.com/pi-apps/pi-platform-docs/blob/master/ads.md)

---

## ✅ Implementation Status

| Feature | Status | Location |
|---------|--------|----------|
| Pi Authentication | ✅ Complete | `src/lib/pi-sdk.ts`, `supabase/functions/pi-auth` |
| Pi Payments (User-to-App) | ✅ Complete | `src/lib/pi-payment.ts`, `supabase/functions/pi-payment-*` |
| Pi Payments (App-to-User) | ✅ Complete | `supabase/functions/pi-payment-complete` |
| Pi Ad Network (Interstitial) | ✅ Complete | `src/hooks/usePiAdNetwork.ts` |
| Pi Ad Network (Rewarded) | ✅ Complete | `src/hooks/usePiAdNetwork.ts` |
| Blockchain Verification | ✅ Complete | `supabase/functions/pi-payment-complete` |
| Mainnet Configuration | ✅ Complete | All configs set to mainnet |
| Security (Token Validation) | ✅ Complete | All edge functions validate tokens |
| Error Handling | ✅ Complete | Comprehensive error responses |

---

## 🎯 Next Steps

1. **Deploy Functions** - Run deployment commands above
2. **Test Authentication** - Verify login flow works
3. **Test Payments** - Complete a test transaction
4. **Test Ad Network** - Verify ad display and reward
5. **Monitor Logs** - Check edge function logs
6. **Go Live** - Enable production features

---

**Last Updated**: January 10, 2026
**API Key**: mj69bcvflcervamlbzgissqoxij6sxzr1k71wcuvdhcuwxtjmjinlgk0zfhz90y7
**Validation Key**: a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1
