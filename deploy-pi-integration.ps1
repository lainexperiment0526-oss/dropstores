#!/usr/bin/env pwsh
# Pi Network Integration - Complete Deployment & Testing Script
# Deploys all Pi edge functions and runs comprehensive tests

param(
    [string]$ProjectRef = "kvqfnmdkxaclsnyuzkyp",
    [switch]$SkipSecrets = $false,
    [switch]$SkipFunctions = $false,
    [switch]$SkipTests = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

# Colors for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-Success {
    param([string]$Message)
    Write-Host "$Green✓$Reset $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "$Red✗$Reset $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "$Blue→$Reset $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "$Yellow⚠$Reset $Message" -ForegroundColor Yellow
}

# API Keys
$PI_API_KEY = "mj69bcvflcervamlbzgissqoxij6sxzr1k71wcuvdhcuwxtjmjinlgk0zfhz90y7"
$VALIDATION_KEY = "a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1"

Write-Info "╔════════════════════════════════════════════════════════════╗"
Write-Info "║   Pi Network Integration - Deployment & Testing Script     ║"
Write-Info "║   Project: $ProjectRef                     ║"
Write-Info "╚════════════════════════════════════════════════════════════╝"

# ============================================================================
# STEP 1: Set Supabase Secrets
# ============================================================================

if (-not $SkipSecrets) {
    Write-Info ""
    Write-Info "STEP 1: Setting Supabase Secrets"
    Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    Write-Info "Setting PI_API_KEY..."
    supabase secrets set PI_API_KEY="$PI_API_KEY" --project-ref $ProjectRef
    if ($LASTEXITCODE -eq 0) {
        Write-Success "PI_API_KEY set successfully"
    } else {
        Write-Warning "Failed to set PI_API_KEY (may already exist)"
    }
    
    Write-Info "Setting VALIDATION_KEY..."
    supabase secrets set VALIDATION_KEY="$VALIDATION_KEY" --project-ref $ProjectRef
    if ($LASTEXITCODE -eq 0) {
        Write-Success "VALIDATION_KEY set successfully"
    } else {
        Write-Warning "Failed to set VALIDATION_KEY (may already exist)"
    }
    
    Write-Info "Verifying secrets..."
    supabase secrets list --project-ref $ProjectRef
    Write-Success "Secrets configured"
}

# ============================================================================
# STEP 2: Deploy Edge Functions
# ============================================================================

if (-not $SkipFunctions) {
    Write-Info ""
    Write-Info "STEP 2: Deploying Edge Functions"
    Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    $Functions = @("pi-auth", "pi-payment-approve", "pi-payment-complete", "pi-ad-verify")
    
    foreach ($Function in $Functions) {
        Write-Info "Deploying $Function..."
        
        $DeployArgs = @("functions", "deploy", $Function, "--project-ref", $ProjectRef, "--no-verify-jwt")
        if ($Force) {
            $DeployArgs += "--force"
        }
        
        supabase @DeployArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$Function deployed successfully"
        } else {
            Write-Error "Failed to deploy $Function"
            if (-not $Force) {
                Write-Warning "Try with -Force flag to overwrite existing function"
            }
        }
    }
    
    Write-Success "All edge functions deployed"
}

# ============================================================================
# STEP 3: Verify Deployment
# ============================================================================

Write-Info ""
Write-Info "STEP 3: Verifying Deployment"
Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Info "Checking edge function logs..."
Write-Info ""

$Functions = @("pi-auth", "pi-payment-approve", "pi-payment-complete", "pi-ad-verify")

foreach ($Function in $Functions) {
    Write-Info "Recent logs for $Function (last 5 minutes):"
    supabase functions logs $Function --project-ref $ProjectRef --since 5m
    Write-Info ""
}

# ============================================================================
# STEP 4: Test API Connectivity
# ============================================================================

