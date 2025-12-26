# Complete Pi Network App Workflow Guide

This guide covers the complete end-to-end workflow for the Drop Store app with Pi Network integration.

## 🎯 System Overview

The app implements a full SaaS platform with:
- **Pi Authentication**: Authenticate users with Pi Network
- **Subscription Plans**: Multiple tier-based subscription plans
- **Pi Payments**: Process subscription payments via Pi Network
- **Store Management**: Create and manage up to 5 stores (plan-based)
- **Product Management**: Add products with plan-based limits
- **Pi Ad Network**: Show interstitial and rewarded ads
- **Order Management**: Track and manage customer orders

---

## 📋 Workflow: Complete User Journey

### Phase 1: Authentication

#### 1.1 Traditional Email/Password Auth
- User visits the app
- Clicks "Sign In" on landing page
- Enters email and password
- Creates account or logs in via Supabase Auth
- Redirected to `/auth` if not authenticated

**Implementation**: `src/contexts/AuthContext.tsx`

#### 1.2 Pi Network Authentication
- After traditional auth, user can connect Pi Network
- Click "Connect Pi" button (appears on Subscription page)
- Pi Browser SDK shows authentication dialog
- User authorizes the app with Pi Network
- App receives Pi user data (uid, username, wallet_address)
- Backend verifies with Pi API
- Supabase session is set for the user
- Pi user data is synced to `pi_users` table

**Implementation**: 
- `src/contexts/PiAuthContext.tsx` - Pi auth context
- `supabase/functions/pi-auth/index.ts` - Backend verification
- Database: `pi_users` table

**Status**: ✅ Complete with profile syncing

---

### Phase 2: Subscription Selection & Payment

#### 2.1 View Subscription Plans
- User navigates to `/subscription`
- Dashboard shows 5 subscription tiers:
  - **Free**: 0π forever, 1 store, 1 product
  - **Basic**: 20π/month, 1 store, 25 products  
  - **Grow**: 49π/month, 3 stores, unlimited products
  - **Advance**: 60π/month, 5 stores, unlimited products
  - **Plus**: 100π/month, unlimited stores, unlimited products

- Each plan shows:
  - Price and billing period
  - Feature list
  - Store type availability
  - Welcome discount badge

**Implementation**: 
- `src/pages/Subscription.tsx` - UI
- `src/lib/pi-sdk.ts` - Plan definitions (SUBSCRIPTION_PLANS)
- Database: `subscriptions` table

#### 2.2 Free Plan Activation
- User selects "Free" plan
- No Pi authentication required
- Subscription record created directly in DB
- User redirected to Dashboard
- Status: Active for 365 days

#### 2.3 Paid Plan Payment Flow
- User selects paid plan (Basic, Grow, Advance, or Plus)
- If Pi not connected: Prompt to connect Pi Network
- User clicks "Subscribe" → Pi Payment dialog opens
- Flow:
  1. **Create Payment** - Amount sent to Pi SDK
  2. **Ready for Approval** - Payment ID returned from Pi
  3. **Backend Approval** - Backend calls Pi API to approve
  4. **Ready for Completion** - User completes payment in Pi Browser
  5. **Backend Completion** - Backend verifies transaction on-chain
  6. **Subscription Created** - Record saved to database with expiry date

**Implementation**:
- `src/hooks/usePiPayment.ts` - Payment hooks
- `src/lib/pi-sdk.ts` - Pi SDK integration (createPiPayment)
- `supabase/functions/pi-payment-approve/index.ts` - Payment approval
- `supabase/functions/pi-payment-complete/index.ts` - Payment completion & subscription creation
- Database: `subscriptions` table, `pi_users` table

**Payment Status States**:
- `pending` - Awaiting approval
- `approved` - Backend approved, waiting for user
- `completed` - Payment successful, subscription active
- `cancelled` - User cancelled
- `error` - Payment failed

**Status**: ✅ Complete with on-chain verification

---

### Phase 3: Dashboard & Subscription Management

#### 3.1 Dashboard View
- User lands on `/dashboard`
- Displays:
  - **Subscription Status Banner**: 
    - Green "Active" banner with plan name and days remaining
    - Or "Subscribe Required" banner if no active subscription
  - **Analytics Cards**: Total revenue, orders, products
  - **Order Status**: Pending vs completed
  - **Your Stores**: Grid of all user's stores

**Features Based on Subscription**:
- **Active Subscription**:
  - "Create Store" button enabled
  - Can view/manage stores
  - Can add products (up to plan limit)
  
- **No Subscription**:
  - "Create Store" button locked
  - Prompt to upgrade
  - Can only view existing stores (if any)

**Implementation**:
- `src/pages/Dashboard.tsx` - Dashboard page
- `src/hooks/useSubscription.ts` - Subscription state management
- `src/components/dashboard/AnalyticsCards.tsx` - Analytics display

