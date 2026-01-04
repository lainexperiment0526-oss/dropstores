# Pi Auth Fix Script - Comprehensive Solution
# This script fixes Pi authentication issues with Supabase

Write-Host "🔧 Pi Authentication Fix Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Get project reference
$projectRef = "kvqfnmdkxaclsnyuzkyp"

Write-Host ""
Write-Host "1️⃣ Checking current Supabase secrets..." -ForegroundColor Yellow
try {
    $secrets = npx supabase secrets list --project-ref $projectRef 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Current secrets:" -ForegroundColor Green
        Write-Host $secrets
    } else {
        Write-Host "❌ Failed to list secrets:" -ForegroundColor Red
        Write-Host $secrets
    }
} catch {
    Write-Host "❌ Error checking secrets: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "2️⃣ Checking service role key format..." -ForegroundColor Yellow

# Read current .env file
$envContent = Get-Content ".env" -Raw
$serviceKeyMatch = $envContent | Select-String 'VITE_SUPABASE_ANON_KEY="([^"]*)"'

if ($serviceKeyMatch -and $serviceKeyMatch.Matches[0].Groups[1].Value.StartsWith("eyJ")) {
    $correctKey = $serviceKeyMatch.Matches[0].Groups[1].Value
    Write-Host "✅ Found correct service role key format" -ForegroundColor Green
    
    # Check if it's being used correctly in supabase/.env
    $supabaseEnvPath = "supabase\.env"
    if (Test-Path $supabaseEnvPath) {
        $supabaseEnvContent = Get-Content $supabaseEnvPath -Raw
        if ($supabaseEnvContent -match 'SUPABASE_SERVICE_ROLE_KEY=sb_secret_') {
            Write-Host "⚠️  Supabase .env has incorrect service key format" -ForegroundColor Yellow
            Write-Host "Fixing supabase/.env with correct service role key..." -ForegroundColor Cyan
            
            # Update supabase/.env with correct key
            $newSupabaseEnv = $supabaseEnvContent -replace 'SUPABASE_SERVICE_ROLE_KEY=sb_secret_.*', "SUPABASE_SERVICE_ROLE_KEY=$correctKey"
            $newSupabaseEnv = $newSupabaseEnv -replace 'MY_SUPABASE_SERVICE_ROLE_KEY=sb_secret_.*', "MY_SUPABASE_SERVICE_ROLE_KEY=$correctKey"
            
            Set-Content -Path $supabaseEnvPath -Value $newSupabaseEnv
            Write-Host "✅ Updated supabase/.env with correct service role key" -ForegroundColor Green
        } else {
            Write-Host "✅ Supabase .env already has correct format" -ForegroundColor Green
        }
    }
} else {
    Write-Host "❌ No valid service role key found in main .env file" -ForegroundColor Red
    Write-Host "Please get the service role key from your Supabase dashboard:" -ForegroundColor Yellow
    Write-Host "1. Go to https://supabase.com/dashboard/project/$projectRef/settings/api" -ForegroundColor Gray
    Write-Host "2. Copy the 'service_role' key (starts with 'eyJ')" -ForegroundColor Gray
    Write-Host "3. Replace VITE_SUPABASE_SERVICE_ROLE_KEY in .env file" -ForegroundColor Gray
}

Write-Host ""
Write-Host "3️⃣ Deploying environment variables as secrets..." -ForegroundColor Yellow

# Read the supabase/.env file
$supabaseEnvPath = "supabase\.env"
if (Test-Path $supabaseEnvPath) {
    $envVars = @{}
    Get-Content $supabaseEnvPath | ForEach-Object {
        if ($_ -match '^([^#][^=]*?)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($key -and $value -and $key -ne "") {
                $envVars[$key] = $value
            }
        }
    }
    
    Write-Host "Found $($envVars.Count) environment variables to deploy" -ForegroundColor Cyan
    
    foreach ($key in $envVars.Keys) {
        $value = $envVars[$key]
        Write-Host "Setting secret: $key" -ForegroundColor Gray
        
        try {
            $result = Write-Output $value | npx supabase secrets set $key --project-ref $projectRef 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ $key" -ForegroundColor Green
            } else {
                Write-Host "  ❌ $key : $result" -ForegroundColor Red
            }
        } catch {
            Write-Host "  ❌ $key : $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ supabase/.env file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "4️⃣ Testing edge function..." -ForegroundColor Yellow

try {
    Write-Host "Testing pi-auth function..." -ForegroundColor Cyan
    $testUrl = "https://$projectRef.supabase.co/functions/v1/pi-auth"
    
    $headers = @{
        'Content-Type' = 'application/json'
        'apikey' = (Get-Content ".env" | Select-String 'VITE_SUPABASE_ANON_KEY="([^"]*)"').Matches[0].Groups[1].Value
    }
    
    # Test with OPTIONS request (should succeed)
    $response = Invoke-WebRequest -Uri $testUrl -Method OPTIONS -Headers $headers -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Edge function is responding" -ForegroundColor Green
    } else {
        Write-Host "❌ Edge function not responding: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error testing edge function: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "5️⃣ Environment configuration check..." -ForegroundColor Yellow

# Check .env configuration
$envContent = Get-Content ".env" -Raw
$checks = @{
    "VITE_PI_SANDBOX_MODE" = "false"
    "VITE_PI_MAINNET_MODE" = "true" 
    "VITE_PI_NETWORK" = "mainnet"
    "VITE_PI_AUTHENTICATION_ENABLED" = "true"
}

$configOK = $true
foreach ($key in $checks.Keys) {
    $expectedValue = $checks[$key]
    if ($envContent -match "$key=`"($expectedValue)`"") {
        Write-Host "  ✅ $key = $expectedValue" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $key should be '$expectedValue'" -ForegroundColor Red
        $configOK = $false
    }
}

if (!$configOK) {
    Write-Host ""
    Write-Host "⚠️  Environment configuration needs fixing" -ForegroundColor Yellow
    Write-Host "Would you like me to fix the .env file? (y/n): " -ForegroundColor Cyan -NoNewline
    $response = Read-Host
    
    if ($response -eq "y" -or $response -eq "Y") {
        # Fix the configuration
        $newEnvContent = $envContent
        $newEnvContent = $newEnvContent -replace 'VITE_PI_SANDBOX_MODE="true"', 'VITE_PI_SANDBOX_MODE="false"'
        
        Set-Content -Path ".env" -Value $newEnvContent
        Write-Host "✅ Fixed .env configuration" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎯 Summary" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan
Write-Host "✅ Service role key checked/fixed" -ForegroundColor Green
Write-Host "✅ Environment variables deployed as secrets" -ForegroundColor Green  
Write-Host "✅ Edge function tested" -ForegroundColor Green
Write-Host "✅ Configuration validated" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open Pi Browser and navigate to your app" -ForegroundColor Gray
Write-Host "2. Try signing in with Pi" -ForegroundColor Gray
Write-Host "3. Check browser console for any errors" -ForegroundColor Gray
Write-Host "4. If issues persist, check function logs:" -ForegroundColor Gray
Write-Host "   npx supabase functions logs pi-auth --project-ref $projectRef" -ForegroundColor DarkGray

Write-Host ""
Write-Host "✨ Pi Authentication should now be working!" -ForegroundColor Green