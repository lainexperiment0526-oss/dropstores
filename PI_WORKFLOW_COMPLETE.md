# Complete Pi Workflow Setup - Sandbox Mode

## ✅ Current Configuration Status

### 1. Pi SDK Initialization
- **Status:** ✅ CONFIGURED FOR SANDBOX
- **Location:** `src/contexts/PiAuthContext.tsx` (Line 45)
- **Setting:** `const isSandbox = true;` (Hardcoded for testing)
- **Files with explicit sandbox mode:**
  - `src/contexts/PiAuthContext.tsx` - Main SDK initialization
  - `src/pages/PublicStore.tsx` - Store payment flow
  - `src/components/store/PaymentModal.tsx` - Payment modal
  - `src/components/store/PaymentModalEnhanced.tsx` - Enhanced payment (2 locations)

### 2. Pi Authentication Flow
- **Status:** ✅ WORKING IN DEV MODE
- **Dev Mode Behavior:** Skips backend edge function verification
- **Path:** `src/contexts/PiAuthContext.tsx` (Line 88-92)
- **Behavior:**
  ```typescript
  // In dev/test mode, skip backend verification and just allow sign-in
  if (import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true') {
    console.warn('PiAuth: Dev mode - Skipping backend verification');
    toast.success(`Welcome, ${result.user.username}! (Dev Mode)`);
    if (shouldNavigate) {
      navigate('/dashboard');
    }
  }
  ```

### 3. Subscription System
- **Status:** ✅ TEST MODE ENABLED
- **Test Mode Location:** `src/pages/Subscription.tsx` (Line 38, 134+)
- **Mock Payment Handler:** `handleMockPayment()` function (Line 134)
- **Features:**
  - Direct database insertion without Pi payment
  - Support for all plan types: `free`, `basic`, `grow`, `advance`, `plus`
  - Handles new subscriptions (INSERT) and updates (UPDATE)
  - Test mode toggle button in header
  - All plan buttons have "🧪 Test Subscribe" option when enabled

### 4. Environment Configuration
- **Supabase URL:** `https://kvqfnmdkxaclsnyuzkyp.supabase.co`
- **Storage URL:** `https://kvqfnmdkxaclsnyuzkyp.storage.supabase.co/storage/v1/s3`
- **Project ID:** `kvqfnmdkxaclsnyuzkyp`
- **File:** `.env` (configured)

### 5. Authentication Options
- **Pi Network Auth:** ✅ Working (dev mode, skips backend verification)
- **Email Sign-In:** ✅ Working (dev mode option on Auth page)
- **Both options require NO edge functions to be deployed**

---

## 🚀 Testing Workflow

### Step 1: Sign In
Choose one method:

**Option A: Email (Recommended)**
1. Go to `/auth`
2. Click **"Sign in with Email (Dev)"**
3. Create account:
   - Email: `test@example.com`
   - Password: `password123`

**Option B: Pi Network**
1. Go to `/auth`
2. Click **"Continue with Pi Network"**
3. Authenticate in Pi Browser/Sandbox
4. Dev mode allows sign-in without backend verification

### Step 2: Test Subscriptions
1. Navigate to `/subscription`
2. Toggle **"🧪 Test Mode"** in the header
3. Click **"🧪 Test Subscribe"** on any plan
4. Mock payment creates subscription immediately in database
5. No real Pi payments needed
6. No edge function calls needed

### Step 3: Verify Database
In Supabase SQL Editor, run:
```sql
SELECT * FROM subscriptions 
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
```

Expected result: New subscription with:
- `plan_type`: One of `free`, `basic`, `grow`, `advance`, `plus`
- `status`: `active`
- `expires_at`: 30 days from now

---

## ⚠️ Required Database Fix

**This MUST be done before real subscription testing:**

The database constraint currently only allows `monthly`/`yearly` plan types from the old system. Update it to support new plan types:

