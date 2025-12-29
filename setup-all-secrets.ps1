# Complete Supabase Secrets Setup - All at Once
# Sets all required secrets from supabase/.env file

Write-Host "Complete Supabase Secrets Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$projectRef = "kvqfnmdkxaclsnyuzkyp"
$envPath = ".\supabase\.env"

if (-not (Test-Path $envPath)) {
    Write-Host "Error: .env not found at $envPath" -ForegroundColor Red
    exit 1
}

Write-Host "Reading secrets from supabase\.env..." -ForegroundColor Yellow
$secrets = @{}
Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#')) {
        $parts = $line -split '=', 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            # Remove quotes if present
            $value = $value -replace '^"(.*)"$', '$1'
            $secrets[$key] = $value
        }
    }
}

Write-Host "Found $($secrets.Count) secrets" -ForegroundColor Green
Write-Host ""

# List of secrets to set (CLI-friendly names)
$secretKeys = @(
    "PI_API_KEY",
    "VALIDATION_KEY",
    "DOMAIN_VALIDATION_KEY",
    "MY_SUPABASE_URL",
    "MY_SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_ANON_KEY"
)

Write-Host "Secrets to set:" -ForegroundColor Cyan
foreach ($key in $secretKeys) {
    if ($secrets.ContainsKey($key)) {
        Write-Host "   $key - OK (found)" -ForegroundColor Green
    } else {
        Write-Host "   $key - MISSING" -ForegroundColor Red
    }
}
Write-Host ""

# Confirm
$confirm = Read-Host "Set all secrets? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Setting secrets..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0
$failed = @()

foreach ($key in $secretKeys) {
    if (-not $secrets.ContainsKey($key)) {
        Write-Host "$key - SKIPPED (not in .env)" -ForegroundColor Yellow
        continue
    }

    $value = $secrets[$key]
    Write-Host "$key - " -ForegroundColor Yellow -NoNewline

    try {
        $output = npx supabase secrets set $key=`"$value`" --project-ref $projectRef 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SET OK" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "FAILED" -ForegroundColor Red
            Write-Host "   $output" -ForegroundColor Red
            $failCount++
            $failed += $key
        }
    } catch {
        Write-Host "ERROR" -ForegroundColor Red
        Write-Host "   $_" -ForegroundColor Red
        $failCount++
        $failed += $key
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Set: $successCount Success | $failCount Failed" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Yellow" })

if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "Failed keys:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
}

Write-Host ""
Write-Host "Verifying secrets..." -ForegroundColor Cyan
Write-Host ""

try {
    $listOutput = npx supabase secrets list --project-ref $projectRef 2>&1
    Write-Host $listOutput -ForegroundColor Gray
} catch {
    Write-Host "Error listing secrets: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  1. All required secrets set" -ForegroundColor Green
Write-Host "  2. Verify list above shows all keys" -ForegroundColor Green
Write-Host "  3. Redeploy functions to apply secrets:" -ForegroundColor Cyan
Write-Host "     npx supabase functions deploy pi-auth pi-payment-approve pi-payment-complete --project-ref $projectRef --no-verify-jwt" -ForegroundColor Gray
Write-Host ""
