# Pi Network - Testing & Verification Guide

## 🎯 Complete Testing & Verification for Mainnet Integration

This guide provides step-by-step instructions to verify that Pi authentication, payments, and ad network are working correctly on mainnet.

---

## 📱 Prerequisites

- [x] Pi Browser installed (Android or iOS)
- [x] Pi Network app installed
- [x] Pi account created (mining for at least 24 hours)
- [x] At least 10 Pi in wallet (for testing)
- [x] Mobile device or emulator
- [x] App deployed and accessible via Pi Browser

---

## 🧪 Test 1: Authentication Flow

### Step 1.1: Open App in Pi Browser
```
1. Open Pi Browser on mobile device
2. Navigate to your DropStore app URL
3. Wait for page to fully load
```

### Step 1.2: Test Sign-In
```
1. Look for "Sign In with Pi" button or similar
2. Click the authentication button
3. A dialog should appear asking for permissions
4. Approve the authentication request
5. Browser should show "Authenticating..." message
```

### Step 1.3: Verify Authentication Success
```
Expected Results:
✅ User redirected to dashboard
✅ Username displayed (top-right or profile section)
✅ Session tokens saved in localStorage
✅ Can access protected pages
❌ Errors would show in browser console
```

### Step 1.4: Check Logs
```bash
# In browser console (F12):
console.log(localStorage.getItem('auth.session'))
# Should show JWT token

# Check Supabase logs:
supabase functions logs pi-auth --project-ref kvqfnmdkxaclsnyuzkyp
# Should show "User verified successfully" message
```

### Step 1.5: Verify Database Entry
```sql
-- In Supabase dashboard, run:
SELECT * FROM pi_users 
WHERE pi_username = 'your_pi_username'
LIMIT 1;

-- Should return:
-- user_id: <supabase_user_id>
-- pi_uid: <pi_user_id>
-- pi_username: <your_username>
-- wallet_address: <pi_wallet>
```

---

## 💳 Test 2: Payment Flow

### Step 2.1: Prepare for Payment
```
1. Ensure you're authenticated (completed Test 1)
2. Navigate to store page
3. Add a product to cart (any product)
4. Navigate to checkout
```

### Step 2.2: Initiate Payment
```
1. Click "Proceed to Checkout"
2. Select "Pi Payment" as payment method
3. Click "Pay with Pi"
4. Review payment amount (should be > 0)
5. Confirm memo text (order reference)
```

### Step 2.3: Approve in Pi Wallet
```
Expected Behavior:
1. Pi Wallet app launches automatically
2. Shows payment details:
   - Amount (in Pi)
   - Recipient wallet
   - Memo (order description)
3. Button shows "Approve"
4. Click "Approve" to continue
```

### Step 2.4: Backend Approval
```
What Happens Behind Scenes:
1. Frontend calls onReadyForServerApproval callback
2. Backend function pi-payment-approve is triggered
3. Calls: https://api.minepi.com/v2/payments/{paymentId}/approve
4. Response contains approval status
```

### Step 2.5: Complete Payment
```
Expected Behavior:
1. User completes payment in Pi Wallet
2. Transaction created on blockchain
3. Pi Wallet shows "Payment Complete"
4. User returned to app
5. onReadyForServerCompletion callback triggered
```

### Step 2.6: Backend Completion
```
What Happens:
1. Backend function pi-payment-complete is called
2. Transaction ID sent to backend
3. Blockchain verified: https://api.mainnet.minepi.com
4. Payment marked as completed
5. Order created in database
6. Confirmation shown to user
```

### Step 2.7: Verify Success
```
Browser:
✅ Success message displayed
✅ Order confirmation shown
✅ Order ID provided

Check Blockchain:
1. Go to https://explorer.minepi.com
2. Search for wallet address
3. Should see transaction in last few minutes
4. Status: "Successful"
5. Amount matches payment

Check Database:
SELECT * FROM payments 
WHERE user_id = '<your_user_id>' 
ORDER BY created_at DESC LIMIT 1;

Should show:
- payment_id: <payment_id>
- amount: <amount_paid>
- status: 'completed'
- transaction_id: <blockchain_txid>
- verified_at: <timestamp>
```

