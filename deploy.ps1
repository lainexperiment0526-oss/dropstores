# Deploy DropStore - Complete Deployment Script
# Run this after setting up Supabase CLI and Vercel CLI

Write-Host "🚀 DropStore Deployment Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCli) {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Red
    npm install -g supabase
} else {
    Write-Host "✅ Supabase CLI found" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Step 1: Deploy Database Schema" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://supabase.com/dashboard/project/kvqfnmdkxaclsnyuzkyp/sql/new" -ForegroundColor Yellow
Write-Host "2. Copy contents from: database-full-schema.sql" -ForegroundColor Yellow
Write-Host "3. Click 'Run'" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter when database schema is deployed..."

Write-Host ""
Write-Host "📋 Step 2: Link Supabase Project" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
supabase link --project-ref kvqfnmdkxaclsnyuzkyp

Write-Host ""
Write-Host "📋 Step 3: Set Edge Function Secrets" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Setting PI_API_KEY..." -ForegroundColor Yellow
supabase secrets set PI_API_KEY=h1y9zxfm7infu7ysppf7mene5bab9y8gm1f09jsludamf48vler4n6vsiqrdmruy --project-ref kvqfnmdkxaclsnyuzkyp

Write-Host "Setting VALIDATION_KEY..." -ForegroundColor Yellow
supabase secrets set VALIDATION_KEY=a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1 --project-ref kvqfnmdkxaclsnyuzkyp

Write-Host "Setting DOMAIN_VALIDATION_KEY..." -ForegroundColor Yellow
supabase secrets set DOMAIN_VALIDATION_KEY=a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1 --project-ref kvqfnmdkxaclsnyuzkyp

Write-Host ""
Write-Host "✅ Secrets configured" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Step 4: Deploy Edge Functions" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$functions = @(
    "pi-auth",
    "pi-payment-approve",
    "pi-payment-complete",
    "verify-pi-transaction",
    "create-store",
    "dashboard",
    "store-url",
    "store-user",
    "user-data",
    "merchant-payout",
    "request-payout",
    "gmail-auth"
)

foreach ($func in $functions) {
    Write-Host "Deploying $func..." -ForegroundColor Yellow
    supabase functions deploy $func --no-verify-jwt --project-ref kvqfnmdkxaclsnyuzkyp
    Write-Host "✅ $func deployed" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Step 5: Create Storage Bucket" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://supabase.com/dashboard/project/kvqfnmdkxaclsnyuzkyp/storage/buckets" -ForegroundColor Yellow
Write-Host "2. Click 'New Bucket'" -ForegroundColor Yellow
Write-Host "3. Name: 'store-assets'" -ForegroundColor Yellow
Write-Host "4. Make it PUBLIC" -ForegroundColor Yellow
Write-Host "5. Click 'Create'" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter when storage bucket is created..."

Write-Host ""
Write-Host "📋 Step 6: Build Frontend" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
npm run build

Write-Host ""
Write-Host "📋 Step 7: Deploy to Vercel (Manual)" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vercel Setup Instructions:" -ForegroundColor Yellow
Write-Host "1. Go to: https://vercel.com/new" -ForegroundColor Yellow
Write-Host "2. Import this repository" -ForegroundColor Yellow
Write-Host "3. Framework Preset: Vite" -ForegroundColor Yellow
Write-Host "4. Build Command: npm run build" -ForegroundColor Yellow
Write-Host "5. Output Directory: dist" -ForegroundColor Yellow
Write-Host ""
Write-Host "Environment Variables to add:" -ForegroundColor Yellow
Write-Host "VITE_SUPABASE_URL=https://kvqfnmdkxaclsnyuzkyp.supabase.co" -ForegroundColor Gray
Write-Host "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." -ForegroundColor Gray
Write-Host "VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." -ForegroundColor Gray
Write-Host "SUPABASE_SERVICE_ROLE_KEY=sb_secret_SIqZm1fCy5acyRwenl9mFA_TWMrksAD" -ForegroundColor Gray
Write-Host "VITE_PI_API_KEY=h1y9zxfm7infu7ysppf7mene5bab9y8gm1f09jsludamf48vler4n6vsiqrdmruy" -ForegroundColor Gray
Write-Host "VITE_PI_MAINNET_MODE=true" -ForegroundColor Gray
Write-Host "VITE_PI_NETWORK=mainnet" -ForegroundColor Gray
Write-Host "VITE_API_URL=https://api.minepi.com" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Add custom domain: dropshops.space" -ForegroundColor Yellow
Write-Host "7. Add www.dropshops.space" -ForegroundColor Yellow
Write-Host ""

Write-Host ""
Write-Host "📋 Step 8: Configure Pi Developer Portal" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://developers.minepi.com/" -ForegroundColor Yellow
Write-Host "2. App URL: https://dropshops.space" -ForegroundColor Yellow
Write-Host "3. Validation URL: https://dropshops.space/validation-key.txt" -ForegroundColor Yellow
Write-Host "4. Add redirect URLs:" -ForegroundColor Yellow
Write-Host "   - https://dropshops.space/auth" -ForegroundColor Gray
Write-Host "   - https://www.dropshops.space/auth" -ForegroundColor Gray
Write-Host "5. Wallet: GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ" -ForegroundColor Yellow
Write-Host "6. Network: Mainnet" -ForegroundColor Yellow
Write-Host ""

Write-Host ""
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your DropStore is ready!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure DNS for dropshops.space (point to Vercel)" -ForegroundColor White
Write-Host "2. Test authentication in Pi Browser" -ForegroundColor White
Write-Host "3. Test payment flow" -ForegroundColor White
Write-Host "4. Test ad network (if enabled)" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation: PI_NETWORK_SETUP.md" -ForegroundColor Cyan
Write-Host ""
