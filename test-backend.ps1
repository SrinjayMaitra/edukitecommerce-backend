# Test Backend and Create Admin User
$backendUrl = "https://edukitecommerce-backend.onrender.com"

Write-Host "=== Testing Backend ===" -ForegroundColor Cyan

# Test 1: Health check
Write-Host "`n1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 2: Create admin user
Write-Host "`n2. Creating/updating admin user..." -ForegroundColor Yellow
try {
    $body = @{
        email = "admin@medusa.com"
        password = "password1234"
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -TimeoutSec 30
    
    Write-Host "✅ Admin user ready!" -ForegroundColor Green
    Write-Host "   Email: $($result.email)" -ForegroundColor Gray
    Write-Host "   Password: $($result.password)" -ForegroundColor Gray
    Write-Host "   ID: $($result.id)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create admin user" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host "`n=== Tests Complete ===" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Make sure ADMIN_CORS is set in Render environment variables" -ForegroundColor White
Write-Host "2. Wait for Render to finish redeploying (if you just added ADMIN_CORS)" -ForegroundColor White
Write-Host "3. Clear browser cookies for edukitecommerce-backend.onrender.com" -ForegroundColor White
Write-Host "4. Try logging in at: $backendUrl/app" -ForegroundColor White
Write-Host "   Email: admin@medusa.com" -ForegroundColor Gray
Write-Host "   Password: password1234" -ForegroundColor Gray



