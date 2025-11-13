# Railway Deployment Helper Script
# Usage: .\deploy-railway.ps1 -RailwayUrl "https://your-app.railway.app" -AdminPassword "your-password"

param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$AdminPassword
)

Write-Host "=== Railway Deployment Test ===" -ForegroundColor Cyan
Write-Host "Backend URL: $RailwayUrl" -ForegroundColor Gray
Write-Host ""

# Test backend health
Write-Host "1. Testing backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$RailwayUrl/health" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Backend is healthy!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend not responding: $_" -ForegroundColor Red
    Write-Host "   ⚠️  Make sure Railway deployment is complete" -ForegroundColor Yellow
    exit 1
}

# Create admin user
Write-Host "`n2. Creating/verifying admin user..." -ForegroundColor Yellow
try {
    $body = @{
        email = "admin@medusa.com"
        password = $AdminPassword
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "$RailwayUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -ErrorAction Stop
    
    Write-Host "   ✅ Admin user ready!" -ForegroundColor Green
    Write-Host "   📧 Email: $($result.email)" -ForegroundColor Gray
    Write-Host "   🆔 ID: $($result.id)" -ForegroundColor Gray
} catch {
    $errorMessage = $_.Exception.Message
    if ($errorMessage -like "*already exists*" -or $errorMessage -like "*409*") {
        Write-Host "   ⚠️  User already exists (this is OK)" -ForegroundColor Yellow
    } else {
        Write-Host "   ⚠️  Admin creation: $errorMessage" -ForegroundColor Yellow
        Write-Host "   (This might be OK if user already exists)" -ForegroundColor Gray
    }
}

# Test login
Write-Host "`n3. Testing login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@medusa.com"
        password = $AdminPassword
    } | ConvertTo-Json
    
    $login = Invoke-RestMethod -Uri "$RailwayUrl/admin/auth/token" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -SessionVariable session -ErrorAction Stop
    
    Write-Host "   ✅ Login successful!" -ForegroundColor Green
    Write-Host "   🔑 Token: $($login.access_token.Substring(0, 30))..." -ForegroundColor Gray
    
    # Test authenticated endpoint
    Write-Host "`n4. Testing authenticated endpoint..." -ForegroundColor Yellow
    $me = Invoke-RestMethod -Uri "$RailwayUrl/admin/users/me" -Method GET -WebSession $session -ErrorAction Stop
    Write-Host "   ✅ Authenticated request successful!" -ForegroundColor Green
    Write-Host "   👤 User: $($me.user.email)" -ForegroundColor Gray
    Write-Host "   🔐 Is Admin: $($me.user.is_admin)" -ForegroundColor Gray
    
} catch {
    Write-Host "   ❌ Login failed: $_" -ForegroundColor Red
    Write-Host "   ⚠️  Check:" -ForegroundColor Yellow
    Write-Host "      - TRUST_PROXY=true is set" -ForegroundColor Gray
    Write-Host "      - ADMIN_CORS includes Railway URL" -ForegroundColor Gray
    Write-Host "      - AUTH_CORS matches ADMIN_CORS" -ForegroundColor Gray
    Write-Host "      - Admin user exists (check Step 2)" -ForegroundColor Gray
    exit 1
}

Write-Host "`n=== ✅ All tests passed! ===" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Admin Panel: $RailwayUrl/app" -ForegroundColor Cyan
Write-Host "📧 Email: admin@medusa.com" -ForegroundColor Cyan
Write-Host "🔑 Password: $AdminPassword" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: Clear browser cookies if you had previous login attempts" -ForegroundColor Yellow