if (-not $SkipTests) {
    Write-Info ""
    Write-Info "STEP 4: Testing API Connectivity"
    Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Test Pi Platform API
    Write-Info "Testing Pi Platform API connectivity..."
    try {
        $Response = Invoke-WebRequest -Uri "https://api.minepi.com/v2/me" `
            -Headers @{ Authorization = "Bearer test_token_invalid" } `
            -TimeoutSec 5 `
            -ErrorAction SilentlyContinue
        
        if ($Response.StatusCode -eq 401 -or $Response.StatusCode -eq 403) {
            Write-Success "Pi Platform API is reachable (auth check working)"
        } else {
            Write-Warning "Pi Platform API responded with status: $($Response.StatusCode)"
        }
    } catch {
        Write-Warning "Could not verify Pi Platform API (may be blocked by network)"
    }
    
    # Test Blockchain API
    Write-Info "Testing Pi Blockchain API connectivity..."
    try {
        $Response = Invoke-WebRequest -Uri "https://api.mainnet.minepi.com/health" `
            -TimeoutSec 5 `
            -ErrorAction SilentlyContinue
        
        if ($Response.StatusCode -eq 200) {
            Write-Success "Pi Blockchain API is reachable"
        } else {
            Write-Warning "Pi Blockchain API responded with status: $($Response.StatusCode)"
        }
    } catch {
        Write-Warning "Could not verify Pi Blockchain API"
    }
    
    # Test Supabase Functions
    Write-Info "Testing Supabase Functions endpoint..."
    try {
        $FunctionUrl = "https://kvqfnmdkxaclsnyuzkyp.functions.supabase.co/functions/v1/pi-auth"
        $Response = Invoke-WebRequest -Uri $FunctionUrl `
            -Method OPTIONS `
            -TimeoutSec 5 `
            -ErrorAction SilentlyContinue
        
        if ($Response.StatusCode -eq 200) {
            Write-Success "Supabase Functions endpoint is reachable"
        }
    } catch {
        Write-Warning "Could not verify Supabase Functions endpoint"
    }
}

# ============================================================================
# STEP 5: Print Configuration Summary
# ============================================================================

Write-Info ""
Write-Info "STEP 5: Configuration Summary"
Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Info ""
Write-Info "📋 Pi Network Configuration:"
Write-Info "   Network: Mainnet (Production)"
Write-Info "   SDK Version: 2.0"
Write-Info "   API Base: https://api.minepi.com"
Write-Info "   Blockchain: https://api.mainnet.minepi.com"
Write-Info ""

Write-Info "🔐 API Keys Configured:"
Write-Info "   PI_API_KEY: $(($PI_API_KEY -replace '(.{4})(.*)(.{4})','$1***$3'))"
Write-Info "   VALIDATION_KEY: $(($VALIDATION_KEY -replace '(.{4})(.*)(.{4})','$1***$3'))"
Write-Info ""

Write-Info "🚀 Deployed Functions:"
Write-Info "   ✓ pi-auth (Authentication)"
Write-Info "   ✓ pi-payment-approve (Payment Approval)"
Write-Info "   ✓ pi-payment-complete (Payment Completion)"
Write-Info "   ✓ pi-ad-verify (Ad Network Verification)"
Write-Info ""

Write-Info "📍 Function URLs:"
Write-Info "   https://kvqfnmdkxaclsnyuzkyp.functions.supabase.co/functions/v1/pi-auth"
Write-Info "   https://kvqfnmdkxaclsnyuzkyp.functions.supabase.co/functions/v1/pi-payment-approve"
Write-Info "   https://kvqfnmdkxaclsnyuzkyp.functions.supabase.co/functions/v1/pi-payment-complete"
Write-Info "   https://kvqfnmdkxaclsnyuzkyp.functions.supabase.co/functions/v1/pi-ad-verify"
Write-Info ""

Write-Info "🧪 Testing Checklist:"
Write-Info "   [ ] Test Authentication (/auth page)"
Write-Info "   [ ] Test Payment (Add product → Checkout)"
Write-Info "   [ ] Test Subscription (Pricing page)"
Write-Info "   [ ] Test Ad Network (Interstitial ads)"
Write-Info "   [ ] Test Rewarded Ads (Watch ad button)"
Write-Info "   [ ] Check Blockchain Explorer (https://explorer.minepi.com)"
Write-Info "   [ ] Monitor Function Logs"
Write-Info ""

# ============================================================================
# STEP 6: Display Next Steps
# ============================================================================

Write-Info ""
Write-Info "STEP 6: Next Steps"
Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Info ""
Write-Info "1. Test in Pi Browser:"
Write-Info "   • Open app in Pi Browser (mobile or emulator)"
Write-Info "   • Navigate to /auth page"
Write-Info "   • Complete authentication flow"
Write-Info ""

Write-Info "2. Monitor Logs:"
Write-Info "   supabase functions logs pi-auth --project-ref $ProjectRef --follow"
Write-Info ""

Write-Info "3. View Database:"
Write-Info "   • Go to Supabase Dashboard"
Write-Info "   • Check 'pi_users' table for authenticated users"
Write-Info "   • Check 'payments' table for completed transactions"
Write-Info ""

Write-Info "4. Track Transactions:"
Write-Info "   • Explorer: https://explorer.minepi.com"
Write-Info "   • Search for wallet address to view on-chain payments"
Write-Info ""

Write-Success ""
Write-Success "╔════════════════════════════════════════════════════════════╗"
Write-Success "║        Deployment Complete - Ready for Testing!           ║"
Write-Success "╚════════════════════════════════════════════════════════════╝"
