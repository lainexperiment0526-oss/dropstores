# Setup Supabase Storage for DropStores
Write-Host "=== DropStores Storage Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Found .env file" -ForegroundColor Green

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"')
        [Environment]::SetEnvironmentVariable($key, $value, 'Process')
    }
}

$SUPABASE_URL = $env:VITE_SUPABASE_URL
$SUPABASE_ANON_KEY = $env:VITE_SUPABASE_ANON_KEY

if (-not $SUPABASE_URL -or -not $SUPABASE_ANON_KEY) {
    Write-Host "Error: Missing Supabase credentials" -ForegroundColor Red
    exit 1
}

Write-Host "Supabase URL: $SUPABASE_URL" -ForegroundColor Green
Write-Host ""

Write-Host "=== Storage Bucket Configuration ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Required bucket: store-assets" -ForegroundColor Yellow
Write-Host ""
Write-Host "To create the bucket manually:" -ForegroundColor White
Write-Host "1. Go to Supabase Dashboard > Storage > Buckets" -ForegroundColor Cyan
Write-Host "2. Click New bucket" -ForegroundColor Cyan
Write-Host "3. Name: store-assets" -ForegroundColor Cyan
Write-Host "4. Set as Public bucket: Yes" -ForegroundColor Cyan
Write-Host "5. Click Create bucket" -ForegroundColor Cyan
Write-Host ""

Write-Host "=== Testing Storage Connection ===" -ForegroundColor Cyan
Write-Host ""

try {
    $headers = @{
        'apikey' = $SUPABASE_ANON_KEY
        'Authorization' = "Bearer $SUPABASE_ANON_KEY"
    }
    
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/storage/v1/bucket" -Headers $headers -Method Get -ErrorAction Stop
    
    Write-Host "Successfully connected to Supabase Storage" -ForegroundColor Green
    Write-Host ""
    Write-Host "Existing buckets:" -ForegroundColor Yellow
    
    $bucketFound = $false
    foreach ($bucket in $response) {
        $isPublic = if ($bucket.public) { "(Public)" } else { "(Private)" }
        Write-Host "  - $($bucket.name) $isPublic" -ForegroundColor White
        if ($bucket.name -eq "store-assets") {
            $bucketFound = $true
        }
    }
    
    Write-Host ""
    
    if ($bucketFound) {
        Write-Host "The store-assets bucket exists!" -ForegroundColor Green
    } else {
        Write-Host "Warning: store-assets bucket not found" -ForegroundColor Yellow
        Write-Host "Please create it manually using the steps above" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Failed to connect to Supabase Storage" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your DropStores app is configured with:" -ForegroundColor White
Write-Host "  - Lovable Supabase Storage" -ForegroundColor Cyan
Write-Host "  - Bucket: store-assets" -ForegroundColor Cyan
Write-Host "  - Components ready for image uploads" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run npm run dev to start your application" -ForegroundColor Green
