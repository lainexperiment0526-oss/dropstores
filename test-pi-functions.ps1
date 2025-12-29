# Test Pi Functions - Smoke Tests
# Tests pi-auth, pi-payment-approve, pi-payment-complete

Write-Host "Testing Pi Edge Functions" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

$projectRef = "kvqfnmdkxaclsnyuzkyp"
$baseUrl = "https://kvqfnmdkxaclsnyuzkyp.supabase.co/functions/v1"

Write-Host "Pi Functions Base URL: $baseUrl" -ForegroundColor Gray
Write-Host ""

# Test 1: pi-auth (expect 401 or 400 validation, not 500 config error)
Write-Host "Test 1: pi-auth" -ForegroundColor Yellow
Write-Host "===============" -ForegroundColor Yellow
$authBody = @{
    accessToken = "test_invalid_token"
    piUser = @{
        uid = "test_uid_123"
        username = "test_user"
    }
} | ConvertTo-Json

try {
    $authResponse = Invoke-WebRequest -Uri "$baseUrl/pi-auth" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $authBody `
        -ErrorAction SilentlyContinue

    Write-Host "Status: $($authResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Body: $($authResponse.Content)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    $errorBody = $_.Exception.Response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue

    if ($statusCode -ge 500) {
        Write-Host "Status: $statusCode (SERVER ERROR - Check secrets)" -ForegroundColor Red
    } elseif ($statusCode -ge 400) {
        Write-Host "Status: $statusCode (VALIDATION ERROR - Expected)" -ForegroundColor Green
    } else {
        Write-Host "Status: $statusCode" -ForegroundColor Yellow
    }

    if ($errorBody) {
        Write-Host "Error: $($errorBody.error)" -ForegroundColor Yellow
        if ($errorBody.details) {
            Write-Host "Details: $($errorBody.details)" -ForegroundColor Gray
        }
    } else {
        Write-Host "Response: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host ""

# Test 2: pi-payment-approve (expect 400 validation, not 500 config error)
Write-Host "Test 2: pi-payment-approve" -ForegroundColor Yellow
Write-Host "==========================" -ForegroundColor Yellow
$approveBody = @{
    paymentId = "test_payment_id"
} | ConvertTo-Json

try {
    $approveResponse = Invoke-WebRequest -Uri "$baseUrl/pi-payment-approve" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $approveBody `
        -ErrorAction SilentlyContinue

    Write-Host "Status: $($approveResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Body: $($approveResponse.Content)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    $errorBody = $_.Exception.Response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue

    if ($statusCode -ge 500) {
        Write-Host "Status: $statusCode (SERVER ERROR - Check secrets)" -ForegroundColor Red
    } elseif ($statusCode -ge 400) {
        Write-Host "Status: $statusCode (VALIDATION ERROR - Expected)" -ForegroundColor Green
    } else {
        Write-Host "Status: $statusCode" -ForegroundColor Yellow
    }

    if ($errorBody) {
        Write-Host "Error: $($errorBody.error)" -ForegroundColor Yellow
        if ($errorBody.details) {
            Write-Host "Details: $($errorBody.details)" -ForegroundColor Gray
        }
    } else {
        Write-Host "Response: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host ""

# Test 3: pi-payment-complete (expect 400 validation, not 500 config error)
Write-Host "Test 3: pi-payment-complete" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
$completeBody = @{
    paymentId = "test_payment_id"
    txid = "test_txid"
    planType = "basic"
    storeId = "test_store_uuid"
} | ConvertTo-Json

try {
    $completeResponse = Invoke-WebRequest -Uri "$baseUrl/pi-payment-complete" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $completeBody `
        -ErrorAction SilentlyContinue

    Write-Host "Status: $($completeResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Body: $($completeResponse.Content)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    $errorBody = $_.Exception.Response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue

    if ($statusCode -ge 500) {
        Write-Host "Status: $statusCode (SERVER ERROR - Check secrets)" -ForegroundColor Red
    } elseif ($statusCode -ge 400) {
        Write-Host "Status: $statusCode (VALIDATION ERROR - Expected)" -ForegroundColor Green
    } else {
        Write-Host "Status: $statusCode" -ForegroundColor Yellow
    }

    if ($errorBody) {
        Write-Host "Error: $($errorBody.error)" -ForegroundColor Yellow
        if ($errorBody.details) {
            Write-Host "Details: $($errorBody.details)" -ForegroundColor Gray
        }
    } else {
        Write-Host "Response: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Test Summary:" -ForegroundColor Cyan
Write-Host "  Expected: 4xx validation errors (not 5xx config errors)" -ForegroundColor Gray
Write-Host "  If all return 4xx: Secrets are loaded and functions work" -ForegroundColor Green
Write-Host "  If any return 5xx: Check Supabase secrets or function logs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Check logs:" -ForegroundColor Cyan
Write-Host "  npx supabase functions logs pi-auth --project-ref $projectRef --since 30m" -ForegroundColor Gray
Write-Host "  npx supabase functions logs pi-payment-approve --project-ref $projectRef --since 30m" -ForegroundColor Gray
Write-Host "  npx supabase functions logs pi-payment-complete --project-ref $projectRef --since 30m" -ForegroundColor Gray
Write-Host ""