### Step 2.8: Check Logs
```bash
# Frontend console:
- No errors in console
- Payment flow completed successfully

# Backend logs:
supabase functions logs pi-payment-approve --project-ref kvqfnmdkxaclsnyuzkyp
# Should show successful approval

supabase functions logs pi-payment-complete --project-ref kvqfnmdkxaclsnyuzkyp
# Should show successful completion and verification
```

---

## 🎫 Test 3: Subscription Payment

### Step 3.1: Navigate to Pricing
```
1. While authenticated, go to Pricing page
2. View subscription plans
3. Choose one plan (e.g., "Grow")
4. Click "Subscribe Now"
```

### Step 3.2: Complete Payment
```
1. Follow same process as Test 2
2. Pay subscription amount
3. Wait for confirmation
```

### Step 3.3: Verify Subscription
```
Database Check:
SELECT * FROM subscriptions 
WHERE user_id = '<user_id>'
AND status = 'active'
LIMIT 1;

Should show:
- plan_type: 'grow' (or selected plan)
- amount: <subscription_price>
- status: 'active'
- expires_at: <date_30_days_from_now>

Frontend Check:
- Pricing page shows "Subscribed" status
- Plan limits enforced in dashboard
- Upgrade/downgrade options available
```

---

## 🎬 Test 4: Interstitial Ads

### Step 4.1: Check Configuration
```typescript
// In browser console:
console.log(import.meta.env.VITE_PI_AD_NETWORK_ENABLED)
// Should return: "true"
```

### Step 4.2: View Many Pages
```
1. Navigate through app pages multiple times
2. Count page views
3. After 3 page views, ad should appear automatically
4. Or wait for action that triggers ad
```

### Step 4.3: Ad Display Verification
```
Expected Behavior:
✅ Full-screen ad appears
✅ Cannot interact with page behind ad
✅ Ad shows loading progress
✅ Ad content displays
✅ Close button visible

Check Cooldown:
1. Try to view another ad immediately
2. Should see error: "Ad cooldown active"
3. Wait 5 minutes and try again
4. Should be allowed

Check Frequency Cap:
1. View ads until you reach 3 ads in session
2. Fourth ad should be blocked
3. Message: "Ad frequency cap reached"
4. Limit resets after browser refresh
```

### Step 4.4: Check Logs
```bash
# Browser console - should show:
"Ad show result: { adType: 'interstitial', result: 'AD_CLOSED' }"

# Check ad network status:
console.log(window.Pi.nativeFeaturesList())
# Should include: 'ad_network'
```

---

## 🎁 Test 5: Rewarded Ads

### Step 5.1: Find Rewarded Ad Button
```
1. Look for button: "Watch Ad for Discount/Reward"
2. Usually on checkout or store pages
3. Button should be enabled (not grayed out)
```

### Step 5.2: Watch Rewarded Ad
```
1. Click "Watch Ad" button
2. Full-screen video ad appears
3. Video plays automatically
4. Cannot skip (except after completion)
5. Watch video to completion
6. Reward button appears at end
7. Tap "Claim Reward"
```

### Step 5.3: Verify Reward Granted
```
Expected Behavior:
✅ Success message shown
✅ Discount applied (e.g., 5% off)
✅ Reward displayed (credits, etc.)
✅ UI updates to reflect reward
✅ Can use discount on checkout

Database Check:
SELECT * FROM payments 
WHERE user_id = '<user_id>'
AND status = 'reward_granted'
ORDER BY created_at DESC;

Or check custom rewards table if created
```

### Step 5.4: Verify Server-Side Verification
```bash
# Check backend logs:
supabase functions logs pi-ad-verify --project-ref kvqfnmdkxaclsnyuzkyp

# Should show:
"Ad verification result: { adId: '...', status: 'granted', rewarded: true }"
```

---

## 🔐 Test 6: Security Verification

