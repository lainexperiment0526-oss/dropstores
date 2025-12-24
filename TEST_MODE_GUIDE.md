# 🧪 Test Mode Guide - Mock Payments for Subscription Testing

## Overview
Test Mode allows you to bypass Pi Network payments and test all subscription plans and gift card features without requiring Pi payment edge functions to work.

---

## ✅ What Was Added

### 1. Test Mode Toggle
- **Location:** Top-right corner of Subscription page header
- **Button:** "Enable Test Mode" / "🧪 Test Mode ON"
- **Function:** Switches between real Pi payments and mock payments

### 2. Mock Payment Function
- **What it does:** Directly creates subscriptions in the database
- **Duration:** 30 days (same as paid plans)
- **Amount:** Uses plan prices from SUBSCRIPTION_PLANS
- **Status:** Active immediately

### 3. Updated Subscribe Buttons
All subscription plan buttons now:
- Show "🧪 Test Subscribe" when test mode is ON
- Show "Subscribe" with Pi coin icon when test mode is OFF
- Work without Pi Browser when in test mode
- Display "Activating..." during test mode subscription creation

---

## 🚀 How to Use Test Mode

### Step 1: Enable Test Mode
1. Navigate to `/subscription` page
2. Click "Enable Test Mode" button in the header
3. You'll see a blue alert: "🧪 Test Mode Enabled"

### Step 2: Subscribe to Any Plan
1. Scroll to any paid plan (Basic, Grow, Advance, Plus)
2. Click the "🧪 Test Subscribe" button
3. Subscription activates instantly (no Pi payment required)
4. Success message appears
5. Redirects to dashboard after 2 seconds

### Step 3: Test Gift Cards
Once you have an active subscription:
1. Go to `/redeem-gift-card`
2. Use the "Purchase" tab
3. Fill in recipient details
4. Select a plan to gift
5. In test mode, you can bypass payment flow

---

## 📋 Test Scenarios

### Scenario 1: Test Basic Subscription
```
1. Enable test mode
2. Click "🧪 Test Subscribe" on Basic plan
3. ✅ Subscription activated
4. Check dashboard for active subscription
```

### Scenario 2: Test Gift Card Purchase
```
1. Have active subscription (use test mode to get one)
2. Go to /redeem-gift-card
3. Fill in gift card details
4. In production, would require Pi payment
5. Test mode allows bypass for testing
```

### Scenario 3: Test Gift Card Redemption
```
1. Create gift card (needs database record)
2. Go to /redeem-gift-card
3. Enter gift code in "Redeem" tab
4. Click "Redeem Code"
5. ✅ Subscription activated from gift card
```

### Scenario 4: Test Multiple Subscriptions
```
1. Enable test mode
2. Subscribe to Basic plan
3. After expiry (or manually delete from database)
4. Subscribe to Grow plan
5. Test upgrade flow
```

---

## 🔧 Technical Details

### Mock Payment Function Location
**File:** `src/pages/Subscription.tsx`
**Function:** `handleMockPayment(planType: PlanType)`

### What It Does:
1. Sets loading state (`isActivating = true`)
2. Gets plan details from `SUBSCRIPTION_PLANS`
3. Calculates expiry date (30 days from now)
4. Inserts directly into `subscriptions` table:
   ```typescript
   {
     user_id: user.id,
     plan_type: planType,
     status: 'active',
     amount: plan.amount,
     expires_at: expiryDate.toISOString()
   }
   ```
5. Shows success toast
6. Updates UI with new subscription
7. Redirects to dashboard

### Button Logic:
```typescript
onClick={() => isTestMode ? handleMockPayment('basic') : handleSubscribe('basic')}
disabled={(isProcessing || isActivating || (!isPiAvailable && !isTestMode) || piLoading || isCurrentPlan('basic'))}
```

---

## ✨ Benefits of Test Mode

### 1. **No Pi Payment Required**
- Test without Pi Browser
- No edge function dependencies
- Works on any device/browser