**Status**: ✅ Complete with plan-based restrictions

#### 3.2 Subscription Renewal
- Subscriptions auto-expire based on `expires_at` field
- On dashboard load, app checks:
  - If status is "active" and expiry date passed → mark as "expired"
  - Calculate `daysRemaining` for display
  - If expired, show upgrade prompt
- User can upgrade anytime by visiting `/subscription`

**Status**: ✅ Complete

---

### Phase 4: Store Management

#### 4.1 Create Store
- User clicks "Create Store" from dashboard
- Requires **active subscription**
- Multi-step form:
  1. Store name, description
  2. Logo upload
  3. Banner upload
  4. Template selection
  5. Store type (Physical/Online/Digital)

- **Plan-Based Limits** enforced:
  - Free: 1 store
  - Basic: 1 store
  - Grow: 3 stores
  - Advance: 5 stores
  - Plus: Unlimited

**Implementation**:
- `src/pages/CreateStore.tsx` - Store creation
- Checks: `useSubscription().isActive`, `planLimits.maxStores`
- Database: `stores` table

#### 4.2 Store Management Page
- Navigate to `/store/:storeId`
- Tabs: Products, Orders, Settings, Analytics, Payouts
- Manage everything for the store

#### 4.3 Add Products
- Click "Add Product" button
- Form validation
- **Plan-Based Limit Checking**:
  - Free: Max 1 product per store
  - Basic: Max 25 products per store
  - Grow+: Unlimited products
  
- Checks before saving:
  - `useSubscription().canAddProduct(currentProductCount)`
  - If limit reached: Show error and prompt to upgrade
  - Cannot add without subscription

**Implementation**:
- `src/pages/StoreManagement.tsx` - Store management
- Enhanced `handleSaveProduct` with limit checking
- Database: `products` table

**Status**: ✅ Complete with enforced limits

---

### Phase 5: Pi Ad Network

#### 5.1 Ad Types
- **Interstitial Ads**: Full-screen ads between actions
- **Rewarded Ads**: Ads that reward user with points/credits

#### 5.2 Ad Configuration
Environment variables:
```env
VITE_PI_AD_NETWORK_ENABLED=true
VITE_PI_INTERSTITIAL_ADS_ENABLED=true
VITE_PI_REWARDED_ADS_ENABLED=true
VITE_PI_AD_COOLDOWN_MINUTES=5
VITE_PI_AD_FREQUENCY_CAP=3
```

#### 5.3 Frequency Capping & Cooldown
- **Cooldown**: Minimum 5 minutes between ads
- **Frequency Cap**: Maximum 3 ads shown in current session
- State stored in `sessionStorage` (resets on page reload)
- Checks enforced in `usePiAdNetwork.canShowAd()`

#### 5.4 Ad Trigger Points
- **Interstitial Ads**:
  - Dashboard: Shows every 3 store views
  - Store Management: Shows every 5 product views
  
- **Rewarded Ads**:
  - Can be triggered manually
  - User must wait for cooldown before next ad
  - Reward status returned in response

**Implementation**:
- `src/hooks/usePiAdNetwork.ts` - Ad management
- `src/components/ads/InterstitialAdTrigger.tsx` - Auto-trigger component
- `src/lib/pi-sdk.ts` - Pi Ad SDK integration

**Status**: ✅ Complete with cooldown and frequency capping

---

## 🗄️ Database Schema

### Key Tables

**subscriptions**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → auth.users)
- plan_type: TEXT ('free', 'basic', 'grow', 'advance', 'plus')
- status: TEXT ('active', 'expired', 'cancelled', 'pending', 'superseded')
- pi_payment_id: TEXT (Pi Network payment ID)
- pi_transaction_id: TEXT (Blockchain txid)
- amount: NUMERIC (Pi amount paid)
- started_at: TIMESTAMPTZ
- expires_at: TIMESTAMPTZ (Auto-expire on this date)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**pi_users**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → auth.users)
- pi_uid: TEXT UNIQUE (Pi user ID)
- pi_username: TEXT (Pi username)
- wallet_address: TEXT (Pi wallet address)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**stores**
```sql
- id: UUID (Primary Key)
- owner_id: UUID (Foreign Key → auth.users)
- name: TEXT
- slug: TEXT UNIQUE
- description: TEXT
- logo_url: TEXT
- banner_url: TEXT
- primary_color: TEXT
- store_type: TEXT ('physical', 'online', 'digital')
- is_published: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**products**
```sql
- id: UUID (Primary Key)
- store_id: UUID (Foreign Key → stores)
- name: TEXT
- description: TEXT
- price: NUMERIC
- compare_at_price: NUMERIC
- images: JSONB
- category: TEXT
- inventory_count: INTEGER
- product_type: TEXT ('physical', 'digital')
- digital_file_url: TEXT
- is_active: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

---

