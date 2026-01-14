# Quick Deployment Guide - Payment Cancel Fix

## ⚡ Deploy in 2 Minutes

### Option 1: Deploy Single Function (Fastest)

```powershell
# Deploy only the new cancel function
supabase functions deploy pi-payment-cancel --project-ref kvqfnmdkxaclsnyuzkyp
```

### Option 2: Deploy All Functions

```powershell
# Run the deployment script
.\deploy-edge-functions.ps1
```

---

## ✅ Verify Deployment

### Check Function Status
```powershell
supabase functions list --project-ref kvqfnmdkxaclsnyuzkyp
```

You should see `pi-payment-cancel` in the list.

### Test the Function

1. Go to Supabase Dashboard
2. Navigate to Edge Functions → pi-payment-cancel
3. Check the logs for any deployment errors

---

## 🧪 Test in App

1. Open app in Pi Browser
2. Go to Subscription page
3. Try to make a payment
4. Cancel the payment mid-transaction
5. You should see:
   - Toast: "Auto-cancelling in 3 seconds..."
   - Payment auto-cancelled
   - Success message
6. OR click "Force Cancel Payment" button

---

## 🔍 Check Logs

### View Edge Function Logs
```powershell
# In Supabase Dashboard:
# Edge Functions → pi-payment-cancel → Logs
```

Look for:
- ✅ `🚫 Cancelling payment:`
- ✅ `✓ Payment cancelled via Pi API`
- ✅ `✓ Updated local payment record`

---

## 🎯 What Should Work Now

1. ✅ Auto-cancel after 3 seconds when payment error occurs
2. ✅ Force cancel button visible and working
3. ✅ Payment state resets after cancellation
4. ✅ User can make new payment immediately
5. ✅ No more stuck payments

---

## 🆘 If Something Goes Wrong

### Function Not Deploying
```powershell
# Check Supabase CLI version
supabase --version

# Login again if needed
supabase login

# Try deploying with verbose logging
supabase functions deploy pi-payment-cancel --project-ref kvqfnmdkxaclsnyuzkyp --debug
```

### Function Deployed But Not Working
1. Check environment variables in Supabase Dashboard
2. Verify `PI_API_KEY` is set
3. Check edge function logs for errors
4. Verify CORS headers are correct

### Frontend Not Calling Function
1. Check browser console for errors
2. Verify user is authenticated
3. Check network tab for failed requests
4. Ensure Supabase client is initialized

---

## 📝 Environment Variables Required

Make sure these are set in Supabase Dashboard:

```
PI_API_KEY=your_production_pi_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

---

## ✨ Done!

After deployment:
- Refresh your app
- Test the cancel functionality
- Monitor logs for any issues
- Celebrate fixing stuck payments! 🎉
