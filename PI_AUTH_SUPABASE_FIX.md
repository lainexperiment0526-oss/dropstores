# Pi Authentication Troubleshooting Guide

## 🚨 Pi Auth Not Working - Quick Fix

### Issue Summary
You're experiencing Pi authentication failures with your Supabase setup, likely due to:
1. **Incomplete service role key** in Edge Function environment
2. **Missing environment variables** deployed as Supabase secrets
3. **Network configuration mismatch** (sandbox vs mainnet)

---

## 🔧 Step-by-Step Fix

### Step 1: Fix Service Role Key ✅
**Problem**: Your service role key was truncated (`sb_secret_...` instead of full JWT)
**Solution**: Updated `supabase/.env` with correct service role key

```bash
# OLD (incomplete):
SUPABASE_SERVICE_ROLE_KEY=sb_secret_SIqZm1fCy5acyRwenl9mFA_TWMrksAD

# NEW (correct):  
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cWZubWRreGFjbHNueXV6a3lwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE5MjU0NCwiZXhwIjoyMDgxNzY4NTQ0fQ.z6wgqg7RJMaTYX2AZUJdFUeqxF7o9n5MQO3vCfTjJ8
```

### Step 2: Deploy Secrets
**Problem**: Environment variables weren't deployed as Supabase secrets
**Solution**: Run the deployment script

```powershell
# First login to Supabase (if needed)
npx supabase login

# Deploy all secrets
.\deploy-secrets.ps1
```

### Step 3: Verify Configuration ✅
**Problem**: Sandbox/mainnet configuration mismatch
**Solution**: Ensured consistent mainnet configuration

```env
VITE_PI_SANDBOX_MODE="false"     ✅
VITE_PI_MAINNET_MODE="true"      ✅  
VITE_PI_NETWORK="mainnet"        ✅
```

---

## 🧪 Testing Your Fix

### Test 1: Check Edge Function
```powershell
# Test if edge function responds
$url = "https://kvqfnmdkxaclsnyuzkyp.supabase.co/functions/v1/pi-auth"
Invoke-WebRequest -Uri $url -Method OPTIONS
```
**Expected**: Status 200 with CORS headers

### Test 2: Check Secrets
```powershell
npx supabase secrets list --project-ref kvqfnmdkxaclsnyuzkyp
```
**Expected**: Should show PI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

### Test 3: Pi Authentication
1. Open **Pi Browser** (web.minepi.com or mobile app)
2. Navigate to your app: `https://dropshops.space`
3. Click "Sign in with Pi"
4. Complete Pi authentication
5. Check browser console for errors

---

## 🔍 Common Issues & Solutions

### Issue: "EarlyDrop" in Function Logs
**Cause**: Environment variables not accessible to Edge Function
**Fix**: Run `.\deploy-secrets.ps1` to deploy secrets properly

### Issue: "Failed to verify Pi authentication"  
**Cause**: Service role key incomplete or wrong
**Fix**: Updated service role key to full JWT token ✅

### Issue: "Pi SDK not available"
**Cause**: App not running in Pi Browser
**Fix**: Must use Pi Browser (not Chrome/Safari)

### Issue: "Network mismatch" 
**Cause**: Sandbox mode enabled but using mainnet credentials
**Fix**: Set `VITE_PI_SANDBOX_MODE="false"` ✅

---

## 📊 Verification Checklist

- [x] Service role key is full JWT token (starts with `eyJ`)
- [x] Mainnet mode enabled (`VITE_PI_SANDBOX_MODE="false"`)
- [ ] Supabase secrets deployed (run `.\deploy-secrets.ps1`)
- [ ] Edge function responding (status 200)
- [ ] Pi Browser used for testing
- [ ] Pi authentication completes without errors

---

## 🚀 Expected Flow After Fix

### 1. Frontend (Pi Browser)
```javascript
// Pi SDK initializes in mainnet mode
initPiSdk(false) // sandbox = false ✅

// User clicks "Sign in with Pi"
const result = await authenticateWithPi()
// Returns: { user: { uid, username, wallet_address }, accessToken }
```

### 2. Backend (Supabase Edge Function)
```javascript
// pi-auth function receives request
const { accessToken, piUser } = await req.json()

// Verifies with Pi API using mainnet endpoint
const response = await fetch('https://api.minepi.com/v2/me', {
  headers: { Authorization: `Bearer ${accessToken}` }
})

// Creates/updates Supabase user
// Returns session token
```

### 3. Session Management
```javascript
// Frontend receives session from backend
const { session } = await supabase.functions.invoke('pi-auth', { ... })

// Sets Supabase session
await supabase.auth.setSession(session)

// User is now authenticated ✅
```

---

## 📞 Support Commands

### Check Function Logs
```powershell
npx supabase functions logs pi-auth --project-ref kvqfnmdkxaclsnyuzkyp --follow
```

### Test Individual Components
```powershell
# Test Pi-auth function only
.\test-pi-functions.ps1

# Test entire Pi integration  
.\test-pi-integration.ps1
```

### Reset If Needed
```powershell
# Re-deploy all edge functions
.\deploy-edge-functions.ps1

# Re-deploy secrets
.\deploy-secrets.ps1
```

---

## ✨ Success Indicators

When everything is working correctly, you should see:

1. **Console Logs** (in Pi Browser):
   ```
   ✅ Pi SDK initialized successfully
   ✅ Pi authentication completed
   ✅ Backend verification successful  
   ✅ Supabase session created
   ```

2. **Function Logs**:
   ```
   Pi Auth: User verified successfully: { username: "yourname", uid: "xxx", hasWallet: true }
   Pi Auth: Session created successfully for: yourname
   ```

3. **User Experience**:
   - Pi authentication completes without errors
   - User is logged into your app
   - Dashboard/protected routes accessible
   - Pi username displays correctly

---

**Your Pi Authentication should now be working correctly!** 🎉