## 📊 Plan Limits

| Feature | Free | Basic | Grow | Advance | Plus |
|---------|------|-------|------|---------|------|
| **Max Stores** | 1 | 1 | 3 | 5 | ∞ |
| **Max Products/Store** | 1 | 25 | ∞ | ∞ | ∞ |
| **Store Types** | Physical | All | All | All | All |
| **Custom Domain** | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Advanced Analytics** | ✗ | ✗ | ✓ | ✓ | ✓ |
| **API Access** | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Priority Support** | ✗ | ✗ | ✗ | ✓ | ✓ |

---

## 🧪 Testing Checklist

### 1. Pi Authentication Flow
- [ ] User can sign in with email/password
- [ ] User can connect Pi Network from Subscription page
- [ ] Pi user data saved to `pi_users` table
- [ ] Session properly managed across pages
- [ ] Logout clears Pi session

### 2. Free Plan Activation
- [ ] User can activate free plan without Pi auth
- [ ] Subscription record created with 365-day expiry
- [ ] Dashboard shows "Active" status
- [ ] Can create 1 store
- [ ] Cannot create more than 1 store

### 3. Paid Plan Payment
- [ ] User can see all paid plans
- [ ] "Connect Pi" prompt shows if Pi not authenticated
- [ ] After Pi auth, can click "Subscribe"
- [ ] Payment dialog appears in Pi Browser
- [ ] After completing payment:
  - [ ] Subscription created in database
  - [ ] Status changes to "completed"
  - [ ] Redirects to dashboard
  - [ ] Shows "Active" banner with plan name

### 4. Dashboard Features
- [ ] Shows subscription status banner (green if active)
- [ ] Shows days remaining for active subscription
- [ ] "Create Store" button enabled/disabled based on subscription
- [ ] Analytics cards display correctly
- [ ] Can upgrade plan anytime

### 5. Store Management
- [ ] Can create stores up to plan limit
- [ ] Cannot exceed plan limit (shows error)
- [ ] Can view all stores
- [ ] Can edit store details
- [ ] Can delete store

### 6. Product Management
- [ ] Can add products up to plan limit
- [ ] Cannot exceed plan limit (shows error)
- [ ] Can edit product
- [ ] Can delete product
- [ ] Free plan: max 1 product per store
- [ ] Basic plan: max 25 products per store
- [ ] Grow+: unlimited products

### 7. Pi Ad Network
- [ ] Interstitial ads trigger on dashboard (every 3 views)
- [ ] Rewarded ads can be manually triggered
- [ ] Cooldown enforced (min 5 min between ads)
- [ ] Frequency cap enforced (max 3 per session)
- [ ] Ads disabled if not in Pi Browser

### 8. Plan Limits Enforcement
- [ ] Free plan: 1 store, 1 product
- [ ] Basic: 1 store, 25 products
- [ ] Grow: 3 stores, unlimited products
- [ ] Advance: 5 stores, unlimited products
- [ ] Plus: unlimited everything

---

## 🚀 Environment Setup

### Required Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Pi Network
VITE_PI_NETWORK=mainnet  # or testnet
VITE_PI_SANDBOX_MODE=false
VITE_PI_API_KEY=your_pi_api_key
VITE_PI_AD_NETWORK_ENABLED=true
VITE_PI_INTERSTITIAL_ADS_ENABLED=true
VITE_PI_REWARDED_ADS_ENABLED=true
VITE_PI_AD_COOLDOWN_MINUTES=5
VITE_PI_AD_FREQUENCY_CAP=3

# App
VITE_APP_NAME=Drop Store
VITE_API_URL=your_api_url
```

---

## 📞 Support Contacts

For issues with:
- **Pi Network**: Visit https://developers.minepi.com
- **Supabase**: Visit https://supabase.com/docs
- **App Code**: Check documentation in `PI_MAINNET_VERIFICATION.md`

---

## ✅ Completion Status

| Component | Status | Location |
|-----------|--------|----------|
| Pi Auth | ✅ Complete | `src/contexts/PiAuthContext.tsx` |
| Subscription Plans | ✅ Complete | `src/pages/Subscription.tsx` |
| Subscription Payment | ✅ Complete | `src/hooks/usePiPayment.ts` |
| Dashboard | ✅ Complete | `src/pages/Dashboard.tsx` |
| Store Management | ✅ Complete | `src/pages/StoreManagement.tsx` |
| Product Management | ✅ Complete | `src/pages/StoreManagement.tsx` |
| Plan Limits | ✅ Complete | `src/hooks/useSubscription.ts` |
| Pi Ad Network | ✅ Complete | `src/hooks/usePiAdNetwork.ts` |
| Backend Functions | ✅ Complete | `supabase/functions/` |

---

**Last Updated**: December 26, 2025
**Version**: 1.0.0
**Status**: ✅ PRODUCTION READY
