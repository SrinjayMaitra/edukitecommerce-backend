# Debug Admin Authentication Script
# This will check what's actually stored and fix it

param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$Password
)

Write-Host "=== Debugging Admin Authentication ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if user exists
Write-Host "1. Checking if admin user exists..." -ForegroundColor Yellow
try {
    # Try to get user info (this might fail if no auth, but we'll try)
    Write-Host "   Testing backend health..." -ForegroundColor Gray
    $health = Invoke-RestMethod -Uri "$RailwayUrl/health" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Backend is responding" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend not responding: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Recreate admin user with detailed logging
Write-Host "`n2. Recreating admin user (this will delete and recreate)..." -ForegroundColor Yellow

$body = @{
    email = "admin@medusa.com"
    password = $Password
} | ConvertTo-Json

Write-Host "   Request body: $body" -ForegroundColor Gray

try {
    $result = Invoke-RestMethod -Uri "$RailwayUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -ErrorAction Stop
    
    Write-Host "   ✅ Admin user created!" -ForegroundColor Green
    Write-Host "   Response: $($result | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
    Write-Host ""
    
    # Wait longer for database sync
    Write-Host "3. Waiting 15 seconds for database to fully sync..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Step 3: Try login multiple times with different approaches
    Write-Host "`n4. Testing login..." -ForegroundColor Yellow
    
    $loginBody = @{
        email = "admin@medusa.com"
        password = $Password
    } | ConvertTo-Json
    
    Write-Host "   Login body: $loginBody" -ForegroundColor Gray
    
    # Try login
    try {
        $login = Invoke-RestMethod -Uri "$RailwayUrl/admin/auth/token" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -SessionVariable session -ErrorAction Stop
        
        Write-Host "   ✅ Login successful!" -ForegroundColor Green
        Write-Host "   Token: $($login.access_token.Substring(0, 30))..." -ForegroundColor Gray
        
        # Test authenticated endpoint
        Write-Host "`n5. Testing authenticated endpoint..." -ForegroundColor Yellow
        $me = Invoke-RestMethod -Uri "$RailwayUrl/admin/users/me" -Method GET -WebSession $session -ErrorAction Stop
        Write-Host "   ✅ Authenticated request successful!" -ForegroundColor Green
        Write-Host "   User: $($me.user.email)" -ForegroundColor Gray
        Write-Host "   Is Admin: $($me.user.is_admin)" -ForegroundColor Gray
        
        Write-Host "`n=== ✅ SUCCESS! ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Admin Panel: $RailwayUrl/app" -ForegroundColor Cyan
        Write-Host "📧 Email: admin@medusa.com" -ForegroundColor Cyan
        Write-Host "🔑 Password: $Password" -ForegroundColor Cyan
        
    } catch {
        Write-Host "   ❌ Login failed!" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        
        # Try alternative auth endpoint
        Write-Host "`n   Trying alternative auth endpoint..." -ForegroundColor Yellow
        try {
            $altLogin = Invoke-RestMethod -Uri "$RailwayUrl/auth/user/emailpass" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -ErrorAction Stop
            Write-Host "   ✅ Alternative endpoint worked!" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Alternative endpoint also failed: $_" -ForegroundColor Red
        }
        
        Write-Host "`n🔍 Possible Issues:" -ForegroundColor Yellow
        Write-Host "   1. Password not stored correctly in database" -ForegroundColor White
        Write-Host "   2. Auth identity not created properly" -ForegroundColor White
        Write-Host "   3. Database sync delay (wait longer)" -ForegroundColor White
        Write-Host "   4. Check Railway logs for errors" -ForegroundColor White
        
        Write-Host "`n💡 Next Steps:" -ForegroundColor Yellow
        Write-Host "   1. Check Railway deployment logs" -ForegroundColor White
        Write-Host "   2. Look for 'Admin user ready!' or errors" -ForegroundColor White
        Write-Host "   3. Try recreating admin user again" -ForegroundColor White
        Write-Host "   4. Check if subscriber/middleware ran successfully" -ForegroundColor White
    }
    
} catch {
    Write-Host "   ❌ Failed to create admin user: $_" -ForegroundColor Red
    Write-Host "   Full error: $($_.Exception.Message)" -ForegroundColor Gray
}

