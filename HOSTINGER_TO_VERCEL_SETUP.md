# Hostinger Domain to Vercel Setup Guide

## Step 1: Get Vercel DNS Configuration

### In Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project: `dropstores`
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `dropshops.space`
6. Vercel will show you the required DNS records

---

## Step 2: Configure DNS in Hostinger

### Login to Hostinger:
1. Go to https://hpanel.hostinger.com
2. Navigate to **Domains** → Select `dropshops.space`
3. Click **DNS / Nameservers**

### Option A: Use Vercel Nameservers (Recommended)

**In Vercel (get these values):**
- Vercel will provide nameservers like:
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`

**In Hostinger:**
1. Click **Change Nameservers**
2. Select **Use custom nameservers**
3. Enter Vercel's nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
4. Click **Save**

⚠️ **Wait 24-48 hours for DNS propagation**

---

### Option B: Use DNS Records (Faster, but need to manage)

**Keep Hostinger nameservers and add these A/CNAME records:**

#### Required DNS Records:

1. **A Record (Root Domain)**
   ```
   Type: A
   Name: @ (or leave blank)
   Value: 76.76.21.21
   TTL: 3600 (or Auto)
   ```

2. **CNAME Record (www subdomain)**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600 (or Auto)
   ```

3. **Optional: Redirect www to non-www**
   - In Vercel, both `dropshops.space` and `www.dropshops.space` will work
   - Vercel handles redirects automatically

#### Steps in Hostinger:
1. Go to **DNS / Name Servers** → **DNS Zone**
2. Click **Add Record**
3. Add A Record:
   - Type: `A`
   - Name: `@`
   - Points to: `76.76.21.21`
   - TTL: `3600`
4. Click **Add Record** again
5. Add CNAME Record:
   - Type: `CNAME`
   - Name: `www`
   - Points to: `cname.vercel-dns.com`
   - TTL: `3600`
6. Click **Save Changes**

---

## Step 3: Verify Domain in Vercel

### After DNS Changes:
1. Go back to Vercel → **Settings** → **Domains**
2. You should see `dropshops.space` with status:
   - ⏳ **Pending** (DNS propagating) → Wait 10-30 minutes
   - ✅ **Valid** (DNS configured correctly)
3. Add `www.dropshops.space` as well (optional)
4. Set one as **Primary Domain**

---

## Step 4: Check DNS Propagation

### Use these tools to check if DNS is working:

1. **DNS Checker**: https://dnschecker.org
   - Enter: `dropshops.space`
   - Should show Vercel's IP: `76.76.21.21`

2. **What's My DNS**: https://www.whatsmydns.net
   - Enter: `dropshops.space`
   - Check globally

3. **Command Line** (PowerShell):
   ```powershell
   nslookup dropshops.space
   ```
   Should return: `76.76.21.21`

---

## Step 5: SSL Certificate

Vercel automatically provisions SSL certificates for your domain.

**Check SSL Status:**
1. Vercel Dashboard → **Settings** → **Domains**
2. Each domain should show:
   - 🔒 **SSL Certificate: Valid**
3. If not, wait 5-10 minutes and refresh

**Force HTTPS:**
- Vercel automatically redirects HTTP → HTTPS
- No additional configuration needed

---

## Step 6: Deploy to Vercel

### First Time Deployment:

1. **Via GitHub (Recommended):**
   ```bash
   # Already pushed to GitHub
   git push origin main
   ```
   - Vercel auto-deploys on push if connected

2. **Via Vercel CLI:**
   ```powershell
   # Install Vercel CLI
   npm install -g vercel
   
   # Login
   vercel login
   
   # Deploy to production
   vercel --prod
   ```

3. **Via Vercel Dashboard:**
   - Import from GitHub
   - Select repository: `lainexperiment0526-oss/dropstores`
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click **Deploy**

---

## Step 7: Environment Variables in Vercel

**Add all environment variables from `.env` file:**

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Add each variable (click **Add**):

