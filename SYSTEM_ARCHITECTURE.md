# 📊 SYSTEM ARCHITECTURE OVERVIEW

## Drop Store - Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DROP STORE APPLICATION                      │
│                                                                 │
│  React + TypeScript + Vite + Tailwind CSS + shadcn/ui         │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────┐ ┌──────────────┐
        │              │ │          │ │              │
        │  Authentication   Dashboard   Store Mgmt    │
        │  - Email/Pass │ │- Overview │ │- Create   │
        │  - Pi Auth    │ │- Analytics│ │- Edit     │
        │              │ │- Orders  │ │- Delete   │
        └──────────────┘ └──────────┘ └──────────────┘
                │             │             │
                └─────────────┴─────────────┘
                            │
                ┌───────────┴────────────┐
                │                        │
                ▼                        ▼
        ┌──────────────────┐   ┌──────────────────┐
        │                  │   │                  │
        │  Subscription    │   │   Ad Network     │
        │  - Plan Select   │   │  - Interstitial  │
        │  - View Plans    │   │  - Rewarded      │
        │  - Status        │   │  - Cooldown      │
        │                  │   │  - Frequency Cap │
        └──────────────────┘   └──────────────────┘
                │                        │
                ▼                        ▼
        ┌──────────────────┐   ┌──────────────────┐
        │                  │   │                  │
        │  Pi Payment      │   │  Pi Ad SDK       │
        │  Processing      │   │  - requestAd()   │
        │  - Create Payment │  │  - showAd()      │
        │  - Approve       │   │                  │
        │  - Complete      │   │                  │
        └──────────────────┘   └──────────────────┘
                │
        ┌───────┴────────────┬────────────┐
        │                    │            │
        ▼                    ▼            ▼
    ┌────────────┐  ┌──────────────┐ ┌─────────────┐
    │            │  │              │ │             │
    │ Pi API     │  │ Supabase     │ │ Supabase    │
    │ - Approve  │  │ Functions    │ │ Database    │
    │ - Complete │  │ - pi-auth    │ │ - Tables    │
    │            │  │ - pi-payment │ │ - RLS       │
    └────────────┘  └──────────────┘ └─────────────┘
```

---

## 🔄 Data Flow

### Authentication Flow
```
User Login
   │
   ├─ Email/Password ──> Supabase Auth ──> Session Token ──> Dashboard
   │
   └─ Pi Network Connect ──> Pi SDK ──> Pi Verification ──> Pi User Sync
```

### Payment Flow
```
User Selects Plan
   │
   ├─ Create Payment ──> Pi SDK ──> Payment ID
   │
   ├─ Approve Payment ──> Backend API ──> Pi API ──> Approved
   │
   ├─ User Completes in Pi Browser
   │
   ├─ Backend Completion ──> Pi API ──> Verify On-Chain ──> Success
   │
   └─ Create Subscription ──> Database ──> Dashboard
```

### Product Management Flow
```
User Clicks "Add Product"
   │
   ├─ Check Subscription Status ──> Active?
   │                                 │
   │                                 ├─ No ──> Redirect to Subscription
   │                                 │
   │                                 └─ Yes ──> Continue
   │
   ├─ Check Product Limit ──> Can Add?
   │                             │
   │                             ├─ No ──> Show Error & Upgrade Prompt
   │                             │
   │                             └─ Yes ──> Continue
   │
   ├─ Submit Form ──> Database Insert ──> Store Management Updated
```

---

## 📱 Routes & Pages

```
ROOT
├── / (Landing)
│   ├── Navbar with auth links
│   ├── Hero section
│   ├── Features showcase
│   └── Plan comparison
│
├── /auth (Authentication)
│   ├── Sign up form
│   ├── Sign in form
│   └── Pi connection option
│
├── /subscription (Plan Selection)
│   ├── Plan cards
│   ├── Feature comparison
│   ├── Pricing info
│   └── Payment integration
│
├── /dashboard (Main Dashboard)
│   ├── Subscription status
│   ├── Analytics cards
│   ├── Orders overview
│   └── Store list
│
├── /create-store (Store Creation)
│   ├── Store form
│   ├── Template selection
│   ├── Logo/banner upload
│   └── Store type selection
│
├── /store/:storeId (Store Management)
│   ├── Store settings
│   ├── Products tab
│   ├── Orders tab
│   ├── Analytics tab
│   └── Payouts tab
│
├── /shop/:slug (Public Store)
│   ├── Product catalog
│   ├── Product filters
│   ├── Shopping cart
│   └── Checkout
│
└── /pricing (Pricing Page)
    ├── Plan details
    ├── Feature comparison
    ├── FAQ section
    └── Contact info
