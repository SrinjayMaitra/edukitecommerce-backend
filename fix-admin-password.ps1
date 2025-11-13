# Fix Admin Password Script
# This will recreate the admin user with the correct password

param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$Password
)

Write-Host "=== Fixing Admin Password ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Delete and recreate admin user
Write-Host "1. Recreating admin user with password..." -ForegroundColor Yellow

$body = @{
    email = "admin@medusa.com"
    password = $Password
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$RailwayUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -ErrorAction Stop
    
    Write-Host "   ✅ Admin user recreated!" -ForegroundColor Green
    Write-Host "   📧 Email: $($result.email)" -ForegroundColor Gray
    Write-Host "   🆔 ID: $($result.id)" -ForegroundColor Gray
    Write-Host ""
    
    # Wait a bit for database to sync
    Write-Host "2. Waiting 5 seconds for database to sync..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Step 2: Test login
    Write-Host "3. Testing login..." -ForegroundColor Yellow
    
    $loginBody = @{
        email = "admin@medusa.com"
        password = $Password
    } | ConvertTo-Json
    
    $login = Invoke-RestMethod -Uri "$RailwayUrl/admin/auth/token" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -SessionVariable session -ErrorAction Stop
    
    Write-Host "   ✅ Login successful!" -ForegroundColor Green
    Write-Host "   🔑 Token received" -ForegroundColor Gray
    Write-Host ""
    
    # Step 3: Test authenticated endpoint
    Write-Host "4. Testing authenticated endpoint..." -ForegroundColor Yellow
    $me = Invoke-RestMethod -Uri "$RailwayUrl/admin/users/me" -Method GET -WebSession $session -ErrorAction Stop
    Write-Host "   ✅ Authenticated request successful!" -ForegroundColor Green
    Write-Host "   👤 User: $($me.user.email)" -ForegroundColor Gray
    Write-Host "   🔐 Is Admin: $($me.user.is_admin)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "=== ✅ Password Fixed! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Admin Panel: $RailwayUrl/app" -ForegroundColor Cyan
    Write-Host "📧 Email: admin@medusa.com" -ForegroundColor Cyan
    Write-Host "🔑 Password: $Password" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Clear browser cookies for Railway domain" -ForegroundColor White
    Write-Host "   2. Go to: $RailwayUrl/app" -ForegroundColor White
    Write-Host "   3. Login with the credentials above" -ForegroundColor White
    
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   - Check Railway logs for errors" -ForegroundColor White
    Write-Host "   - Verify password doesn't have special characters that need escaping" -ForegroundColor White
    Write-Host "   - Try a simpler password (no @ symbol)" -ForegroundColor White
}

