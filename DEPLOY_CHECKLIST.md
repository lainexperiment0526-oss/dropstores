# 🚀 Vercel Deployment Checklist for Drop Store

## ✅ Pre-Deployment Checklist

### 1. **Environment Variables Ready**
Make sure you have these environment variables ready to add in Vercel:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://kvqfnmdkxaclsnyuzkyp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cWZubWRreGFjbHNueXV6a3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxOTI1NDQsImV4cCI6MjA4MTc2ODU0NH0.CBm2Eu2PAhrLzgw_-SK2a0Reai6fc5FbpatntPVa4ps
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cWZubWRreGFjbHNueXV6a3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxOTI1NDQsImV4cCI6MjA4MTc2ODU0NH0.CBm2Eu2PAhrLzgw_-SK2a0Reai6fc5FbpatntPVa4ps

# ⚠️ NEVER commit service role key - Add directly in Vercel dashboard
SUPABASE_SERVICE_ROLE_KEY=sb_secret_SIqZm1fCy5acyRwenl9mFA_TWMrksAD

# Pi Network Configuration
VITE_PI_API_KEY=c7ee5itt8zfxgaio8uk9pciyomouospv3rnybrhmbbemh0whc0kkdd6x12ldjucc
VITE_PI_MAINNET_MODE=true
VITE_PI_NETWORK=mainnet
VITE_API_URL=https://api.minepi.com
VITE_PI_VALIDATION_KEY=a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1

# Platform Configuration
VITE_DOMAIN=dropshops.space
VITE_PLATFORM_URL=https://dropshops.space
VITE_PI_PAYMENT_RECEIVER_WALLET=GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ
```

### 2. **Files Verified**
- ✅ `vercel.json` - Build configuration
- ✅ `index.html` - Meta tags and Pi SDK loaded
- ✅ `package.json` - Build scripts configured
- ✅ `public/validation-key.txt` - Pi Network validation key
- ✅ `public/robots.txt` - SEO configuration
- ✅ Edge Functions in `/supabase/functions/` (deployed separately to Supabase)

### 3. **Build Test Locally**
```bash
# Test build locally first
npm install
npm run build
npm run preview
```

### 4. **Supabase Edge Functions**
Make sure these are deployed to Supabase (NOT Vercel):
```bash
# Deploy edge functions
supabase functions deploy pi-auth
supabase functions deploy pi-payment-approve
supabase functions deploy pi-payment-complete
supabase functions deploy verify-pi-transaction
# ... (deploy all other functions)
```

---

## 🚀 Deployment Steps

### Option A: Vercel Dashboard (Recommended)

1. **Visit**: https://vercel.com/new

2. **Import Repository**
   - Connect your GitHub account
   - Select the `dropstores` repository
   - Click "Import"

3. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Node Version: **18.x** (recommended)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add all variables from section 1 above
   - Select: **Production**, **Preview**, and **Development**
   - Click "Add" for each variable

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)

6. **Verify Deployment**
   - Visit the deployed URL
   - Test Pi Network authentication
   - Test email authentication
   - Check admin pages (/admin and /admin-mrwain)

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 🔧 Post-Deployment Configuration

### 1. **Add Custom Domain**
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `dropshops.space`
3. Add domain: `www.dropshops.space`
4. Follow DNS configuration instructions

### 2. **Configure DNS (for dropshops.space)**
Add these records to your DNS provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. **Update Pi Network App Configuration**
1. Go to https://develop.pi/
2. Update your app's redirect URLs to include:
   - `https://dropshops.space`
   - `https://www.dropshops.space`
   - `https://dropshops.space/auth`

### 4. **Update Supabase Redirect URLs**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to redirect URLs:
   - `https://dropshops.space/**`
   - `https://www.dropshops.space/**`

---

## 🧪 Testing Checklist

After deployment, test these features:

### Authentication
- [ ] Email sign up works
- [ ] Email sign in works
- [ ] Pi Network authentication works (in Pi Browser)
- [ ] Session persistence works
- [ ] Sign out works

### Admin Access
- [ ] `/admin` page requires authentication
- [ ] `/admin-mrwain` page requires specific admin email
- [ ] Admin dashboard loads real data
- [ ] Sign out from admin panel works

### Store Features
- [ ] Create new store works
- [ ] Upload images works
- [ ] Add products works
- [ ] Public store pages load correctly
- [ ] Checkout flow works

### Pi Network Integration
- [ ] Pi SDK loads correctly
- [ ] Payment flow initiates
- [ ] Payment verification works
- [ ] Wallet address displays

---

## 🐛 Common Issues & Solutions

### Build Fails
**Error: "Out of memory"**
```bash
# Add to Vercel Environment Variables:
NODE_OPTIONS=--max_old_space_size=4096
```

### Pi SDK Not Loading
- Check if Pi SDK script is in `index.html` before React app
- Verify app is accessed through Pi Browser
- Check console for Pi SDK errors

### Environment Variables Not Working
- Ensure all variables start with `VITE_` prefix (except service keys)
- Redeploy after adding new env variables
- Check capitalization matches exactly

### 404 on Routes
- Verify `vercel.json` has rewrites configured
- Check if SPA routing is enabled

### Supabase Connection Fails
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Ensure redirect URLs include Vercel domain

---

## 📊 Monitoring

### After Deployment

1. **Check Vercel Analytics**
   - Go to Vercel Dashboard → Analytics
   - Monitor page views, errors, and performance

2. **Check Supabase Logs**
   - Go to Supabase Dashboard → Logs
   - Monitor API requests and errors
   - Check Edge Function logs

3. **Monitor Pi Network Integration**
   - Check Pi Developer Portal for app stats
   - Monitor payment success rates
   - Track authentication metrics

---

## 🔐 Security Checklist

- [ ] Service role key is only in Vercel environment variables (not in code)
- [ ] Pi API key is in environment variables
- [ ] CORS headers properly configured
- [ ] XSS protection enabled
- [ ] Frame protection enabled
- [ ] HTTPS enforced
- [ ] Validation key is in public folder

---

## 📝 Final Notes

1. **First-time setup**: Admin account must be created at `/auth` before accessing `/admin`
2. **Pi Browser Required**: Pi Network features only work in Pi Browser
3. **Edge Functions**: Run on Supabase, not Vercel
4. **Environment Variables**: Must be added manually in Vercel dashboard
5. **Domain**: Configure DNS after deployment

---

## 🎉 Deployment Complete!

Your Drop Store should now be live at:
- **Production**: https://dropshops.space
- **Vercel URL**: https://your-project.vercel.app

Need help? Check:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Pi Network Docs: https://pi-apps.github.io/community-developer-guide/
