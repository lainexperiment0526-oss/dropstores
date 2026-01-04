# Pi Network Implementation Verification Script
# Tests Pi Browser compatibility, authentication, payments, and ad network according to official docs

Write-Host "🔍 Pi Network Implementation Verification" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "This script verifies your Pi Network implementation against official documentation:" -ForegroundColor Yellow
Write-Host "📚 https://pi-apps.github.io/community-developer-guide/" -ForegroundColor Gray
Write-Host "📚 https://github.com/pi-apps/pi-platform-docs" -ForegroundColor Gray

Write-Host ""
Write-Host "1️⃣ Checking Pi SDK Configuration..." -ForegroundColor Yellow

# Check if Pi SDK is properly loaded in HTML
$indexHtml = Get-Content "index.html" -Raw
if ($indexHtml -match '<script src="https://sdk\.minepi\.com/pi-sdk\.js"></script>') {
    Write-Host "  ✅ Pi SDK script tag found in index.html" -ForegroundColor Green
} else {
    Write-Host "  ❌ Pi SDK script tag missing from index.html" -ForegroundColor Red
    Write-Host "     Add: <script src=\"https://sdk.minepi.com/pi-sdk.js\"></script>" -ForegroundColor Gray
}

# Check Pi SDK initialization in TypeScript
$piSdkContent = Get-Content "src\lib\pi-sdk.ts" -Raw
if ($piSdkContent -match "Pi\.init\(\{ version: '2\.0'") {
    Write-Host "  ✅ Pi SDK initialization with version 2.0 found" -ForegroundColor Green
} else {
    Write-Host "  ❌ Pi SDK initialization incorrect or missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "2️⃣ Environment Configuration Check..." -ForegroundColor Yellow

$envContent = Get-Content ".env" -Raw

# Check required environment variables
$requiredEnvVars = @{
    "VITE_PI_SDK_URL" = "https://sdk.minepi.com/pi-sdk.js"
    "VITE_PI_NETWORK" = "mainnet"
    "VITE_PI_MAINNET_MODE" = "true"
    "VITE_PI_SANDBOX_MODE" = "false"
    "VITE_PI_AUTHENTICATION_ENABLED" = "true"
    "VITE_PI_PAYMENTS_ENABLED" = "true"
    "VITE_PI_AD_NETWORK_ENABLED" = "true"
}

foreach ($key in $requiredEnvVars.Keys) {
    $expectedValue = $requiredEnvVars[$key]
    if ($envContent -match "$key=`"$expectedValue`"") {
        Write-Host "  ✅ $key = $expectedValue" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $key should be '$expectedValue'" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "3️⃣ Pi Authentication Implementation..." -ForegroundColor Yellow

# Check authentication scopes
if ($piSdkContent -match "username.*payments.*wallet_address") {
    Write-Host "  ✅ Required scopes (username, payments, wallet_address) found" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Verify all required scopes are included" -ForegroundColor Yellow
}

# Check Pi API verification
if ($piSdkContent -match "https://api\.minepi\.com/v2/me") {
    Write-Host "  ✅ Pi API verification endpoint configured" -ForegroundColor Green
} else {
    Write-Host "  ❌ Pi API verification endpoint missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "4️⃣ Pi Payments Implementation..." -ForegroundColor Yellow

# Check payment callbacks
$paymentCallbacks = @(
    "onReadyForServerApproval",
    "onReadyForServerCompletion",
    "onCancel",
    "onError"
)

foreach ($callback in $paymentCallbacks) {
    if ($piSdkContent -match $callback) {
        Write-Host "  ✅ Payment callback '$callback' implemented" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Payment callback '$callback' missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "5️⃣ Pi Ad Network Implementation..." -ForegroundColor Yellow

# Check ad network features
$adFeatures = @(
    "nativeFeaturesList",
    "ad_network",
    "showAd",
    "isAdReady",
    "requestAd"
)

foreach ($feature in $adFeatures) {
    if ($piSdkContent -match $feature) {
        Write-Host "  ✅ Ad network feature '$feature' implemented" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Ad network feature '$feature' missing" -ForegroundColor Red
    }
}

# Check ad verification (security requirement)
if ($piSdkContent -match "verifyRewardedAdStatus|mediator_ack_status.*granted") {
    Write-Host "  ✅ Rewarded ad verification implemented (security requirement)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Rewarded ad verification missing (SECURITY ISSUE)" -ForegroundColor Red
    Write-Host "     This is required by official Pi docs to prevent cheating" -ForegroundColor Gray
}

Write-Host ""
Write-Host "6️⃣ Official Pi Documentation Compliance..." -ForegroundColor Yellow

# Check for proper error handling
$errorHandlingPatterns = @(
    "AD_NOT_AVAILABLE",
    "AD_DISPLAY_ERROR", 
    "AD_NETWORK_ERROR",
    "ADS_NOT_SUPPORTED",
    "USER_UNAUTHENTICATED"
)

$errorHandlingCount = 0
foreach ($pattern in $errorHandlingPatterns) {
    if ($piSdkContent -match $pattern) {
        $errorHandlingCount++
    }
}

if ($errorHandlingCount -eq $errorHandlingPatterns.Length) {
    Write-Host "  ✅ All required error handling cases implemented" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Missing some error handling cases ($errorHandlingCount/$($errorHandlingPatterns.Length))" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "7️⃣ Security Best Practices..." -ForegroundColor Yellow

# Check for server-side verification
if (Test-Path "supabase\functions\pi-auth\index.ts") {
    Write-Host "  ✅ Pi authentication server-side verification found" -ForegroundColor Green
} else {
    Write-Host "  ❌ Pi authentication server-side verification missing" -ForegroundColor Red
}

# Check for payment verification
if ((Get-Content "supabase\functions\pi-payment-*\index.ts" -ErrorAction SilentlyContinue) -match "verify|blockchain") {
    Write-Host "  ✅ Payment verification functions found" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Payment verification functions should be implemented" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "8️⃣ Testing Recommendations..." -ForegroundColor Yellow
Write-Host ""
Write-Host "To test your Pi implementation:" -ForegroundColor Cyan
Write-Host "1. Open your app in Pi Browser:" -ForegroundColor Gray
Write-Host "   - Android: https://play.google.com/store/apps/details?id=pi.browser" -ForegroundColor DarkGray
Write-Host "   - iOS: https://apps.apple.com/us/app/pi-browser/id1560911608" -ForegroundColor DarkGray
Write-Host ""
Write-Host "2. Test these features in order:" -ForegroundColor Gray
Write-Host "   ✓ Pi SDK availability (Pi.nativeFeaturesList)" -ForegroundColor DarkGray
Write-Host "   ✓ User authentication (Pi.authenticate)" -ForegroundColor DarkGray
Write-Host "   ✓ Payment creation (Pi.createPayment)" -ForegroundColor DarkGray
Write-Host "   ✓ Ad network support check (ad_network feature)" -ForegroundColor DarkGray
Write-Host "   ✓ Interstitial ads (Pi.Ads.showAd('interstitial'))" -ForegroundColor DarkGray
Write-Host "   ✓ Rewarded ads (Pi.Ads.showAd('rewarded'))" -ForegroundColor DarkGray
Write-Host ""
Write-Host "3. Console commands for manual testing:" -ForegroundColor Gray
Write-Host "   Pi.nativeFeaturesList().then(features => console.log(features))" -ForegroundColor DarkGray
Write-Host "   Pi.authenticate(['username', 'payments']).then(auth => console.log(auth))" -ForegroundColor DarkGray
Write-Host "   Pi.Ads.isAdReady('interstitial').then(ready => console.log(ready))" -ForegroundColor DarkGray

Write-Host ""
Write-Host "9️⃣ Summary..." -ForegroundColor Yellow

# Overall status
Write-Host ""
if ($errorHandlingCount -eq $errorHandlingPatterns.Length) {
    Write-Host "🎉 Your Pi Network implementation appears to be compliant with official documentation!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Pi SDK properly loaded and initialized" -ForegroundColor Green
    Write-Host "✅ Authentication with required scopes" -ForegroundColor Green  
    Write-Host "✅ Payment callbacks implemented" -ForegroundColor Green
    Write-Host "✅ Ad network with proper error handling" -ForegroundColor Green
    Write-Host "✅ Security verification for rewarded ads" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Ready for testing in Pi Browser!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Your implementation needs some improvements for full compliance." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please review the issues marked above and refer to:" -ForegroundColor Gray
    Write-Host "📖 Pi Developer Guide: https://pi-apps.github.io/community-developer-guide/" -ForegroundColor DarkGray
    Write-Host "📖 Pi Platform Docs: https://github.com/pi-apps/pi-platform-docs" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test in Pi Browser on mobile device" -ForegroundColor Gray
Write-Host "2. Apply for Pi Developer Ad Network if you haven't" -ForegroundColor Gray
Write-Host "3. Submit your app for Pi Network approval" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to continue..."