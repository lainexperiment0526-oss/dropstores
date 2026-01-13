# Pi Ad Network - Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Access demo page
http://localhost:8081/ads-demo

# View documentation
./PI_AD_NETWORK_SETUP_GUIDE.md
./PI_AD_NETWORK_COMPLETE.md
./PI_ADNETWORK_IMPLEMENTATION.md
./PI_AD_NETWORK_ARCHITECTURE.md
```

---

## 📦 Import Statements

```tsx
// Hook
import { usePiAdNetwork } from '@/hooks/usePiAdNetwork';

// Components
import { RewardedAdButton } from '@/components/ads/RewardedAdButton';
import { InterstitialAdTrigger } from '@/components/ads/InterstitialAdTrigger';
import { AdNetworkWidget } from '@/components/ads/AdNetworkWidget';

// Pi SDK Functions (if needed directly)
import { 
  isPiAdReady, 
  showPiAd, 
  requestPiAd 
} from '@/lib/pi-sdk';
```

---

## 🎯 Common Use Cases

### 1. Basic Interstitial Ad
```tsx
const { showInterstitialAd } = usePiAdNetwork();

// On button click
<Button onClick={() => showInterstitialAd()}>
  Show Ad
</Button>
```

### 2. Automatic Interstitial Every 3 Actions
```tsx
<InterstitialAdTrigger 
  actionCount={actionCounter}
  showEvery={3}
/>
```

### 3. Rewarded Ad Button
```tsx
<RewardedAdButton
  onReward={(adId) => grantUserReward(adId)}
  buttonText="Get Bonus"
/>
```

### 4. Custom Rewarded Ad Logic
```tsx
const { showRewardedAd } = usePiAdNetwork();

const handleCustomReward = async () => {
  const result = await showRewardedAd();
  
  if (result.success && result.rewarded && result.adId) {
    // Verify on backend, then grant reward
    await verifyAndGrantReward(result.adId);
  }
};
```

### 5. Check If Can Show Ad
```tsx
const { canShowAd } = usePiAdNetwork();

<Button disabled={!canShowAd}>
  {canShowAd ? 'Show Ad' : 'Please Wait'}
</Button>
```

### 6. Display Session Info
```tsx
const { adSession, config } = usePiAdNetwork();

<p>Ads shown: {adSession.adsShownCount} / {config.frequencyCap}</p>
```

---

## 🔧 Hook API Reference

```tsx
const {
  // Functions
  showInterstitialAd,     // () => Promise<boolean>
  showRewardedAd,         // () => Promise<{success, rewarded?, adId?}>
  resetSession,           // () => void
  
  // State
  canShowAd,              // boolean - Can show ad right now?
  isLoading,              // boolean - Ad currently loading?
  adNetworkSupported,     // boolean | null - Device supports ads?
  
  // Session Data
  adSession: {
    adsShownCount,        // number
    lastAdShownAt         // number | null (timestamp)
  },
  
  // Config
  config: {
    enabled,              // boolean
    interstitialEnabled,  // boolean
    rewardedEnabled,      // boolean
    cooldownMinutes,      // number
    frequencyCap          // number
  }
} = usePiAdNetwork();
```

---

## 🎨 Component Props

### RewardedAdButton
```tsx
<RewardedAdButton
  onReward={(adId: string) => Promise<void>}  // Required
  rewardText="You earned a reward!"           // Optional
  buttonText="Watch Ad"                       // Optional
  className="custom-class"                    // Optional
  disabled={false}                            // Optional
/>
```

### InterstitialAdTrigger
```tsx
<InterstitialAdTrigger
  trigger={boolean}         // Optional - Manual trigger
  actionCount={number}      // Optional - Show every N actions
  showEvery={3}            // Optional - Action frequency
  delay={1000}             // Optional - Delay in ms
/>
```

### AdNetworkWidget
```tsx
<AdNetworkWidget />  // No props needed
```

---

## ⚙️ Environment Variables

```env
# Core Settings
VITE_PI_AD_NETWORK_ENABLED="true"        # Master switch
VITE_PI_INTERSTITIAL_ADS_ENABLED="true"  # Interstitial ads
VITE_PI_REWARDED_ADS_ENABLED="true"      # Rewarded ads

# Session Management
VITE_PI_AD_COOLDOWN_MINUTES="5"          # Minutes between ads
VITE_PI_AD_FREQUENCY_CAP="3"             # Max ads per session

# SDK Config
VITE_PI_AD_NETWORK_VERSION="2.0"         # SDK version
```

---

## 📊 Response Types

### showInterstitialAd()
```tsx
// Returns: boolean
true   // Ad shown successfully
false  // Ad failed to show
```

### showRewardedAd()
```tsx
// Returns: Promise<{success, rewarded?, adId?}>
{
  success: true,
  rewarded: true,
  adId: "ad-123-456-789"
}

