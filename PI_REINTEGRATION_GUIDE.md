# 🔄 Pi Network - Complete Reintegration Guide

## Overview

This is a **complete rewrite** of the Pi Network integration following the official Pi Platform documentation.

**New Files Created:**
- `src/lib/pi-sdk-new.ts` - New SDK based on official docs
- `src/contexts/PiAuthContext-new.tsx` - New authentication context
- Updated `supabase/functions/pi-payment-approve/index.ts` - Fixed implementation

**Old Files (Keep for reference, but will be replaced):**
- `src/lib/pi-sdk.ts` - Old implementation (for reference)
- `src/contexts/PiAuthContext.tsx` - Old implementation (for reference)

---

## What Changed

### Official Documentation References

All implementations now follow:
- **Authentication**: https://github.com/pi-apps/pi-platform-docs/blob/master/authentication.md
- **Payments**: https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md
- **Ads**: https://github.com/pi-apps/pi-platform-docs/blob/master/ads.md
- **SDK Reference**: https://github.com/pi-apps/pi-platform-docs/blob/master/SDK_reference.md

### Key Improvements

1. **Authentication Flow** ✅
   - Step 1: `Pi.authenticate()` - Get user + access token
   - Step 2: Verify token with `/me` API endpoint
   - Step 3: Create Supabase session
   - Step 4: Request wallet address (optional)

2. **Payment Flow** ✅
   - Phase I: Frontend initiates → Backend approves
   - Phase II: User signs transaction
   - Phase III: Backend completes → Blockchain verified

3. **Ad Network** ✅
   - Check support with `Pi.nativeFeaturesList()`
   - Request ads with `Pi.Ads.requestAd()`
   - Show ads with `Pi.Ads.showAd()`
   - Verify rewarded ads with backend

---

## Step 1: Update Environment Variables

### Update `.env`

```bash
# Pi Network Configuration
VITE_PI_MAINNET_MODE=true
VITE_PI_SANDBOX_MODE=false
VITE_PI_ENVIRONMENT=production
VITE_PI_NETWORK=mainnet
VITE_PI_API_URL=https://api.minepi.com
VITE_PI_API_KEY=mj69bcvflcervamlbzgissqoxij6sxzr1k71wcuvdhcuwxtjmjinlgk0zfhz90y7
VITE_PI_VALIDATION_KEY=a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1

# Features
VITE_PI_AUTHENTICATION_ENABLED=true
VITE_PI_PAYMENTS_ENABLED=true
VITE_PI_AD_NETWORK_ENABLED=true
```

### Update `supabase/.env.local`

```bash
# Set these in Supabase secrets instead:
# supabase secrets set PI_API_KEY "mj69bcvflcervamlbzgissqoxij6sxzr1k71wcuvdhcuwxtjmjinlgk0zfhz90y7"
# supabase secrets set VALIDATION_KEY "a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1"
```

---

## Step 2: Update App Configuration

Update your app imports to use the new files:

### In your Auth page or login component:

```typescript
// OLD:
// import { initPiSdk } from '@/lib/pi-sdk';
// import { usePiAuth } from '@/contexts/PiAuthContext';

// NEW:
import PiSDK from '@/lib/pi-sdk-new';
import { usePiAuth } from '@/contexts/PiAuthContext-new';

// Usage:
export function LoginPage() {
  const { authenticateWithPi, isLoading, piAvailable } = usePiAuth();

  return (
    <button 
      onClick={authenticateWithPi}
      disabled={!piAvailable || isLoading}
    >
      {isLoading ? 'Authenticating...' : 'Login with Pi'}
    </button>
  );
}
```

### Update your App.tsx provider:

```typescript
// Import the new context
import { PiAuthProvider } from '@/contexts/PiAuthContext-new';

export function App() {
  return (
    <PiAuthProvider>
      <YourAppContent />
    </PiAuthProvider>
  );
}
```

---

## Step 3: Deployment

### Set Supabase Secrets

```bash
cd your-project

# Set API key
supabase secrets set PI_API_KEY="mj69bcvflcervamlbzgissqoxij6sxzr1k71wcuvdhcuwxtjmjinlgk0zfhz90y7" \
  --project-ref kvqfnmdkxaclsnyuzkyp

# Set validation key  
supabase secrets set VALIDATION_KEY="a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1" \
  --project-ref kvqfnmdkxaclsnyuzkyp
```

### Deploy Functions

```bash
# Deploy payment approval function
supabase functions deploy pi-payment-approve \
  --project-ref kvqfnmdkxaclsnyuzkyp

# Deploy payment completion function (update if needed)
supabase functions deploy pi-payment-complete \
  --project-ref kvqfnmdkxaclsnyuzkyp

# Deploy ad verification function (update if needed)
supabase functions deploy pi-ad-verify \
  --project-ref kvqfnmdkxaclsnyuzkyp
```

---

## Step 4: Testing

### 1. Test Authentication

```typescript
// In your component
import { usePiAuth } from '@/contexts/PiAuthContext-new';

export function TestAuth() {
  const { 
    authenticateWithPi, 
    piUser, 
    walletAddress,
    isAuthenticated 
  } = usePiAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>✅ Authenticated as {piUser?.username}</p>
          <p>Wallet: {walletAddress}</p>
        </div>
      ) : (
        <button onClick={authenticateWithPi}>Authenticate</button>
      )}
    </div>
  );
}
```

### 2. Test Payments

