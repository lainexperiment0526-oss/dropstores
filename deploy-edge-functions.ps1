# Deploy Supabase Edge Functions Script
# Last Updated: December 22, 2025

Write-Host "🚀 Deploying Supabase Edge Functions" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Project configuration
$projectRef = "kvqfnmdkxaclsnyuzkyp"
$envPath = ".\supabase\.env"

# Check if .env file exists
if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found at: $envPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green
Write-Host ""

# List of edge functions to deploy
$functions = @(
    "pi-auth",
    "pi-payment-approve",
    "pi-payment-complete",
    "pi-payment-cancel",
    "verify-pi-transaction",
    "merchant-payout",
    "request-payout",
    "create-store",
    "dashboard",
    "store-url",
    "store-user",
    "user-data",
    "gmail-auth"
)

Write-Host "📦 Functions to deploy:" -ForegroundColor Cyan
$functions | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
Write-Host ""

# Confirm deployment
$confirm = Read-Host "Deploy all functions? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0
$failed = @()

foreach ($func in $functions) {
    Write-Host "📤 Deploying $func..." -ForegroundColor Yellow
    
    try {
        $output = supabase functions deploy $func --project-ref $projectRef --no-verify-jwt 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ $func deployed successfully" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "   ❌ $func deployment failed" -ForegroundColor Red
            Write-Host "   Error: $output" -ForegroundColor Red
            $failCount++
            $failed += $func
        }
    } catch {
        Write-Host "   ❌ $func deployment failed with exception" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        $failCount++
        $failed += $func
    }
    
    Write-Host ""
}

# Summary
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })

if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "Failed functions:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "💡 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "   1. Check if you're logged in: supabase login" -ForegroundColor Gray
    Write-Host "   2. Verify project ref: supabase projects list" -ForegroundColor Gray
    Write-Host "   3. Check function code for syntax errors" -ForegroundColor Gray
    Write-Host "   4. Review .env file has all required variables" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "🎉 All edge functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Test Pi authentication flow" -ForegroundColor Gray
Write-Host "   2. Test payment flow" -ForegroundColor Gray
Write-Host "   3. Verify merchant payout system" -ForegroundColor Gray
Write-Host "   4. Check Supabase logs for any errors" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs:     supabase functions logs pi-auth --project-ref $projectRef" -ForegroundColor Gray
Write-Host "   List functions: supabase functions list --project-ref $projectRef" -ForegroundColor Gray
Write-Host ""