// Or on failure:
{
  success: false
}
```

---

## 🔍 Debugging Tips

### Check Ad Support
```tsx
const { adNetworkSupported } = usePiAdNetwork();
console.log('Ad Network Supported:', adNetworkSupported);
```

### Monitor Session
```tsx
const { adSession } = usePiAdNetwork();
console.log('Session:', adSession);
// { adsShownCount: 2, lastAdShownAt: 1736847000000 }
```

### Check Configuration
```tsx
const { config } = usePiAdNetwork();
console.log('Config:', config);
```

### View Session Storage
```javascript
// In browser console
sessionStorage.getItem('pi_ad_session')
```

### Clear Session
```tsx
const { resetSession } = usePiAdNetwork();
resetSession(); // Clears all session data
```

---

## ⚠️ Common Errors & Solutions

### "Ads not showing"
- ✅ Check `VITE_PI_AD_NETWORK_ENABLED="true"`
- ✅ Verify cooldown hasn't expired
- ✅ Check frequency cap not reached
- ✅ Ensure running in Pi Browser

### "Can't show rewarded ads"
- ✅ User must be authenticated
- ✅ Check `VITE_PI_REWARDED_ADS_ENABLED="true"`
- ✅ Verify Pi SDK initialized

### "Cooldown blocking ads"
- ✅ Wait `VITE_PI_AD_COOLDOWN_MINUTES` minutes
- ✅ Or call `resetSession()` for testing
- ✅ Adjust cooldown in `.env` if needed

### "Frequency cap reached"
- ✅ Refresh page to reset session
- ✅ Or call `resetSession()` for testing
- ✅ Adjust cap in `.env` if needed

---

## 🔐 Security Checklist

### Frontend
- ✅ Use official Pi SDK methods only
- ✅ Never trust client-side verification alone
- ✅ Send `adId` to backend for verification

### Backend (Required for Rewarded Ads)
```tsx
// Backend endpoint example
POST /api/verify-ad
Body: { adId: "ad-123-456-789" }

// Verify with Pi Platform API
GET https://api.minepi.com/v2/ads/{adId}
Header: Authorization: Key YOUR_PI_API_KEY

// Check response
if (response.mediator_ack_status === "granted") {
  // Grant reward
}
```

---

## 📱 Testing Workflow

1. **Open Demo**: http://localhost:8081/ads-demo
2. **Test Interstitial**: Click "Show Interstitial Ad"
3. **Test Rewarded**: Click "Show Rewarded Ad"
4. **Check Session**: View ad count and cooldown
5. **Test Cooldown**: Try showing 2 ads quickly
6. **Test Frequency**: Show 3 ads, try 4th
7. **Test Auto-Trigger**: Click "Perform Action" 3 times
8. **Check History**: View results in demo page

---

## 🎯 Best Practices

### Timing
- ⏱️ Add 1-3 second delay before showing
- 🔄 Show between natural transitions
- ⛔ Never interrupt critical actions

### Frequency
- 📊 Respect cooldown (default: 5 minutes)
- 🔢 Stay within frequency cap (default: 3/session)
- 📉 Less is more - don't overwhelm users

### User Experience
- 💬 Communicate clearly what users will earn
- ✨ Make rewarded ads optional
- 🎁 Provide alternative reward methods
- 🚫 Never force ads on users

### Security
- 🔐 Always verify rewarded ads on backend
- ✅ Check `mediator_ack_status === "granted"`
- 🛡️ Never trust client-side responses
- 📝 Log all ad transactions

---

## 📞 Resources

### Documentation
- [Complete Setup Guide](./PI_AD_NETWORK_SETUP_GUIDE.md)
- [Architecture Overview](./PI_AD_NETWORK_ARCHITECTURE.md)
- [Implementation Details](./PI_ADNETWORK_IMPLEMENTATION.md)

### Official Pi Docs
- [Ad Network Guide](https://github.com/pi-apps/pi-platform-docs/blob/master/ads.md)
- [SDK Reference](https://github.com/pi-apps/pi-platform-docs/blob/master/SDK_reference.md#ads)
- [Platform API](https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md)

### Developer Portal
- https://develop.pinet.com (Apply for monetization)

---

## ✅ Quick Checklist

### Setup
- [x] Environment variables configured
- [x] Pi SDK loaded in index.html
- [x] Hook implemented
- [x] Components created
- [x] Routes configured
- [x] Demo page accessible

### Testing
- [ ] Test in Pi Browser
- [ ] Verify interstitial ads
- [ ] Verify rewarded ads
- [ ] Test cooldown enforcement
- [ ] Test frequency cap
- [ ] Backend verification implemented

### Production
- [ ] Applied for Ad Network approval
- [ ] Backend verification live
- [ ] Loading banner ads enabled (optional)
- [ ] Monitoring setup
- [ ] Ready to deploy! 🚀

---

**Need help? Check the full guide at [PI_AD_NETWORK_SETUP_GUIDE.md](./PI_AD_NETWORK_SETUP_GUIDE.md)**
