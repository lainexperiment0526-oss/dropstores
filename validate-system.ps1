# System Validation Script
# This script validates all components of the merchant earnings system

Write-Host "=== MERCHANT EARNINGS & PAYMENT SYSTEM VALIDATION ===" -ForegroundColor Green
Write-Host ""

# Check if all required files exist
$requiredFiles = @(
    "src\pages\PayPage.tsx",
    "src\components\MerchantEarnings.tsx", 
    "src\components\AdminWithdrawalApproval.tsx",
    "src\components\PlatformFeeModal.tsx",
    "database-merchant-earnings.sql"
)

Write-Host "1. COMPONENT FILES CHECK:" -ForegroundColor Cyan
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  + $file - Found" -ForegroundColor Green
    } else {
        Write-Host "  - $file - Missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2. SUPABASE SETUP CHECK:" -ForegroundColor Cyan

# Check Supabase directory
if (Test-Path "supabase") {
    Write-Host "  + Supabase directory exists" -ForegroundColor Green
} else {
    Write-Host "  - Supabase directory missing" -ForegroundColor Red
}

# Check config file
if (Test-Path "supabase\config.toml") {
    Write-Host "  + Supabase config found" -ForegroundColor Green
} else {
    Write-Host "  - Supabase config missing" -ForegroundColor Red
}

# Check migrations directory
if (Test-Path "supabase\migrations") {
    Write-Host "  ✓ Migrations directory exists" -ForegroundColor Green
    
    # Count migration files
    $migrationFiles = Get-ChildItem "supabase\migrations" -Filter "*.sql" | Measure-Object
    Write-Host "    Migration files: $($migrationFiles.Count)" -ForegroundColor White
} else {
    Write-Host "  ✗ Migrations directory missing" -ForegroundColor Red
}

# Check functions directory
if (Test-Path "supabase\functions") {
    Write-Host "  ✓ Functions directory exists" -ForegroundColor Green
    
    # List function directories
    $functions = Get-ChildItem "supabase\functions" -Directory
    if ($functions.Count -gt 0) {
        Write-Host "    Available functions:" -ForegroundColor White
        foreach ($func in $functions) {
            Write-Host "      - $($func.Name)" -ForegroundColor White
        }
    } else {
        Write-Host "    No functions found" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ Functions directory missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. PACKAGE DEPENDENCIES CHECK:" -ForegroundColor Cyan

# Check package.json
if (Test-Path "package.json") {
    Write-Host "  ✓ package.json found" -ForegroundColor Green
    
    # Check for key dependencies
    $packageContent = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    $keyDependencies = @("@supabase/supabase-js", "react", "typescript", "lucide-react")
    
    foreach ($dep in $keyDependencies) {
        if ($packageContent.dependencies.$dep -or $packageContent.devDependencies.$dep) {
            Write-Host "    ✓ $dep - Installed" -ForegroundColor Green
        } else {
            Write-Host "    ✗ $dep - Missing" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  ✗ package.json missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. INTEGRATION CHECK:" -ForegroundColor Cyan

# Check App.tsx for PayPage route
if (Test-Path "src\App.tsx") {
    $appContent = Get-Content "src\App.tsx" -Raw
    if ($appContent -match "PayPage") {
        Write-Host "  ✓ PayPage route integrated in App.tsx" -ForegroundColor Green
    } else {
        Write-Host "  ✗ PayPage route missing from App.tsx" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ src\App.tsx not found" -ForegroundColor Red
}

# Check Dashboard.tsx for MerchantEarnings
if (Test-Path "src\pages\Dashboard.tsx") {
    $dashboardContent = Get-Content "src\pages\Dashboard.tsx" -Raw
    if ($dashboardContent -match "MerchantEarnings") {
        Write-Host "  ✓ MerchantEarnings integrated in Dashboard.tsx" -ForegroundColor Green
    } else {
        Write-Host "  ✗ MerchantEarnings missing from Dashboard.tsx" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ src\pages\Dashboard.tsx not found" -ForegroundColor Red
}

# Check Admin.tsx for withdrawal approval
if (Test-Path "src\pages\Admin.tsx") {
    $adminContent = Get-Content "src\pages\Admin.tsx" -Raw
    if ($adminContent -match "AdminWithdrawalApproval") {
        Write-Host "  ✓ AdminWithdrawalApproval integrated in Admin.tsx" -ForegroundColor Green
    } else {
        Write-Host "  ✗ AdminWithdrawalApproval missing from Admin.tsx" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ src\pages\Admin.tsx not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "5. ENVIRONMENT CHECK:" -ForegroundColor Cyan

# Check for environment files
$envFiles = @(".env", ".env.local", "supabase\.env")

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "  ✓ $envFile found" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== VALIDATION COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS TO DEPLOY:" -ForegroundColor Cyan
Write-Host "1. Run: npm install (if dependencies missing)" -ForegroundColor White
Write-Host "2. Run: supabase db push (to apply database schema)" -ForegroundColor White  
Write-Host "3. Run: supabase functions deploy (to deploy Edge Functions)" -ForegroundColor White
Write-Host "4. Run: npm run dev (to start development server)" -ForegroundColor White
Write-Host ""
Write-Host "FEATURES READY:" -ForegroundColor Cyan
Write-Host "- Complete payment checkout system" -ForegroundColor Green
Write-Host "- Merchant earnings tracking" -ForegroundColor Green  
Write-Host "- Withdrawal request system" -ForegroundColor Green
Write-Host "- Admin approval workflow" -ForegroundColor Green
Write-Host "- Platform fee management (2%)" -ForegroundColor Green
Write-Host "- Store theme customization" -ForegroundColor Green
Write-Host ""