```env
VITE_SUPABASE_URL=https://kvqfnmdkxaclsnyuzkyp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cWZubWRreGFjbHNueXV6a3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxOTI1NDQsImV4cCI6MjA4MTc2ODU0NH0.CBm2Eu2PAhrLzgw_-SK2a0Reai6fc5FbpatntPVa4ps
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cWZubWRreGFjbHNueXV6a3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxOTI1NDQsImV4cCI6MjA4MTc2ODU0NH0.CBm2Eu2PAhrLzgw_-SK2a0Reai6fc5FbpatntPVa4ps
SUPABASE_SERVICE_ROLE_KEY=sb_secret_SIqZm1fCy5acyRwenl9mFA_TWMrksAD
VITE_PI_API_KEY=h1y9zxfm7infu7ysppf7mene5bab9y8gm1f09jsludamf48vler4n6vsiqrdmruy
VITE_PI_MAINNET_MODE=true
VITE_PI_NETWORK=mainnet
VITE_API_URL=https://api.minepi.com
VITE_DOMAIN=dropshops.space
VITE_PLATFORM_URL=https://dropshops.space
VITE_PI_PAYMENT_RECEIVER_WALLET=GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ
VITE_PI_VALIDATION_KEY=a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1
VITE_PI_AD_NETWORK_ENABLED=true
VITE_PI_INTERSTITIAL_ADS_ENABLED=true
VITE_PI_REWARDED_ADS_ENABLED=true
```

3. Select **Production**, **Preview**, and **Development**
4. Click **Save**
5. **Redeploy** to apply environment variables

---

## Step 8: Test Your Deployment

### After deployment completes:

1. **Visit your domain**: https://dropshops.space
2. **Check HTTPS**: Should show 🔒 in browser
3. **Test in Pi Browser**:
   - Open Pi Browser app
   - Navigate to `https://dropshops.space`
   - Test Pi Authentication
   - Test Pi Payments

---

## Step 9: Update Pi Developer Portal

### Register your domain with Pi Network:

1. Go to https://develop.pinet.com (in Pi Browser)
2. Select your app
3. **App Settings** → **Update App URL**
4. Change from test URL to: `https://dropshops.space`
5. **Save Changes**

### Update validation key endpoint:
- Your validation key is already at: `https://dropshops.space/validation-key.txt`
- Pi will verify this automatically

---

## Troubleshooting

### Domain not resolving:
- ✅ Check DNS propagation (can take 24-48 hours)
- ✅ Verify A record points to `76.76.21.21`
- ✅ Verify CNAME points to `cname.vercel-dns.com`
- ✅ Clear browser cache

### SSL Certificate issues:
- ✅ Wait 10 minutes for Vercel to provision SSL
- ✅ Ensure domain is verified in Vercel
- ✅ Check Vercel Dashboard → Domains → SSL Status

### Pi Network not working:
- ✅ Verify environment variables in Vercel
- ✅ Check Pi Developer Portal has correct URL
- ✅ Ensure validation key is accessible at `/validation-key.txt`
- ✅ Test Pi SDK loading in browser console

### Build fails in Vercel:
- ✅ Check build logs in Vercel Dashboard
- ✅ Verify all dependencies in `package.json`
- ✅ Ensure environment variables are set
- ✅ Test build locally: `npm run build`

---

## Quick Reference

### Hostinger DNS Records (Option B)
```
A Record:
  Name: @
  Value: 76.76.21.21

CNAME Record:
  Name: www
  Value: cname.vercel-dns.com
```

### Vercel Deployment Commands
```powershell
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Check DNS
```powershell
# Check A record
nslookup dropshops.space

# Check with Google DNS
nslookup dropshops.space 8.8.8.8
```

---

## Timeline

- **DNS Changes**: 10 minutes - 48 hours (usually 30 min - 4 hours)
- **SSL Certificate**: 5-10 minutes after DNS propagates
- **Vercel Build**: 2-5 minutes
- **Total**: ~30 minutes to 2 days (depending on DNS)

---

## Success Checklist

- [ ] Domain added in Vercel
- [ ] DNS configured in Hostinger
- [ ] DNS propagation verified (nslookup)
- [ ] SSL certificate valid
- [ ] Environment variables set in Vercel
- [ ] App deployed successfully
- [ ] https://dropshops.space accessible
- [ ] Pi Developer Portal updated
- [ ] Pi Authentication working
- [ ] Pi Payments working
- [ ] Pi AdNetwork working

---

## Support

- **Hostinger Support**: https://www.hostinger.com/support
- **Vercel Documentation**: https://vercel.com/docs
- **Pi Developer Support**: https://develop.pinet.com