**In Supabase SQL Editor, run:**
```sql
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_type_check
  CHECK (plan_type = ANY (ARRAY[
    'free','basic','grow','advance','plus','monthly','yearly'
  ]));
```

**Verification query:**
```sql
SELECT conname, pg_get_expr(conbin, conrelid)
FROM pg_constraint
WHERE conname = 'subscriptions_plan_type_check';
```

Expected output: Should show array with all 7 plan types.

---

## 📋 Architecture Summary

### Authentication Flow
```
User → Auth Page (Pi or Email)
  ↓
  Pi Auth: Dev mode skips backend verification
  Email: Direct Supabase auth
  ↓
Dashboard (authenticated)
```

### Payment Flow (Test Mode)
```
User → Subscription Page
  ↓
Enable Test Mode
  ↓
Click "Test Subscribe" on Plan
  ↓
handleMockPayment() → Insert/Update DB
  ↓
Instant subscription activation (no Pi payment)
  ↓
Dashboard confirmation
```

### Payment Flow (Production - Future)
```
User → Subscription Page
  ↓
Click "Subscribe" on Plan
  ↓
Pi Payment Flow
  ↓
Backend verification (edge function)
  ↓
Subscription activation
```

---

## 🔍 Configuration Files

| File | Purpose | Status |
|------|---------|--------|
| `.env` | Environment variables | ✅ Configured |
| `src/contexts/PiAuthContext.tsx` | Pi SDK & Auth | ✅ Sandbox + Dev mode |
| `src/pages/Auth.tsx` | Auth UI | ✅ Email + Pi options |
| `src/pages/Subscription.tsx` | Subscriptions | ✅ Test mode enabled |
| `src/pages/PublicStore.tsx` | Store checkout | ✅ Sandbox mode |
| `src/components/store/PaymentModal.tsx` | Payment UI | ✅ Sandbox mode |
| `src/components/store/PaymentModalEnhanced.tsx` | Enhanced payment | ✅ Sandbox mode |
| `supabase/migrations/20251225_update_subscription_plan_types.sql` | DB fix | ⏳ Needs deployment |

---

## 🛠️ Troubleshooting

### "Failed to activate subscription" Error
**Cause:** Database constraint doesn't allow new plan types
**Fix:** Run the SQL constraint migration above

### Pi auth edge function CORS error
**Expected in dev mode** - Dev mode fallback bypasses it
**Check console:** Should see `"PiAuth: Dev mode - Skipping backend verification"`

### Email sign-in not showing
**Check:** You're in dev mode (`VITE_DEV_MODE=false` in `.env`)
**Dev mode enabled:** App is running with `npm run dev` (not build)

### Test mode toggle not appearing
**Fix:** Page may be cached, hard refresh browser (Ctrl+Shift+R)

---

## ✨ Features Ready to Test

- ✅ Email authentication (no Pi required)
- ✅ Pi authentication (sandbox mode, dev mode verification)
- ✅ Mock subscription creation (test mode)
- ✅ All plan types (free, basic, grow, advance, plus)
- ✅ Subscription updates (change plans)
- ✅ Test mode toggle
- ✅ Toast notifications

---

## 📝 Next Steps

1. **Run database constraint migration** (Critical)
   ```sql
   ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;
   ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_type_check
     CHECK (plan_type = ANY (ARRAY['free','basic','grow','advance','plus','monthly','yearly']));
   ```

2. **Test email sign-in & mock subscriptions**
   - Sign in via email
   - Enable test mode
   - Create subscriptions for all plan types

3. **For production Pi payments (future)**
   - Deploy `pi-auth` edge function
   - Update PiAuthContext to call backend verification
   - Deploy `pi-payment-*` edge functions
   - Remove test mode fallback

---

## 📞 Summary

Everything is configured for **development/testing with sandbox mode**:
- Pi SDK → Sandbox mode ✅
- Pi Auth → Dev mode (no backend needed) ✅
- Subscriptions → Test mode (mock payments) ✅
- Database → Ready after constraint migration

**You are ready to test the complete workflow!**
