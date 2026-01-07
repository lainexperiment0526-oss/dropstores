# Merchant Earnings System Setup Script
# This script sets up the merchant earnings and withdrawal system in Supabase

Write-Host "Setting up Merchant Earnings & Withdrawal System..." -ForegroundColor Green

try {
    # Check if Supabase CLI is available
    if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
        Write-Host "Supabase CLI not found. Please install it first:" -ForegroundColor Red
        Write-Host "npm install -g supabase" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "Current directory: $PWD"

    # Run the merchant earnings migration
    Write-Host "Creating merchant earnings and withdrawal tables..." -ForegroundColor Cyan
    $migrationResult = supabase db push

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database schema updated successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to update database schema. Exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Migration result:" -ForegroundColor Yellow
        Write-Host $migrationResult
    }

    # Check if Edge Functions directory exists
    $functionsPath = ".\supabase\functions"
    if (-not (Test-Path $functionsPath)) {
        Write-Host "Creating Edge Functions directory..." -ForegroundColor Cyan
        New-Item -Path $functionsPath -ItemType Directory -Force
    }

    # Deploy Edge Functions
    Write-Host "Deploying Edge Functions..." -ForegroundColor Cyan
    
    $functions = @("complete-payment", "approve-payment", "verify-payment")
    
    foreach ($func in $functions) {
        $funcPath = "$functionsPath\$func"
        if (Test-Path $funcPath) {
            Write-Host "Deploying function: $func" -ForegroundColor Blue
            $deployResult = supabase functions deploy $func
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Function $func deployed successfully!" -ForegroundColor Green
            } else {
                Write-Host "Warning: Failed to deploy function $func" -ForegroundColor Yellow
            }
        } else {
            Write-Host "Function $func not found, skipping..." -ForegroundColor Yellow
        }
    }

    # Test database connection
    Write-Host "Testing database connection..." -ForegroundColor Cyan
    $testResult = supabase db ping

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database connection successful!" -ForegroundColor Green
    } else {
        Write-Host "Database connection failed" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "Merchant Earnings System Setup Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Test payment flow in development" -ForegroundColor White
    Write-Host "2. Verify earnings tracking works" -ForegroundColor White
    Write-Host "3. Test withdrawal request system" -ForegroundColor White
    Write-Host "4. Verify admin approval workflow" -ForegroundColor White
    Write-Host ""
    Write-Host "Key Features Enabled:" -ForegroundColor Cyan
    Write-Host "- Payment completion tracking" -ForegroundColor Green
    Write-Host "- Merchant earnings calculation" -ForegroundColor Green
    Write-Host "- Platform fee deduction (2 percent)" -ForegroundColor Green
    Write-Host "- Withdrawal request system" -ForegroundColor Green
    Write-Host "- Admin approval workflow" -ForegroundColor Green
    Write-Host "- Automatic earnings distribution" -ForegroundColor Green

} catch {
    Write-Host "Setup failed with error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "supabase db push          - Apply database migrations" -ForegroundColor White
Write-Host "supabase functions deploy - Deploy all Edge Functions" -ForegroundColor White
Write-Host "supabase db reset         - Reset database (dev only)" -ForegroundColor White
Write-Host ""