```

---

## 🗄️ Database Schema

```
┌──────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                     │
└──────────────────────────────────────────────────────────┘
            │
    ┌───────┴────────┬──────────┬──────────┬──────────┐
    │                │          │          │          │
    ▼                ▼          ▼          ▼          ▼
┌────────┐     ┌──────────┐ ┌────────┐ ┌────────┐ ┌─────────┐
│ auth   │     │ profiles │ │ pi_    │ │subscri│ │ stores  │
│ users  │────▶│          │ │ users  │ │ptions│ │         │
└────────┘     └──────────┘ └────────┘ └────────┘ └─────────┘
                  1:1         1:1        1:N        1:N
                                          │          │
                                          │          └──────────┐
                                          │                     │
                                          │                 ┌───▼──────┐
                                          │                 │ products │
                                          │                 │          │
                                          │                 └─────┬────┘
                                          │                       │
                                          │                   ┌───▼──────┐
                                          │                   │ orders   │
                                          │                   │          │
                                          │                   └──────────┘
                                          │
                                    ┌─────▼──────────┐
                                    │ Subscription   │
                                    │ - id           │
                                    │ - user_id      │
                                    │ - plan_type    │
                                    │ - status       │
                                    │ - expires_at   │
                                    │ - pi_payment_id│
                                    │ - created_at   │
                                    └────────────────┘
```

---

## 🔑 Key Features by Component

### Authentication Context
```typescript
Context: PiAuthContext
├── State:
│   ├── user (Supabase User)
│   ├── piUser (Pi Network User)
│   ├── piAccessToken
│   └── isPiAuthenticated
│
└── Methods:
    ├── signInWithPi()      → Connect to Pi Network
    └── linkPiAccount()     → Link Pi to existing user
```

### Subscription Hook
```typescript
Hook: useSubscription()
├── State:
│   ├── subscription (Current subscription)
│   ├── isActive (Boolean)
│   ├── isExpired (Boolean)
│   ├── daysRemaining (Number)
│   └── planLimits (Limits object)
│
└── Methods:
    ├── canCreateStore(count)  → Can user create store?
    ├── canAddProduct(count)   → Can user add product?
    └── hasFeature(feature)    → Has user feature?
```

### Payment Hook
```typescript
Hook: usePiPayment()
├── State:
│   ├── isProcessing (Boolean)
│   ├── paymentId (String)
│   ├── status (Payment status)
│   └── error (Error message)
│
└── Methods:
    ├── createSubscriptionPayment(planType)
    ├── createProductPayment(amount, ...)
    └── resetPayment()
```

### Ad Network Hook
```typescript
Hook: usePiAdNetwork()
├── State:
│   ├── isLoading (Boolean)
│   ├── adSession (Ad session data)
│   └── config (Ad configuration)
│
└── Methods:
    ├── showInterstitialAd()    → Show full-screen ad
    ├── showRewardedAd()        → Show rewarded ad
    └── canShowAd()             → Check cooldown/cap
```

---

## 🔌 External Integrations

### Pi Network Integration
```
├── Pi SDK (Pi Browser)
│   ├── Initialize in PiAuthContext
│   ├── Authenticate with scopes
│   ├── Get user data (uid, username, wallet)
│   └── Create payments
│
├── Pi Platform API
│   ├── Approve payments
│   ├── Complete payments
│   └── Verify transactions
│
└── Pi Horizon API
    ├── Query transactions
    ├── Verify on-chain payments
    └── Check transaction status