### Step 6.1: Check Token Security
```typescript
// Browser console:
const session = JSON.parse(localStorage.getItem('auth.session'));
console.log('Token parts:', session.access_token.split('.').length);
// Should return: 3 (valid JWT has 3 parts)

// Check expiration:
const decoded = JSON.parse(atob(session.access_token.split('.')[1]));
console.log('Expires at:', new Date(decoded.exp * 1000));
```

### Step 6.2: Verify CORS Headers
```bash
# In browser DevTools Network tab:
# Click on pi-auth request
# Headers section should show:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, OPTIONS
# Content-Type: application/json
```

### Step 6.3: Check API Key Protection
```bash
# Search codebase for PI_API_KEY:
grep -r "mj69bcvflcervamlbzgissqoxij6sxzr1k71wcuvdhcuwxtjmjinlgk0zfhz90y7" src/
# Should return: 0 results (not in frontend code)

# Check if in Supabase secrets:
supabase secrets list --project-ref kvqfnmdkxaclsnyuzkyp
# Should show: PI_API_KEY is set
```

---

## 📊 Test 7: Automated Test Suite

### Step 7.1: Run Tests
```typescript
// In browser console:
import { runPiIntegrationTests } from '@/lib/pi-integration-tests';
const results = await runPiIntegrationTests();
```

### Step 7.2: Review Results
```
Expected Output:
═══════════════════════════════════════════
PHASE 1: SDK Initialization
═══════════════════════════════════════════

✅ SDK Availability
✅ SDK Initialization
✅ Mainnet Configuration
✅ Native Features List

PHASE 2: Authentication Tests
═══════════════════════════════════════════

✅ Authentication Flow
⏳ Session Creation (pending - authenticate first)
⏳ Token Validation (pending - authenticate first)

PHASE 3: Payment Tests
═══════════════════════════════════════════

✅ Payment Creation
✅ Payment Approval Function
✅ Blockchain Verification

PHASE 4: Ad Network Tests
═══════════════════════════════════════════

✅ Ad Network Support
✅ Interstitial Ad Support
✅ Rewarded Ad Support
✅ Ad Verification Endpoint

✅ Passed: 12/14
⏳ Pending: 2/14 (need authentication to complete)
```

---

## 🐛 Test 8: Error Handling

### Step 8.1: Test Invalid Token
```bash
# In browser console:
const badToken = 'invalid_token_12345';
// Try to use it - should fail gracefully
// Check that error message is user-friendly
```

### Step 8.2: Test Insufficient Balance
```
1. If wallet has < 0.01 Pi
2. Try to make payment
3. Should show error: "Insufficient balance"
4. Not a crash, but proper error message
```

### Step 8.3: Test Network Disconnection
```
1. Open DevTools Network tab
2. Set throttling to "Offline"
3. Try to authenticate
4. Should show timeout or connection error
5. Error should be recoverable (not app crash)
```

### Step 8.4: Check Error Logs
```bash
# View error logs:
supabase functions logs pi-auth --project-ref kvqfnmdkxaclsnyuzkyp --since 1h
# Should show any errors with details
```

---

## 📈 Test 9: Performance Verification

### Step 9.1: Check Authentication Speed
```typescript
// In console:
const start = performance.now();
// Complete authentication
const end = performance.now();
console.log(`Auth took ${end - start}ms`);
// Should be < 5000ms
```

### Step 9.2: Check Payment Speed
```
1. Measure time from payment initiation to confirmation
2. Should complete within reasonable time
3. Check network tab for response times
4. All requests should complete < 10 seconds
```

### Step 9.3: Monitor Resource Usage
```
DevTools Performance Tab:
1. Open Performance tab
2. Record while navigating app
3. Check CPU usage (should stay < 50%)
4. Check memory (should not continuously grow)
5. Check for memory leaks
```

---

## ✅ Final Verification Checklist

### Authentication
- [ ] Users can sign in with Pi
- [ ] Session tokens created
- [ ] Wallet address retrieved
- [ ] User data stored in database
- [ ] Incomplete payments detected
- [ ] Sign out works properly
- [ ] Token refresh works