```typescript
import PiSDK from '@/lib/pi-sdk-new';

async function testPayment() {
  const callbacks = {
    onReadyForServerApproval: async (paymentId) => {
      // 1. Approve on your backend
      const approvalResponse = await fetch('/api/approve-payment', {
        method: 'POST',
        body: JSON.stringify({ paymentId })
      });
      console.log('Payment approved:', approvalResponse);
    },
    
    onReadyForServerCompletion: async (paymentId, txid) => {
      // 2. Complete on your backend
      const completionResponse = await fetch('/api/complete-payment', {
        method: 'POST',
        body: JSON.stringify({ paymentId, txid })
      });
      console.log('Payment completed:', completionResponse);
    },
    
    onCancel: (paymentId) => {
      console.log('Payment cancelled:', paymentId);
    },
    
    onError: (error, payment) => {
      console.error('Payment error:', error, payment);
    }
  };

  // Create payment
  PiSDK.createPayment(
    {
      amount: 1,
      memo: 'Test payment',
      metadata: { orderId: '123' }
    },
    callbacks
  );
}
```

### 3. Test Ad Network

```typescript
import PiSDK from '@/lib/pi-sdk-new';

async function testAds() {
  // Check if ads are supported
  const supported = await PiSDK.isAdNetworkSupported();
  if (!supported) {
    console.log('Ad network not supported in this Pi Browser version');
    return;
  }

  // Check if interstitial ad is ready
  const ready = await PiSDK.checkAdReady('interstitial');
  if (!ready) {
    // Request an ad
    const response = await PiSDK.requestAd('interstitial');
    if (response.result !== 'AD_LOADED') {
      console.log('Failed to load ad');
      return;
    }
  }

  // Show the ad
  const result = await PiSDK.showInterstitialAd();
  console.log('Ad result:', result.result);
}

async function testRewardedAds() {
  const supported = await PiSDK.isAdNetworkSupported();
  if (!supported) return;

  // Show rewarded ad
  const result = await PiSDK.showRewardedAd();
  
  if (result.result === 'AD_REWARDED' && result.adId) {
    // Verify with backend before rewarding user
    const verification = await fetch('/api/verify-rewarded-ad', {
      method: 'POST',
      body: JSON.stringify({ 
        adId: result.adId,
        accessToken: getUserAccessToken() // Get from context
      })
    });
    
    const verificationResult = await verification.json();
    if (verificationResult.mediator_ack_status === 'granted') {
      // Safe to reward user
      grantUserReward();
    }
  }
}
```

---

## Step 5: API Endpoints to Create

### `/api/approve-payment` (Backend)

```typescript
// This calls the Supabase edge function
export async function approvePayment(paymentId: string) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/pi-payment-approve`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId })
    }
  );
  
  return response.json();
}
```

### `/api/complete-payment` (Backend)

```typescript
// This calls the Supabase edge function
export async function completePayment(paymentId: string, txid: string) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/pi-payment-complete`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId, txid })
    }
  );
  
  return response.json();
}
```

### `/api/verify-rewarded-ad` (Backend)

```typescript
// This calls the Supabase edge function
export async function verifyRewardedAd(adId: string, accessToken: string) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/pi-ad-verify`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ adId, accessToken })
    }
  );
  
  return response.json();
}
```

---

## Step 6: File Organization

### Current Structure

```
src/
├── lib/
│   ├── pi-sdk.ts (OLD - keep for reference)
│   └── pi-sdk-new.ts (NEW - use this)
├── contexts/
│   ├── PiAuthContext.tsx (OLD - keep for reference)
│   └── PiAuthContext-new.tsx (NEW - use this)
└── pages/
    └── Auth.tsx (update imports)

supabase/functions/
├── pi-auth/
├── pi-payment-approve/ (updated)
├── pi-payment-complete/
└── pi-ad-verify/
```

### Final Structure (after migration)

Once everything works, you can:

```bash
# Delete old files
rm src/lib/pi-sdk.ts
rm src/contexts/PiAuthContext.tsx

# Rename new files to original names
mv src/lib/pi-sdk-new.ts src/lib/pi-sdk.ts
mv src/contexts/PiAuthContext-new.tsx src/contexts/PiAuthContext.tsx

# Update all imports to use the original names
```

---

## Key Differences from Old Implementation

| Aspect | Old | New |
|--------|-----|-----|
| **Auth Flow** | Complex, multi-step | Simple, official pattern |
| **Payment Handling** | Custom logic | Official Phase I/II/III pattern |
| **Error Handling** | Generic | Specific Pi errors |
| **Ad Network** | Basic | Full support with verification |
| **Documentation** | Custom | Official docs reference |
| **Type Safety** | Partial | Complete |

---

## Troubleshooting

### "Pi SDK not available"
- Make sure the app is opened in **Pi Browser**, not regular browser
- Pi Network features only work in Pi Browser

### "Authentication failed"
- Check that API key is set correctly in environment
- Verify you're using the correct mainnet endpoint
- Check browser console for specific error

### "Payment failed to approve"
- Verify Pi API key is set in Supabase secrets
- Check that the payment ID is valid
- Monitor Supabase function logs

### "Ad network not supported"
- User's Pi Browser version is too old
- Suggest user update Pi Browser
- Check `Pi.nativeFeaturesList()` for `'ad_network'` entry

---

## Next Steps

1. ✅ Update environment variables
2. ✅ Update imports in your components
3. ✅ Update App.tsx provider
4. ✅ Set Supabase secrets
5. ✅ Deploy edge functions
6. ✅ Test in Pi Browser
7. ✅ Deploy to production

---

## Support

- **Official Docs**: https://pi-apps.github.io/community-developer-guide/
- **GitHub Docs**: https://github.com/pi-apps/pi-platform-docs
- **Demo App**: https://github.com/pi-apps/demo

---

**Status**: Ready for Implementation  
**Documentation**: Official Pi Platform  
**API**: v2 (Latest)  
**Network**: Mainnet
