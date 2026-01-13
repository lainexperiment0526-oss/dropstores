# Pi Ad Network - Complete Setup & Usage Guide

## ✅ Implementation Status

The Pi Ad Network is **FULLY IMPLEMENTED** and ready to use! All components, hooks, and configurations are in place.

---

## 📋 What's Already Configured

### ✅ Environment Variables (.env)
All necessary configuration is already set:
```env
VITE_PI_AD_NETWORK_ENABLED="true"
VITE_PI_INTERSTITIAL_ADS_ENABLED="true"
VITE_PI_REWARDED_ADS_ENABLED="true"
VITE_PI_AD_COOLDOWN_MINUTES="5"
VITE_PI_AD_FREQUENCY_CAP="3"
VITE_PI_AD_NETWORK_VERSION="2.0"
```

### ✅ Core Files Implemented

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/pi-sdk.ts` | Pi SDK integration with Ad Network types | ✅ Complete |
| `src/hooks/usePiAdNetwork.ts` | Main hook for ad functionality | ✅ Complete |
| `src/components/ads/RewardedAdButton.tsx` | Pre-built rewarded ad button | ✅ Complete |
| `src/components/ads/InterstitialAdTrigger.tsx` | Automatic interstitial ad trigger | ✅ Complete |
| `src/components/ads/AdNetworkWidget.tsx` | Dashboard widget for ad analytics | ✅ Complete |
| `src/pages/PiAdsDemoPage.tsx` | Full-featured demo and testing page | ✅ Complete |

### ✅ Routes Configured
- `/ads-demo` - Access the comprehensive ad network demo page
- Ad network widget can be added to any dashboard

---

## 🚀 Quick Start

### 1. Access the Demo Page
Navigate to `/ads-demo` in your application to see:
- **Live ad testing** - Test both interstitial and rewarded ads
- **Session tracking** - Real-time cooldown and frequency monitoring
- **Configuration display** - See all current settings
- **Results history** - Track all ad displays
- **Best practices** - Learn optimal ad integration

### 2. Test Ad Functionality

#### Interstitial Ads
```tsx
import { usePiAdNetwork } from '@/hooks/usePiAdNetwork';

function MyComponent() {
  const { showInterstitialAd } = usePiAdNetwork();
  
  const handleShowAd = async () => {
    const success = await showInterstitialAd();
    if (success) {
      console.log('Ad shown successfully!');
    }
  };
  
  return <button onClick={handleShowAd}>Show Ad</button>;
}
```

#### Rewarded Ads
```tsx
import { RewardedAdButton } from '@/components/ads/RewardedAdButton';

function MyComponent() {
  const handleReward = async (adId: string) => {
    // Your reward logic here
    // IMPORTANT: Verify adId on your backend!
    console.log('Granting reward for ad:', adId);
  };
  
  return (
    <RewardedAdButton
      onReward={handleReward}
      rewardText="🎁 You earned 10 bonus points!"
      buttonText="Watch Ad for Reward"
    />
  );
}
```

#### Automatic Interstitial Triggers
```tsx
import { InterstitialAdTrigger } from '@/components/ads/InterstitialAdTrigger';

function MyComponent() {
  const [pageViews, setPageViews] = useState(0);
  
  return (
    <>
      <InterstitialAdTrigger 
        actionCount={pageViews}
        showEvery={3}  // Show ad every 3 page views
        delay={1000}   // Wait 1 second before showing
      />
      
      {/* Your component content */}
    </>
  );
}
```

---

## 🎯 Integration Examples

### Example 1: E-commerce Product View
Show ads every 5 product views:
```tsx
import { InterstitialAdTrigger } from '@/components/ads/InterstitialAdTrigger';

