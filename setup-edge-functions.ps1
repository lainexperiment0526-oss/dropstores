# Setup and Deploy Supabase Edge Functions
# Last Updated: December 22, 2025
# This script sets environment secrets and deploys all edge functions

Write-Host "🔧 Setting up Supabase Edge Functions" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$projectRef = "kvqfnmdkxaclsnyuzkyp"
$envPath = ".\supabase\.env"

# Check if .env file exists
if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found at: $envPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green
Write-Host ""

# Read environment variables from .env file
Write-Host "📋 Reading environment variables..." -ForegroundColor Cyan
$envVars = @{}
Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#')) {
        $parts = $line -split '=', 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            $envVars[$key] = $value
        }
    }
}

Write-Host "Found $($envVars.Count) environment variables" -ForegroundColor Green
Write-Host ""

# Set secrets for each environment variable
Write-Host "🔐 Setting Supabase secrets..." -ForegroundColor Cyan
$secretsSet = 0
$secretsFailed = 0

foreach ($key in $envVars.Keys) {
    Write-Host "   Setting $key..." -ForegroundColor Yellow -NoNewline
    try {
        $value = $envVars[$key]
        $setCmd = "npx supabase secrets set $key=`"$value`" --project-ref $projectRef 2>&1"
        $result = Invoke-Expression $setCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $secretsSet++
        } else {
            Write-Host " ❌" -ForegroundColor Red
            Write-Host "      Error: $result" -ForegroundColor Red
            $secretsFailed++
        }
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "      Error: $_" -ForegroundColor Red
        $secretsFailed++
    }
}

Write-Host ""
Write-Host "✅ Secrets set: $secretsSet" -ForegroundColor Green
if ($secretsFailed -gt 0) {
    Write-Host "❌ Secrets failed: $secretsFailed" -ForegroundColor Red
}
Write-Host ""

# List of edge functions to deploy
$functions = @(
    "create-store",
    "dashboard",
    "gmail-auth",
    "merchant-payout",
    "pi-auth",
    "pi-payment-approve",
    "pi-payment-complete",
    "request-payout",
    "store-url",
    "store-user",
    "user-data",
    "verify-pi-transaction"
)

Write-Host "📦 Functions to deploy:" -ForegroundColor Cyan
$functions | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
Write-Host ""

# Confirm deployment
$confirm = Read-Host "Deploy all $($functions.Count) functions? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Secrets have been set. You can deploy functions manually:" -ForegroundColor Cyan
    Write-Host "   npx supabase functions deploy <function-name> --project-ref $projectRef --no-verify-jwt" -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "🚀 Deploying functions..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0
$failed = @()

foreach ($func in $functions) {
    Write-Host "📤 Deploying $func..." -ForegroundColor Yellow
    
    try {
        $deployCmd = "npx supabase functions deploy $func --project-ref $projectRef --no-verify-jwt 2>&1"
        $output = Invoke-Expression $deployCmd
        
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
        Write-Host "   ❌ $func deployment failed" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        $failCount++
        $failed += $func
    }
    
    Write-Host ""
}

# Summary
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ Successful: $successCount/$($functions.Count)" -ForegroundColor Green
Write-Host "❌ Failed: $failCount/$($functions.Count)" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })

if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "Failed functions:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check logs: npx supabase functions logs <function-name> --project-ref $projectRef" -ForegroundColor Gray
    Write-Host "   2. Verify you're logged in: npx supabase login" -ForegroundColor Gray
    Write-Host "   3. Check function code for syntax errors" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "🎉 All edge functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Test functions at: https://supabase.com/dashboard/project/$projectRef/functions" -ForegroundColor Gray
Write-Host "   2. Check logs: npx supabase functions logs <function-name> --project-ref $projectRef" -ForegroundColor Gray
Write-Host "   3. Test Pi payment flow in your app" -ForegroundColor Gray
Write-Host ""
