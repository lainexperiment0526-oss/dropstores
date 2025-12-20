# Pi Network Integration Setup Guide

## ✅ Current Configuration

### **Environment Variables (Configured)**

#### Root `.env`
```env
PI_API_KEY="h1y9zxfm7infu7ysppf7mene5bab9y8gm1f09jsludamf48vler4n6vsiqrdmruy"
VITE_PI_API_KEY="h1y9zxfm7infu7ysppf7mene5bab9y8gm1f09jsludamf48vler4n6vsiqrdmruy"
VITE_PI_VALIDATION_KEY="a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1"
VITE_PI_MAINNET_MODE="true"
VITE_PI_NETWORK="mainnet"
VITE_PI_NETWORK_PASSPHRASE="Pi Mainnet"
VITE_API_URL="https://api.minepi.com"
VITE_PI_PAYMENT_RECEIVER_WALLET="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"
```

#### `supabase/.env` (Edge Functions)
```env
PI_API_KEY="h1y9zxfm7infu7ysppf7mene5bab9y8gm1f09jsludamf48vler4n6vsiqrdmruy"
VALIDATION_KEY="a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1"
DOMAIN_VALIDATION_KEY="a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1"
SUPABASE_URL="https://kvqfnmdkxaclsnyuzkyp.supabase.co"
```

#### `public/validation-key.txt`
```
a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1
```

---

## 🔧 Pi Network Features

### **1. Authentication** ✅
- **File**: `src/lib/pi-sdk.ts`
- **Function**: `authenticateWithPi()`
- **Scopes**: `['username', 'payments', 'wallet_address']`
- **Mode**: Mainnet (production)

**How it works:**
1. User clicks "Continue with Pi Network"
2. Pi SDK opens authentication dialog
3. User approves in Pi Browser
4. Backend verifies token with `https://api.minepi.com/v2/me`
5. Creates/updates Supabase user session

**Edge Function**: `supabase/functions/pi-auth/index.ts`

### **2. Payments** ✅
- **Approve**: `supabase/functions/pi-payment-approve/index.ts`
- **Complete**: `supabase/functions/pi-payment-complete/index.ts`
- **Verify**: `supabase/functions/verify-pi-transaction/index.ts`

**Payment Flow:**
1. User initiates payment (subscription, order)
2. Frontend calls `createPiPayment()` with amount and memo
3. `onReadyForServerApproval` → calls `pi-payment-approve`
4. Approve function verifies and approves via Pi API
5. User completes in Pi Wallet
6. `onReadyForServerCompletion` → calls `pi-payment-complete`
7. Complete function verifies transaction on blockchain

**Pi API Endpoints Used:**
- Approve: `POST https://api.minepi.com/v2/payments/{paymentId}/approve`
- Complete: `POST https://api.minepi.com/v2/payments/{paymentId}/complete`
- Get Payment: `GET https://api.minepi.com/v2/payments/{paymentId}`

### **3. Ad Network** ✅
- **Docs**: https://github.com/pi-apps/pi-platform-docs/blob/master/ads.md
- **Types**: Interstitial, Rewarded Video
- **Implementation**: `src/lib/pi-sdk.ts`

**Available Functions:**
```typescript
// Check if ad is ready
const isReady = await window.Pi.Ads?.isAdReady('rewarded_video');

// Show rewarded video ad
const result = await window.Pi.Ads?.showAd('rewarded_video');
if (result?.reward) {
  console.log('User earned reward:', result.adId);
}

// Show interstitial ad
await window.Pi.Ads?.showAd('interstitial');
```

**Ad Types:**
- `interstitial` - Full-screen ads between content
- `rewarded_video` - Video ads that give rewards

**Current Configuration:**
```env
VITE_PI_AD_NETWORK_ENABLED="true"
VITE_PI_AD_NETWORK_VERSION="2.0"
VITE_PI_INTERSTITIAL_ADS_ENABLED="true"
VITE_PI_REWARDED_ADS_ENABLED="true"
VITE_PI_AD_COOLDOWN_MINUTES="5"
VITE_PI_AD_FREQUENCY_CAP="3"
```

---

## 🚀 Deployment Checklist

### **1. Deploy to Vercel**
```bash
# Add environment variables in Vercel Dashboard
# Project Settings → Environment Variables

VITE_PI_API_KEY=h1y9zxfm7infu7ysppf7mene5bab9y8gm1f09jsludamf48vler4n6vsiqrdmruy
VITE_PI_MAINNET_MODE=true
VITE_PI_NETWORK=mainnet
VITE_API_URL=https://api.minepi.com
VITE_PI_VALIDATION_KEY=a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1

# Deploy
vercel --prod
```

### **2. Deploy Supabase Edge Functions**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref kvqfnmdkxaclsnyuzkyp

