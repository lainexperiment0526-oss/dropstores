# Deploy ALL Edge Functions to Correct Project
# Uses: xyqoyfhxslauiwkuopve (the actual deployed project)

Write-Host "🚀 Deploying All Edge Functions" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$projectRef = "xyqoyfhxslauiwkuopve"
$envPath = ".\supabase\.env"

Write-Host "📋 Target Project: $projectRef" -ForegroundColor Yellow
Write-Host ""

# Check if .env file exists
if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found at: $envPath" -ForegroundColor Red
    exit 1
}

# Read and set all environment secrets
Write-Host "🔐 Setting environment secrets..." -ForegroundColor Cyan
$envVars = @{}
Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#')) {
        $parts = $line -split '=', 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            $envVars[$key] = $value
            Write-Host "   Setting $key..." -ForegroundColor Gray
        }
    }
}

# Build secrets command
$secretsStr = ($envVars.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join " "
Write-Host ""
Write-Host "Setting $($envVars.Count) secrets..." -ForegroundColor Cyan
$setResult = npx supabase secrets set $secretsStr --project-ref $projectRef 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Warning: Some secrets may not have been set" -ForegroundColor Yellow
    Write-Host "$setResult" -ForegroundColor Gray
} else {
    Write-Host "✅ All secrets set" -ForegroundColor Green
}

Write-Host ""

# List of functions
$functions = @(
    "pi-payment-approve",
    "pi-payment-complete",
    "pi-auth",
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

Write-Host "📦 Deploying $($functions.Count) functions..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0
$failed = @()

foreach ($func in $functions) {
    Write-Host "📤 $func..." -ForegroundColor Yellow -NoNewline
    
    try {
        $null = npx supabase functions deploy $func --project-ref $projectRef --no-verify-jwt 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " ❌" -ForegroundColor Red
            $failCount++
            $failed += $func
        }
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        $failCount++
        $failed += $func
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 Results" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Success: $successCount/$($functions.Count)" -ForegroundColor Green
Write-Host "❌ Failed: $failCount/$($functions.Count)" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })

if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "Failed:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
}

Write-Host ""
Write-Host "🔗 Dashboard: https://supabase.com/dashboard/project/$projectRef/functions" -ForegroundColor Cyan
Write-Host ""
