# Comprehensive Login Flow Test
$backendUrl = "https://edukitecommerce-backend.onrender.com"

Write-Host "=== Comprehensive Login Diagnostic ===" -ForegroundColor Cyan

# Test 1: Verify admin user exists
Write-Host "`n1. Checking if admin user exists..." -ForegroundColor Yellow
try {
    $userCheck = Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"password1234"}' -TimeoutSec 30
    Write-Host "✅ Admin user exists" -ForegroundColor Green
    Write-Host "   Email: $($userCheck.email)" -ForegroundColor Gray
    Write-Host "   User ID: $($userCheck.id)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to verify/create admin user" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 2: Test login endpoint
Write-Host "`n2. Testing login endpoint..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@medusa.com"
        password = "password1234"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest -Uri "$backendUrl/admin/auth/token" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -TimeoutSec 30 -SessionVariable session
    
    Write-Host "✅ Login request succeeded" -ForegroundColor Green
    Write-Host "   Status: $($loginResponse.StatusCode)" -ForegroundColor Gray
    
    # Check for cookies in response
    $cookies = $loginResponse.Headers['Set-Cookie']
    if ($cookies) {
        Write-Host "   Cookies set: $($cookies.Count) cookie(s)" -ForegroundColor Green
        foreach ($cookie in $cookies) {
            Write-Host "     - $cookie" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  No cookies in response!" -ForegroundColor Yellow
    }
    
    # Try to parse response
    try {
        $loginData = $loginResponse.Content | ConvertFrom-Json
        Write-Host "   Response: $($loginData | ConvertTo-Json -Compress)" -ForegroundColor Gray
    } catch {
        Write-Host "   Response body: $($loginResponse.Content.Substring(0, [Math]::Min(200, $loginResponse.Content.Length)))" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Login failed" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get response body
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    } catch {
        Write-Host "   Could not read response body" -ForegroundColor Yellow
    }
}

# Test 3: Test /admin/users/me with session
Write-Host "`n3. Testing /admin/users/me endpoint..." -ForegroundColor Yellow
try {
    $meResponse = Invoke-WebRequest -Uri "$backendUrl/admin/users/me" -Method GET -WebSession $session -TimeoutSec 30
    Write-Host "✅ /admin/users/me succeeded" -ForegroundColor Green
    Write-Host "   Status: $($meResponse.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ /admin/users/me failed" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Check CORS headers
Write-Host "`n4. Checking CORS configuration..." -ForegroundColor Yellow
try {
    $optionsResponse = Invoke-WebRequest -Uri "$backendUrl/admin/auth/token" -Method OPTIONS -TimeoutSec 10
    Write-Host "✅ OPTIONS request succeeded" -ForegroundColor Green
    
    $corsHeaders = @(
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Credentials"
    )
    
    foreach ($header in $corsHeaders) {
        if ($optionsResponse.Headers[$header]) {
            Write-Host "   $header : $($optionsResponse.Headers[$header])" -ForegroundColor Gray
        } else {
            Write-Host "   ⚠️  $header : Not set" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️  Could not check CORS headers" -ForegroundColor Yellow
}

# Test 5: Check environment variables via health endpoint
Write-Host "`n5. Checking backend configuration..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend is healthy" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Health check failed" -ForegroundColor Yellow
}

Write-Host "`n=== Diagnostic Complete ===" -ForegroundColor Cyan
Write-Host "`nKey things to check:" -ForegroundColor Yellow
Write-Host "1. If login returns 200 but no cookies → TRUST_PROXY or cookie settings issue" -ForegroundColor White
Write-Host "2. If login returns 401 → Password might be wrong or user doesn't exist" -ForegroundColor White
Write-Host "3. If /admin/users/me returns 401 → Cookies not being sent/stored" -ForegroundColor White
Write-Host "4. Check browser Network tab for actual request/response details" -ForegroundColor White