# Set secrets for edge functions
supabase secrets set PI_API_KEY=h1y9zxfm7infu7ysppf7mene5bab9y8gm1f09jsludamf48vler4n6vsiqrdmruy
supabase secrets set VALIDATION_KEY=a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1
supabase secrets set DOMAIN_VALIDATION_KEY=a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1

# Deploy all functions
supabase functions deploy pi-auth --no-verify-jwt
supabase functions deploy pi-payment-approve --no-verify-jwt
supabase functions deploy pi-payment-complete --no-verify-jwt
supabase functions deploy verify-pi-transaction --no-verify-jwt
supabase functions deploy create-store --no-verify-jwt
supabase functions deploy merchant-payout --no-verify-jwt
supabase functions deploy request-payout --no-verify-jwt
```

### **3. Configure Pi Developer Portal**
1. Go to: https://developers.minepi.com/
2. **App Settings**:
   - App URL: `https://dropshops.space`
   - Validation URL: `https://dropshops.space/validation-key.txt`
   - Redirect URLs: 
     - `https://dropshops.space/auth`
     - `https://www.dropshops.space/auth`
3. **Payment Settings**:
   - Wallet Address: `GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ`
   - Network: Mainnet
4. **Ad Network**: Enable (if needed)

### **4. Supabase Configuration**
1. **Dashboard**: https://supabase.com/dashboard/project/kvqfnmdkxaclsnyuzkyp
2. **Authentication → URL Configuration**:
   - Site URL: `https://dropshops.space`
   - Redirect URLs:
     - `https://dropshops.space/**`
     - `https://www.dropshops.space/**`
3. **API Settings → CORS**:
   - Add: `https://dropshops.space`
   - Add: `https://www.dropshops.space`
   - Add: `https://browser.minepi.com` (Pi Browser)

---

## 🐛 Troubleshooting

### **Issue: "Authentication verification failed"**

**Causes:**
1. Edge functions not deployed
2. Environment variables missing in Supabase
3. Wrong API endpoints (sandbox vs mainnet)

**Solution:**
```bash
# 1. Check edge function logs
supabase functions logs pi-auth --project-ref kvqfnmdkxaclsnyuzkyp

# 2. Verify secrets are set
supabase secrets list --project-ref kvqfnmdkxaclsnyuzkyp

# 3. Redeploy with correct configuration
supabase functions deploy pi-auth --no-verify-jwt
```

### **Issue: Payment not completing**

**Causes:**
1. Payment callback URLs not configured
2. PI_API_KEY not matching in frontend and backend
3. Wallet address mismatch

**Solution:**
1. Check browser console for Pi SDK logs
2. Verify payment approve/complete endpoints are responding
3. Check edge function logs for errors

### **Issue: Pi SDK not loading**

**Causes:**
1. Not opened in Pi Browser
2. Pi SDK script not loading
3. Wrong sandbox mode

**Solution:**
1. Ensure `<script src="https://sdk.minepi.com/pi-sdk.js"></script>` in index.html
2. Check `window.Pi` is available in console
3. Verify `VITE_PI_MAINNET_MODE=true`

---

## 📚 Official Documentation

- **Pi Developer Guide**: https://pi-apps.github.io/community-developer-guide/
- **Pi Platform Docs**: https://github.com/pi-apps/pi-platform-docs
- **Pi Ad Network**: https://github.com/pi-apps/pi-platform-docs/blob/master/ads.md
- **Pi Payments**: https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md
- **Pi Authentication**: https://github.com/pi-apps/pi-platform-docs/blob/master/authentication.md

---

## ✅ Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| Pi SDK Loading | ✅ | From CDN in index.html |
| Authentication | ✅ | Mainnet configured |
| Payments | ✅ | Approve & Complete functions ready |
| Ad Network | ✅ | Enabled with v2.0 |
| Environment Vars | ✅ | Configured in .env files |
| Edge Functions | ⚠️ | Need deployment |
| Supabase Config | ✅ | Project linked |
| Domain Setup | ⚠️ | Pending DNS |

---

## 🔄 Next Steps

1. **Deploy Edge Functions**:
   ```bash
   supabase login
   supabase link --project-ref kvqfnmdkxaclsnyuzkyp
   supabase secrets set PI_API_KEY=h1y9zxfm7infu7ysppf7mene5bab9y8gm1f09jsludamf48vler4n6vsiqrdmruy
   supabase functions deploy --no-verify-jwt
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Configure Pi Developer Portal**:
   - Add production domain
   - Verify validation-key.txt accessible

4. **Test in Pi Browser**:
   - Open app in Pi Browser
   - Test authentication
   - Test payment flow
   - Test ad display

---

**Your Pi Network integration is ready! Just deploy and test.** 🚀
