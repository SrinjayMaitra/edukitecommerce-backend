# Get Full Error Response from Login
$backendUrl = "https://edukitecommerce-backend-production.up.railway.app"
$loginBody = @{
    email = "admin@medusa.com"
    password = "test123"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "$backendUrl/auth/user/emailpass" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    $login | ConvertTo-Json
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    
    # Get full error response
    $response = $_.Exception.Response
    if ($response) {
        $statusCode = [int]$response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
        
        $stream = $response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        
        Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
        
        # Try to parse as JSON
        try {
            $jsonResponse = $responseBody | ConvertFrom-Json
            Write-Host "Parsed JSON:" -ForegroundColor Cyan
            $jsonResponse | ConvertTo-Json -Depth 5
        } catch {
            Write-Host "Not JSON, raw response shown above" -ForegroundColor Gray
        }
    }
}

