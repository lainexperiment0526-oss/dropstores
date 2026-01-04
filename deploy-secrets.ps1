# Deploy Supabase Secrets Script
# This script deploys environment variables as Supabase secrets

Write-Host "🚀 Deploying Supabase Secrets for Edge Functions" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$projectRef = "kvqfnmdkxaclsnyuzkyp"

# First, try to login to Supabase if not already logged in
Write-Host ""
Write-Host "1️⃣ Checking Supabase login status..." -ForegroundColor Yellow

try {
    $loginCheck = npx supabase projects list 2>&1
    if ($LASTEXITCODE -ne 0 -or $loginCheck -match "not authenticated") {
        Write-Host "❌ Not logged in to Supabase. Please login first:" -ForegroundColor Red
        Write-Host "   npx supabase login" -ForegroundColor Gray
        Write-Host ""
        Write-Host "After logging in, run this script again." -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "✅ Already logged in to Supabase" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error checking login status: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2️⃣ Deploying secrets from supabase/.env..." -ForegroundColor Yellow

# Define the secrets to deploy
$secrets = @{
    "PI_API_KEY" = "rh1q6tdt5vedxokn5kpgzdexijslclqucsreranlshxwd7sib25rri7nmdobqwd0"
    "SUPABASE_URL" = "https://kvqfnmdkxaclsnyuzkyp.supabase.co"
    "SUPABASE_SERVICE_ROLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cWZubWRreGFjbHNueXV6a3lwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE5MjU0NCwiZXhwIjoyMDgxNzY4NTQ0fQ.z6wgqg7RJMaTYX2AZUJdFUeqxF7o9n5MQO3vCfTjJ8"
    "MY_SUPABASE_URL" = "https://kvqfnmdkxaclsnyuzkyp.supabase.co"
    "MY_SUPABASE_SERVICE_ROLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cWZubWRreGFjbHNueXV6a3lwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE5MjU0NCwiZXhwIjoyMDgxNzY4NTQ0fQ.z6wgqg7RJMaTYX2AZUJdFUeqxF7o9n5MQO3vCfTjJ8"
    "VALIDATION_KEY" = "a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1"
    "DOMAIN_VALIDATION_KEY" = "a0111d77037c4bf013d6f4e3fd6cdc17357b996c7f4340887a642c65603ad6d50a392a3c9e57e3aa80b85934e1e92d87750d229229323dde96dd4761ddc555e1"
}

$successCount = 0
$totalCount = $secrets.Count

foreach ($secretName in $secrets.Keys) {
    $secretValue = $secrets[$secretName]
    Write-Host "Setting secret: $secretName" -ForegroundColor Gray
    
    try {
        # Use Write-Output to pipe the value to avoid command line length issues
        $result = Write-Output $secretValue | npx supabase secrets set $secretName --project-ref $projectRef 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $secretName" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ❌ $secretName : $result" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ $secretName : $_" -ForegroundColor Red
    }
    
    # Small delay to avoid rate limiting
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "3️⃣ Deployment Summary" -ForegroundColor Yellow
Write-Host "Successfully deployed: $successCount/$totalCount secrets" -ForegroundColor Cyan

if ($successCount -eq $totalCount) {
    Write-Host "✅ All secrets deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some secrets failed to deploy" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "4️⃣ Verifying secrets..." -ForegroundColor Yellow

try {
    $secretsList = npx supabase secrets list --project-ref $projectRef 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Current deployed secrets:" -ForegroundColor Green
        Write-Host $secretsList
    } else {
        Write-Host "❌ Failed to list secrets: $secretsList" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error listing secrets: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "5️⃣ Testing Edge Function..." -ForegroundColor Yellow

try {
    Write-Host "Testing pi-auth function availability..." -ForegroundColor Cyan
    $testUrl = "https://$projectRef.supabase.co/functions/v1/pi-auth"
    
    # Get anon key from .env
    $envContent = Get-Content ".env" -Raw
    $anonKeyMatch = $envContent | Select-String 'VITE_SUPABASE_ANON_KEY="([^"]*)"'
    
    if ($anonKeyMatch) {
        $anonKey = $anonKeyMatch.Matches[0].Groups[1].Value
        
        # Test with OPTIONS request
        $headers = @{
            'Content-Type' = 'application/json'
            'apikey' = $anonKey
        }
        
        $response = Invoke-WebRequest -Uri $testUrl -Method OPTIONS -Headers $headers -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Edge function is responding correctly" -ForegroundColor Green
        } else {
            Write-Host "❌ Edge function returned status: $($response.StatusCode)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Could not find anon key in .env file" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 200) {
        Write-Host "✅ Edge function is responding (caught exception but status was 200)" -ForegroundColor Green
    } else {
        Write-Host "❌ Error testing edge function: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open Pi Browser" -ForegroundColor Gray
Write-Host "2. Navigate to your app" -ForegroundColor Gray
Write-Host "3. Try Pi authentication" -ForegroundColor Gray
Write-Host "4. Check logs if issues persist:" -ForegroundColor Gray
Write-Host "   npx supabase functions logs pi-auth --project-ref $projectRef" -ForegroundColor DarkGray

Write-Host ""
Write-Host "✨ Pi Authentication setup complete!" -ForegroundColor Green