# Pre-Deployment Verification Script
# Run this before deploying to Vercel

Write-Host "🔍 Vercel Deployment Pre-Check" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# Check 1: Node modules installed
Write-Host "1. Checking node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules found" -ForegroundColor Green
} else {
    Write-Host "   ❌ node_modules not found - Run: npm install" -ForegroundColor Red
    $errors++
}

# Check 2: Critical files exist
Write-Host "`n2. Checking critical files..." -ForegroundColor Yellow
$criticalFiles = @(
    "package.json",
    "index.html",
    "vercel.json",
    "vite.config.ts",
    "public/validation-key.txt",
    "public/robots.txt"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file missing" -ForegroundColor Red
        $errors++
    }
}

# Check 3: Environment variables template
Write-Host "`n3. Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.example") {
    Write-Host "   ✅ .env.example found" -ForegroundColor Green
    Write-Host "   ℹ️  Remember to add all variables to Vercel Dashboard" -ForegroundColor Blue
} else {
    Write-Host "   ⚠️  .env.example not found" -ForegroundColor Yellow
    $warnings++
}

# Check 4: Build test
Write-Host "`n4. Testing build..." -ForegroundColor Yellow
Write-Host "   Running: npm run build" -ForegroundColor Gray

try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Build successful" -ForegroundColor Green
        
        # Check dist folder
        if (Test-Path "dist") {
            $distFiles = Get-ChildItem "dist" -Recurse | Measure-Object
            Write-Host "   ✅ dist/ folder created with $($distFiles.Count) files" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ Build failed" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "   ❌ Build failed with error: $_" -ForegroundColor Red
    $errors++
}

# Check 5: Validation key
Write-Host "`n5. Checking Pi Network validation key..." -ForegroundColor Yellow
if (Test-Path "public/validation-key.txt") {
    $validationKey = Get-Content "public/validation-key.txt" -Raw
    if ($validationKey.Length -gt 50) {
        Write-Host "   ✅ Validation key present" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Validation key seems too short" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "   ❌ Validation key missing" -ForegroundColor Red
    $errors++
}

# Check 6: Pi SDK in HTML
Write-Host "`n6. Checking Pi SDK integration..." -ForegroundColor Yellow
$indexContent = Get-Content "index.html" -Raw
if ($indexContent -match "sdk.minepi.com/pi-sdk.js") {
    Write-Host "   ✅ Pi SDK script found in index.html" -ForegroundColor Green
} else {
    Write-Host "   ❌ Pi SDK script not found in index.html" -ForegroundColor Red
    $errors++
}

# Check 7: Supabase functions
Write-Host "`n7. Checking Supabase functions..." -ForegroundColor Yellow
$functions = @(
    "supabase/functions/pi-auth/index.ts",
    "supabase/functions/pi-payment-approve/index.ts",
    "supabase/functions/pi-payment-complete/index.ts"
)

foreach ($func in $functions) {
    if (Test-Path $func) {
        Write-Host "   ✅ $(Split-Path $func -Parent | Split-Path -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $(Split-Path $func -Parent | Split-Path -Leaf) missing" -ForegroundColor Yellow
        $warnings++
    }
}
Write-Host "   ℹ️  Note: Edge functions deploy to Supabase, not Vercel" -ForegroundColor Blue

# Summary
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ All checks passed! Ready to deploy to Vercel" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Push to GitHub" -ForegroundColor White
    Write-Host "2. Import project in Vercel: https://vercel.com/new" -ForegroundColor White
    Write-Host "3. Add environment variables from .env.example" -ForegroundColor White
    Write-Host "4. Deploy!" -ForegroundColor White
} elseif ($errors -eq 0) {
    Write-Host "⚠️  $warnings warning(s) found - Review before deploying" -ForegroundColor Yellow
} else {
    Write-Host "❌ $errors error(s) and $warnings warning(s) found" -ForegroundColor Red
    Write-Host "Please fix errors before deploying" -ForegroundColor Red
}

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "- Full guide: DEPLOY_CHECKLIST.md" -ForegroundColor White
Write-Host "- Vercel setup: VERCEL_DEPLOY.md" -ForegroundColor White

# Cleanup
if (Test-Path "dist") {
    Write-Host "`n🧹 Cleaning up build artifacts..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "dist"
    Write-Host "   Cleaned dist/ folder" -ForegroundColor Gray
}

Write-Host ""