### 2. **Instant Activation**
- No waiting for payment processing
- Immediate subscription creation
- Fast iteration for testing

### 3. **Test Gift Cards**
- Create subscriptions for gift card testing
- Test redemption flow
- Verify UI/UX without payment blockers

### 4. **Database Testing**
- Verify subscription creation
- Check RLS policies
- Test data queries

### 5. **UI/UX Testing**
- Test all subscription plan displays
- Verify button states
- Check loading states
- Test redirects

---

## 🚨 Important Notes

### ⚠️ For Development Only
- **DO NOT** use test mode in production
- Test mode bypasses payment validation
- Only for local/staging testing

### ⚠️ Database State
- Test subscriptions are real database records
- You may need to clean up test data
- Check `subscriptions` table periodically

### ⚠️ Gift Card Testing
- Gift card edge function still requires Supabase deployment
- Mock payment only handles subscription creation
- Edge function (`giftcard-redeem`) needs to be deployed for full testing

---

## 📝 Testing Checklist

Before deploying to production, test:

- [ ] Enable/disable test mode toggle
- [ ] Subscribe to Free plan (works without test mode)
- [ ] Subscribe to Basic plan with test mode
- [ ] Subscribe to Grow plan with test mode
- [ ] Subscribe to Advance plan with test mode
- [ ] Subscribe to Plus plan with test mode
- [ ] Check subscription appears in dashboard
- [ ] Verify subscription expiry date (30 days)
- [ ] Test "Current Plan" state after subscribing
- [ ] Test button disabled states
- [ ] Test loading states during activation
- [ ] Test redirect to dashboard after subscribe
- [ ] Create gift card with active subscription
- [ ] Redeem gift card
- [ ] Check both purchased and redeemed tabs

---

## 🐛 Troubleshooting

### Issue: Test Mode button not visible
**Solution:** Check you're on `/subscription` page

### Issue: "Failed to activate subscription"
**Solutions:**
1. Check user is authenticated
2. Verify Supabase connection
3. Check database permissions
4. Look at browser console for errors

### Issue: Subscription not appearing in dashboard
**Solutions:**
1. Refresh dashboard page
2. Check database for subscription record
3. Verify `user_id` matches logged-in user
4. Check subscription `status` is 'active'

### Issue: Can't purchase gift cards
**Solutions:**
1. Need active subscription first (use test mode)
2. Gift card purchase still requires backend integration
3. Edge function deployment needed

---

## 🎯 Next Steps

### For Full Testing:
1. ✅ Use test mode to activate subscriptions
2. ⏳ Deploy `giftcard-redeem` edge function
3. ⏳ Deploy `20251224_create_giftcards.sql` migration
4. ⏳ Test complete gift card flow

### For Production:
1. ⏳ Fix Pi payment edge functions
2. ⏳ Test real Pi payments in Pi Browser
3. ⏳ Disable test mode in production
4. ⏳ Monitor payment flow

---

## 📊 Database Queries for Testing

### Check Created Subscriptions:
```sql
SELECT * FROM subscriptions 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC;
```

### Check Gift Cards:
```sql
SELECT * FROM giftcards 
WHERE purchased_by = 'YOUR_USER_ID' 
ORDER BY created_at DESC;
```

### Delete Test Subscription:
```sql
DELETE FROM subscriptions 
WHERE user_id = 'YOUR_USER_ID' 
AND plan_type = 'basic';
```

---

## ✅ Summary

**Test Mode is now active!** You can:
1. ✅ Test all subscription plans instantly
2. ✅ Bypass Pi payment requirements
3. ✅ Create subscriptions for gift card testing
4. ✅ Verify UI/UX flows end-to-end
5. ✅ Test database operations

**Enable test mode** → **Click "🧪 Test Subscribe"** → **Subscription activated!**

---

*Created: December 25, 2024*
*Purpose: Enable testing without Pi payment edge functions*
*Status: Ready to use*
