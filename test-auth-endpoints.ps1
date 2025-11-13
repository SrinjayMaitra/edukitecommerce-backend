# Test Different Auth Endpoints
$backendUrl = "https://edukitecommerce-backend-production.up.railway.app"
$password = "Admin123456"
$loginBody = @{
    email = "admin@medusa.com"
    password = $password
} | ConvertTo-Json

Write-Host "=== Testing Auth Endpoints ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Testing /auth/user/emailpass..." -ForegroundColor Yellow
try {
    $result1 = Invoke-RestMethod -Uri "$backendUrl/auth/user/emailpass" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    Write-Host "   ✅ SUCCESS! /auth/user/emailpass works!" -ForegroundColor Green
    Write-Host "   Result: $($result1 | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Testing /admin/auth/token..." -ForegroundColor Yellow
try {
    $result2 = Invoke-RestMethod -Uri "$backendUrl/admin/auth/token" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    Write-Host "   ✅ SUCCESS! /admin/auth/token works!" -ForegroundColor Green
    Write-Host "   Result: $($result2 | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan

