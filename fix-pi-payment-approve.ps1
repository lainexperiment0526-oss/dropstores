# Fix pi-payment-approve Function
# Sets environment secrets on the CORRECT Supabase project and redeploys

Write-Host "Fixing pi-payment-approve Edge Function" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# The ACTUAL project where edge functions are deployed
$correctProjectRef = "xyqoyfhxslauiwkuopve"
$envPath = ".\supabase\.env"

Write-Host "Project Information:" -ForegroundColor Yellow
Write-Host "   Project ID: $correctProjectRef" -ForegroundColor Gray
Write-Host "   Function URL: https://$correctProjectRef.supabase.co/functions/v1/pi-payment-approve" -ForegroundColor Gray
Write-Host ""

# Check if .env file exists
if (-not (Test-Path $envPath)) {
    Write-Host "Error: .env file not found at: $envPath" -ForegroundColor Red
    exit 1
}

# Read PI_API_KEY from .env
Write-Host "Reading PI_API_KEY from supabase/.env..." -ForegroundColor Cyan
[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments', '')]
$PI_API_KEY = ""
Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    if ($line -match "^PI_API_KEY=(.+)`$") {
        $PI_API_KEY = $matches[1]
    }
}

if (-not $PI_API_KEY) {
    Write-Host "Error: PI_API_KEY not found in .env file" -ForegroundColor Red
    exit 1
}

$keyPreview = $PI_API_KEY.Substring(0, [Math]::Min(10, $PI_API_KEY.Length))
Write-Host "Found PI_API_KEY ($keyPreview...)" -ForegroundColor Green
Write-Host ""

# Set the secret on Supabase
Write-Host "Setting PI_API_KEY secret on Supabase project..." -ForegroundColor Cyan
try {
    $setResult = npx supabase secrets set "PI_API_KEY=$PI_API_KEY" --project-ref $correctProjectRef 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Secret set successfully" -ForegroundColor Green
    } else {
        Write-Host "Failed to set secret" -ForegroundColor Red
        Write-Host "Error: $setResult" -ForegroundColor Red
        Write-Host ""
        Write-Host "Manual fix:" -ForegroundColor Yellow
        Write-Host "   1. Go to: https://supabase.com/dashboard/project/$correctProjectRef/settings/functions" -ForegroundColor Gray
        Write-Host "   2. Add secret: PI_API_KEY = $PI_API_KEY" -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host "Error setting secret: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Deploy the function
Write-Host "Deploying pi-payment-approve function..." -ForegroundColor Cyan
try {
    $deployResult = npx supabase functions deploy pi-payment-approve --project-ref $correctProjectRef --no-verify-jwt 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Function deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "Deployment failed" -ForegroundColor Red
        Write-Host "Error: $deployResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Deployment error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "pi-payment-approve is now fixed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   1. Test the function: https://$correctProjectRef.supabase.co/functions/v1/pi-payment-approve" -ForegroundColor Gray
Write-Host "   2. Check logs: npx supabase functions logs pi-payment-approve --project-ref $correctProjectRef" -ForegroundColor Gray
Write-Host "   3. Monitor invocations: https://supabase.com/dashboard/project/$correctProjectRef/functions" -ForegroundColor Gray
Write-Host ""
Write-Host "To deploy other functions to this project, run deploy-all-functions.ps1" -ForegroundColor Yellow
Write-Host ""