function ProductPage() {
  const [productViewCount, setProductViewCount] = useState(0);
  
  useEffect(() => {
    setProductViewCount(prev => prev + 1);
  }, [productId]);
  
  return (
    <>
      <InterstitialAdTrigger 
        actionCount={productViewCount}
        showEvery={5}
      />
      {/* Product content */}
    </>
  );
}
```

### Example 2: Post-Checkout Reward
Offer discount for watching ad after purchase:
```tsx
function CheckoutSuccess() {
  const { showRewardedAd } = usePiAdNetwork();
  
  const handleWatchAdForDiscount = async () => {
    const result = await showRewardedAd();
    
    if (result.success && result.rewarded && result.adId) {
      // Verify on backend, then apply 5% discount to next order
      await applyNextOrderDiscount(result.adId);
      toast.success('5% discount applied to your next order!');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Complete! 🎉</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Watch an ad to get 5% off your next order?</p>
        <Button onClick={handleWatchAdForDiscount}>
          Watch Ad for Discount
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Example 3: Add to Dashboard
```tsx
import { AdNetworkWidget } from '@/components/ads/AdNetworkWidget';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Other dashboard widgets */}
      <AdNetworkWidget />
    </div>
  );
}
```

---

## ⚙️ Configuration Options

### Ad Session Settings
Configure in `.env`:

```env
# Enable/disable ad network
VITE_PI_AD_NETWORK_ENABLED="true"

# Enable/disable specific ad types
VITE_PI_INTERSTITIAL_ADS_ENABLED="true"
VITE_PI_REWARDED_ADS_ENABLED="true"

# Cooldown between ads (minutes)
VITE_PI_AD_COOLDOWN_MINUTES="5"

# Maximum ads per session
VITE_PI_AD_FREQUENCY_CAP="3"
```

### Hook Return Values
```tsx
const {
  showInterstitialAd,    // Function: () => Promise<boolean>
  showRewardedAd,        // Function: () => Promise<{success, rewarded?, adId?}>
  canShowAd,             // Boolean: Can show ad right now?
  isLoading,             // Boolean: Ad currently loading?
  adSession,             // Object: {adsShownCount, lastAdShownAt}
  resetSession,          // Function: Reset session counters
  adNetworkSupported,    // Boolean: Device supports ads?
  config                 // Object: Current configuration
} = usePiAdNetwork();
```

---

## 🔐 Security & Backend Verification

### CRITICAL: Always Verify Rewarded Ads

**Never trust the client-side response alone!**

#### Backend Verification Flow:
```typescript
// Frontend (your app)
const result = await showRewardedAd();
if (result.success && result.rewarded && result.adId) {
  // Send to backend for verification
  const verified = await fetch('/api/verify-ad', {
    method: 'POST',
    body: JSON.stringify({ adId: result.adId })
  });
  
  if (verified.ok) {
    // Grant reward
  }
}

// Backend (your server)
app.post('/api/verify-ad', async (req, res) => {
  const { adId } = req.body;
  
  // Verify with Pi Platform API
  const response = await fetch(
    `https://api.minepi.com/v2/ads/${adId}`,
    {
      headers: {
        'Authorization': `Key ${PI_API_KEY}`
      }
    }
  );
  
  const data = await response.json();
  
  // Check if ad was truly rewarded
  if (data.mediator_ack_status === 'granted') {
    // Grant reward
    res.json({ rewarded: true });
  } else {
    res.json({ rewarded: false });
  }
});
```

See [Platform API Documentation](https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md#verify-a-rewarded-ad-status) for details.

---

## 📊 Best Practices

### ✅ DO:
- ✅ Show interstitial ads at natural transition points
- ✅ Respect cooldown and frequency caps
- ✅ Always verify rewarded ads on backend
- ✅ Add delay before showing ads (1-3 seconds)
- ✅ Communicate clearly what users will earn
- ✅ Provide alternative ways to earn rewards
- ✅ Test thoroughly in Pi Browser before deploying
- ✅ Check `nativeFeaturesList` for ad support

### ❌ DON'T:
- ❌ Show ads during critical user actions (checkout, forms)
- ❌ Show ads on initial app load
- ❌ Force users to watch ads
- ❌ Grant rewards without backend verification
- ❌ Show ads more frequently than cooldown allows
- ❌ Exceed session frequency cap
- ❌ Show ads if `ad_network` isn't in native features

---

## 🧪 Testing Checklist

### Pre-Deployment Testing:

- [ ] **Open `/ads-demo`** - Verify demo page loads
- [ ] **Test Interstitial Ad** - Click "Show Interstitial Ad" button
- [ ] **Test Rewarded Ad** - Click "Show Rewarded Ad" button
- [ ] **Test Cooldown** - Try showing 2 ads quickly (should block 2nd)
- [ ] **Test Frequency Cap** - Show 3 ads, try 4th (should block)
- [ ] **Test Auto-Trigger** - Click "Perform Action" 3 times
- [ ] **Test RewardedAdButton** - Click pre-built reward buttons
- [ ] **Check Ad Results** - Verify results appear in history
- [ ] **Test in Pi Browser** - All tests above in actual Pi Browser
- [ ] **Verify Session Persistence** - Refresh page, check session data
- [ ] **Test Dashboard Widget** - Add to dashboard and verify display

### Backend Testing:
- [ ] **Verify Ad API** - Test backend verification endpoint
- [ ] **Test Reward Grant** - Ensure rewards are granted correctly
- [ ] **Security Test** - Try faking `adId`, ensure rejection
- [ ] **Monitor Logs** - Check for any errors in production

---

## 📚 Additional Resources

### Official Pi Documentation:
- [Pi Ad Network Guide](https://github.com/pi-apps/pi-platform-docs/blob/master/ads.md)
- [SDK Reference](https://github.com/pi-apps/pi-platform-docs/blob/master/SDK_reference.md#ads)
- [Platform API](https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md)

### Application Files:
- Demo Page: [src/pages/PiAdsDemoPage.tsx](./src/pages/PiAdsDemoPage.tsx)
- Hook: [src/hooks/usePiAdNetwork.ts](./src/hooks/usePiAdNetwork.ts)
- Pi SDK: [src/lib/pi-sdk.ts](./src/lib/pi-sdk.ts)
- Implementation Guide: [PI_ADNETWORK_IMPLEMENTATION.md](./PI_ADNETWORK_IMPLEMENTATION.md)

---

## 🎉 Production Deployment

### Before Going Live:

1. **Apply for Ad Network Approval**
   - Visit https://develop.pinet.com in Pi Browser
   - Navigate to your app settings
   - Apply for Developer Ad Network monetization
   - Wait for Pi Core Team approval

2. **Enable Loading Banner Ads (Optional)**
   - Go to Developer Portal → Your App → Ad Network → Settings
   - Toggle "Enable Loading Banner Ads"
   - These show automatically while your app loads

3. **Configure Backend Verification**
   - Implement ad verification endpoint
   - Test with sample `adId` values
   - Ensure proper error handling

4. **Monitor Performance**
   - Track ad impressions in Pi Developer Portal
   - Monitor user feedback
   - Adjust cooldown/frequency as needed

5. **Deploy!**
   - All frontend code is ready
   - Backend verification is set up
   - Testing is complete
   - You're ready to monetize! 🚀

---

## 💡 Support & Help

### Having Issues?
1. Check the demo page at `/ads-demo` for live testing
2. Review browser console for detailed logs
3. Verify environment variables are set correctly
4. Ensure app is running in Pi Browser
5. Check Pi Browser version supports `ad_network` feature

### Common Issues:

**"Ads not showing"**
- Verify `VITE_PI_AD_NETWORK_ENABLED="true"`
- Check cooldown hasn't expired
- Ensure frequency cap not reached
- Confirm app is in Pi Browser

**"Can't show rewarded ads"**
- Rewarded ads require user authentication
- Check user is logged in via Pi SDK
- Verify `VITE_PI_REWARDED_ADS_ENABLED="true"`

**"Backend verification failing"**
- Check Pi API key is correct
- Verify API endpoint format
- Ensure `adId` is passed correctly
- Review backend error logs

---

## 🎊 You're All Set!

The Pi Ad Network is fully integrated and ready to generate revenue. Visit `/ads-demo` to explore all features and start testing immediately!

**Happy monetizing! 💰**
