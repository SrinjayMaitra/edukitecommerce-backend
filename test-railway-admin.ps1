# Railway Admin User Test & Fix Script
# Usage: .\test-railway-admin.ps1 -RailwayUrl "https://your-app.railway.app" -Password "your-password"

param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$Password
)

Write-Host "=== Railway Admin User Test & Fix ===" -ForegroundColor Cyan
Write-Host "Backend URL: $RailwayUrl" -ForegroundColor Gray
Write-Host ""

# Step 1: Test backend health
Write-Host "1. Testing backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$RailwayUrl/health" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Backend is healthy!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend not responding: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Create/Recreate admin user
Write-Host "`n2. Creating/Recreating admin user..." -ForegroundColor Yellow
try {
    $body = @{
        email = "admin@medusa.com"
        password = $Password
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "$RailwayUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -ErrorAction Stop
    
    Write-Host "   ✅ Admin user created/recreated!" -ForegroundColor Green
    Write-Host "   📧 Email: $($result.email)" -ForegroundColor Gray
    Write-Host "   🆔 ID: $($result.id)" -ForegroundColor Gray
} catch {
    $errorMessage = $_.Exception.Message
    if ($errorMessage -like "*already exists*" -or $errorMessage -like "*409*") {
        Write-Host "   ⚠️  User already exists, trying to recreate..." -ForegroundColor Yellow
        
        # Try to delete and recreate
        try {
            # The endpoint should handle deletion, but let's try again
            Start-Sleep -Seconds 2
            $result = Invoke-RestMethod -Uri "$RailwayUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -ErrorAction Stop
            Write-Host "   ✅ Admin user recreated!" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Could not recreate: $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ Error: $errorMessage" -ForegroundColor Red
        Write-Host "   Full error: $_" -ForegroundColor Gray
    }
}

# Step 3: Test login
Write-Host "`n3. Testing login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@medusa.com"
        password = $Password
    } | ConvertTo-Json
    
    $login = Invoke-RestMethod -Uri "$RailwayUrl/admin/auth/token" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -SessionVariable session -ErrorAction Stop
    
    Write-Host "   ✅ Login successful!" -ForegroundColor Green
    Write-Host "   🔑 Token received: $($login.access_token.Substring(0, 30))..." -ForegroundColor Gray
    
    # Step 4: Test authenticated endpoint
    Write-Host "`n4. Testing authenticated endpoint..." -ForegroundColor Yellow
    $me = Invoke-RestMethod -Uri "$RailwayUrl/admin/users/me" -Method GET -WebSession $session -ErrorAction Stop
    Write-Host "   ✅ Authenticated request successful!" -ForegroundColor Green
    Write-Host "   👤 User: $($me.user.email)" -ForegroundColor Gray
    Write-Host "   🔐 Is Admin: $($me.user.is_admin)" -ForegroundColor Gray
    
    Write-Host "`n=== ✅ All tests passed! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Admin Panel: $RailwayUrl/app" -ForegroundColor Cyan
    Write-Host "📧 Email: admin@medusa.com" -ForegroundColor Cyan
    Write-Host "🔑 Password: $Password" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Tip: Clear browser cookies and try logging in again" -ForegroundColor Yellow
    
} catch {
    Write-Host "   ❌ Login failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "   1. Check Railway deployment logs for admin creation errors" -ForegroundColor White
    Write-Host "   2. Verify ADMIN_EMAIL and ADMIN_PASSWORD match what you are using" -ForegroundColor White
    Write-Host "   3. Wait 30 seconds and try again (admin creation might be in progress)" -ForegroundColor White
    Write-Host "   4. Check that subscriber/middleware ran successfully" -ForegroundColor White
    Write-Host ""
    Write-Host "   Error details:" -ForegroundColor Gray
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
    
    exit 1
}

