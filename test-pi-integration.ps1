# Pi Integration Test Script
# Run this to verify all endpoints are accessible

Write-Host "🧪 Testing Pi Integration Endpoints" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$projectRef = "kvqfnmdkxaclsnyuzkyp"
$baseUrl = "https://$projectRef.functions.supabase.co"

# Test functions
$functions = @(
    @{ name = "pi-auth"; method = "OPTIONS" },
    @{ name = "pi-payment-approve"; method = "OPTIONS" },
    @{ name = "pi-payment-complete"; method = "OPTIONS" },
    @{ name = "verify-pi-transaction"; method = "OPTIONS" }
)

$successCount = 0
$failCount = 0

foreach ($func in $functions) {
    $url = "$baseUrl/$($func.name)"
    Write-Host "Testing $($func.name)..." -ForegroundColor Yellow -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method $func.method -UseBasicParsing -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ OK" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " ⚠️ Status: $($response.StatusCode)" -ForegroundColor Yellow
            $successCount++
        }
    } catch {
        Write-Host " ❌ Failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "📊 Test Results" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "✅ Passed: $successCount/$($functions.Count)" -ForegroundColor Green
Write-Host "❌ Failed: $failCount/$($functions.Count)" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($successCount -eq $functions.Count) {
    Write-Host "🎉 All endpoints are accessible!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open your app in Pi Browser" -ForegroundColor Gray
    Write-Host "2. Test Pi authentication (Sign in with Pi)" -ForegroundColor Gray
    Write-Host "3. Create a test order with Pi payment" -ForegroundColor Gray
    Write-Host "4. Check logs: npx supabase functions logs pi-payment-complete" -ForegroundColor Gray
} else {
    Write-Host 'Some endpoints failed. Check the errors above.' -ForegroundColor Yellow
    Write-Host ""
    Write-Host 'Troubleshooting:' -ForegroundColor Yellow
    Write-Host '1. Verify functions are deployed: npx supabase functions list' -ForegroundColor Gray
    Write-Host '2. Check secrets: Dashboard -> Functions -> Secrets' -ForegroundColor Gray
    Write-Host '3. View logs: npx supabase functions logs [function-name]' -ForegroundColor Gray
}

Write-Host ""
