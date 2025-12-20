# Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/new
2. **Import Repository**: Connect your GitHub repository
3. **Configure Project**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables**:

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
```

5. **Click Deploy**

6. **Add Custom Domain** (After deployment):
   - Go to Project Settings → Domains
   - Add: `dropshops.space`
   - Add: `www.dropshops.space`

---

### Option 2: Deploy via CLI

```powershell
# Login to Vercel
vercel login

# Link project (first time only)
vercel link

# Set environment variables
vercel env add VITE_SUPABASE_URL
# Paste: https://kvqfnmdkxaclsnyuzkyp.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste the anon key

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
# Paste the publishable key

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste: sb_secret_SIqZm1fCy5acyRwenl9mFA_TWMrksAD

vercel env add VITE_PI_API_KEY
# Paste: h1y9zxfm7infu7ysppf7mene5bab9y8gm1f09jsludamf48vler4n6vsiqrdmruy

vercel env add VITE_PI_MAINNET_MODE
# Type: true

vercel env add VITE_PI_NETWORK
# Type: mainnet

vercel env add VITE_API_URL
# Type: https://api.minepi.com

# Deploy to production
vercel --prod
```

---

## 🔧 Troubleshooting

### Build Fails

**Error: "Module not found"**
```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run build
```

**Error: "Out of memory"**
- Increase Node memory: `NODE_OPTIONS=--max_old_space_size=4096 npm run build`
- Or in Vercel Dashboard → Settings → Environment Variables:
  - `NODE_OPTIONS` = `--max_old_space_size=4096`

### Environment Variables Not Working

1. Make sure all variables start with `VITE_` for frontend access
2. Variables without `VITE_` prefix are only available during build
3. Redeploy after adding new environment variables

### Domain Not Working

1. **DNS Configuration**:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

2. **Wait for DNS Propagation** (up to 48 hours)
3. **Check DNS**: https://dnschecker.org/

---

## ✅ Verification Checklist

After deployment:

- [ ] Visit your Vercel URL (e.g., `your-project.vercel.app`)
- [ ] Check homepage loads
- [ ] Test authentication (if in Pi Browser)
- [ ] Check browser console for errors
- [ ] Verify all images/assets load
- [ ] Test navigation between pages
- [ ] Check mobile responsiveness

---

## 📊 Vercel Dashboard

- **Deployments**: https://vercel.com/your-username/dropstores/deployments
- **Settings**: https://vercel.com/your-username/dropstores/settings
- **Domains**: https://vercel.com/your-username/dropstores/settings/domains
- **Environment Variables**: https://vercel.com/your-username/dropstores/settings/environment-variables

---

## 🔗 Quick Links

- Vercel Docs: https://vercel.com/docs
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html#vercel
- Custom Domains: https://vercel.com/docs/concepts/projects/domains