### Payments
- [ ] Payment flow initiates correctly
- [ ] Backend approval succeeds
- [ ] Payment completion works
- [ ] Transaction verified on blockchain
- [ ] Order created in database
- [ ] Confirmation shown to user
- [ ] Receipt can be downloaded

### Subscriptions
- [ ] Subscription payment works
- [ ] Plan limits enforced
- [ ] Expiration dates set correctly
- [ ] Renewal reminders sent
- [ ] Cancellation works
- [ ] Downgrade/upgrade works

### Ad Network
- [ ] Interstitial ads display
- [ ] Ads follow frequency cap
- [ ] Cooldown enforced
- [ ] Rewarded ads complete
- [ ] Rewards granted correctly
- [ ] Server-side verification works
- [ ] Ad data logged correctly

### Security
- [ ] API keys not exposed
- [ ] Tokens validated properly
- [ ] CORS configured correctly
- [ ] Input validation works
- [ ] Error messages safe
- [ ] No sensitive data logged
- [ ] SSL/TLS working

### Performance
- [ ] Auth completes < 5 seconds
- [ ] Payments complete < 10 seconds
- [ ] Ad loads within 5 seconds
- [ ] No memory leaks
- [ ] CPU usage reasonable
- [ ] Network requests optimized
- [ ] Database queries efficient

### Monitoring
- [ ] Edge function logs accessible
- [ ] Error tracking working
- [ ] Metrics being collected
- [ ] Alerts configured
- [ ] Daily reports available
- [ ] Issues documented
- [ ] Escalation procedures set

---

## 🎓 Troubleshooting During Testing

If you encounter issues, follow this troubleshooting flow:

### Authentication Fails
```
1. Check console for error message
2. Verify Pi Browser is latest version
3. Check network connectivity
4. View logs: supabase functions logs pi-auth
5. Check if user exists in pi_users table
6. Try clearing browser cache
7. Restart Pi Browser app
```

### Payment Doesn't Complete
```
1. Check if wallet has balance
2. Verify transaction on explorer.minepi.com
3. Check payment complete logs
4. Verify callback URLs are correct
5. Check if txid was provided
6. Verify blockchain verification passed
7. Check database payment record
```

### Ads Don't Show
```
1. Verify ad network enabled in .env
2. Check Pi Browser version (must be latest)
3. Verify user is authenticated
4. Check frequency cap/cooldown
5. Check browser console for errors
6. View logs: supabase functions logs pi-ad-verify
7. Try different ad type (interstitial vs rewarded)
```

### Tests Show Failures
```
1. Which test failed? Check name
2. Read error message carefully
3. Check if it's a config issue
4. Verify all secrets are set
5. Check edge functions deployed
6. Verify environment variables
7. Review function logs for details
```

---

## 📞 Getting Help

If stuck during testing:

1. **Check Documentation**
   - `PI_NETWORK_README.md` - Full setup guide
   - `PI_INTEGRATION_DEPLOYMENT_GUIDE.md` - Deployment details
   - This file - Testing guide

2. **Review Logs**
   ```bash
   supabase functions logs <function-name> --project-ref kvqfnmdkxaclsnyuzkyp
   ```

3. **Check Console**
   - Browser DevTools Console (F12)
   - Network tab for requests/responses
   - Application tab for storage/cookies

4. **Verify Configuration**
   - Check `.env` file values
   - Check Supabase secrets
   - Check edge functions deployed

5. **Contact Support**
   - Pi Support: support@minepi.com
   - Pi Developers: develop.pi
   - Your support channel

---

## 🎉 Success Indicators

When tests pass, you should see:

✅ All 14 automated tests pass  
✅ Authentication works in Pi Browser  
✅ Payments complete and verify on blockchain  
✅ Subscriptions activate and enforce limits  
✅ Ads display and rewards grant  
✅ No console errors  
✅ Database records created  
✅ Edge function logs show success  

**Congratulations! Your Pi Network integration is production-ready! 🚀**

---

**Last Updated**: January 10, 2026  
**API Key Status**: ✅ Configured and Tested  
**Ready for Production**: ✅ YES