```

### Supabase Integration
```
├── Authentication
│   ├── Email/password signup
│   ├── Email verification
│   └── Session management
│
├── Database
│   ├── Subscriptions table
│   ├── Pi users table
│   ├── Stores table
│   ├── Products table
│   └── Orders table
│
├── Edge Functions
│   ├── pi-auth (Verify Pi auth)
│   ├── pi-payment-approve (Approve payment)
│   └── pi-payment-complete (Complete & verify)
│
└── Row-Level Security
    ├── Users only see their data
    ├── Stores isolated by owner
    └── Products isolated by store
```

---

## 📊 Component Hierarchy

```
App
├── Router
│   ├── Landing
│   ├── Auth
│   ├── Subscription
│   │   ├── SubscriptionBanner
│   │   ├── PlanCards
│   │   ├── FeatureComparison
│   │   └── PaymentIntegration
│   ├── Dashboard
│   │   ├── SubscriptionStatus
│   │   ├── AnalyticsCards
│   │   ├── OrderStatusCards
│   │   └── StoreGrid
│   ├── CreateStore
│   │   ├── StoreForm
│   │   ├── StoreTypeSelector
│   │   └── TemplateSelector
│   ├── StoreManagement
│   │   ├── StoreTabs
│   │   ├── ProductsList
│   │   ├── OrdersList
│   │   ├── AnalyticsPanel
│   │   └── PayoutPanel
│   ├── PublicStore
│   │   ├── StoreHeader
│   │   ├── ProductGrid
│   │   └── CartButton
│   └── Pricing
│       ├── PlanCards
│       └── FAQ
│
├── Providers
│   ├── AuthProvider
│   ├── PiAuthProvider
│   ├── QueryClientProvider
│   └── TooltipProvider
│
└── UI Components (shadcn/ui)
    ├── Button
    ├── Card
    ├── Dialog
    ├── Input
    ├── Textarea
    └── etc.
```

---

## 🔄 State Management

### Authentication State
```typescript
// Email/Password Auth
const { user, loading, signOut } = useAuth()

// Pi Network Auth
const { piUser, piAccessToken, isPiAuthenticated, signInWithPi } = usePiAuth()
```

### Business State
```typescript
// Subscription
const { isActive, daysRemaining, planLimits, canCreateStore } = useSubscription()

// Payment
const { status, isProcessing, createSubscriptionPayment } = usePiPayment()

// Ads
const { showInterstitialAd, canShowAd, config } = usePiAdNetwork()
```

### UI State
```typescript
// Local component state
const [isLoading, setIsLoading] = useState(false)
const [showDialog, setShowDialog] = useState(false)
const [formData, setFormData] = useState({...})
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │ React App (Vite build)                             │ │
│  │ - Automatic deployment from git push              │ │
│  │ - Environment variables configured                │ │
│  │ - Auto HTTPS and domain setup                      │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
    ┌────────────────┐        ┌──────────────────┐
    │  SUPABASE      │        │  PI NETWORK      │
    │  - Database    │        │  - API Endpoint  │
    │  - Auth        │        │  - Mainnet       │
    │  - Functions   │        │  - API Key Auth  │
    └────────────────┘        └──────────────────┘
```

---

## 📈 Performance Optimization

```
┌─────────────────────────────────────────────┐
│          Performance Optimizations          │
├─────────────────────────────────────────────┤
│ ✓ Code splitting by route                   │
│ ✓ Lazy loading components                   │
│ ✓ Image optimization                        │
│ ✓ CSS minification                          │
│ ✓ JavaScript bundling & minification        │
│ ✓ Caching with service workers             │
│ ✓ Database query optimization               │
│ ✓ Session storage for ad state             │
│ ✓ Optimized React rendering                │
│ ✓ Proper dependency management              │
└─────────────────────────────────────────────┘
```

---

## 🎯 Architecture Summary

This architecture provides:

✅ **Scalability**: Can handle thousands of users  
✅ **Reliability**: Multiple layers of error handling  
✅ **Security**: Authentication, RLS, verification  
✅ **Performance**: Optimized queries and rendering  
✅ **Maintainability**: Clean code structure  
✅ **Extensibility**: Easy to add new features  
✅ **Integration**: Pi Network and Supabase seamlessly integrated  

---

**Complete System Ready for Production** 🚀
