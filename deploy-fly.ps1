# Fly.io Deployment Script for Medusa
# This script automates the deployment process

param(
    [Parameter(Mandatory=$true)]
    [string]$AppName,
    
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$RedisUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$JwtSecret,
    
    [Parameter(Mandatory=$true)]
    [string]$CookieSecret,
    
    [Parameter(Mandatory=$false)]
    [string]$AdminEmail = "admin@medusa.com",
    
    [Parameter(Mandatory=$false)]
    [string]$AdminPassword = "test123",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "iad"
)

Write-Host "🚀 Starting Fly.io Deployment for Medusa" -ForegroundColor Green
Write-Host ""

# Check if fly CLI is installed
Write-Host "📋 Checking Fly CLI installation..." -ForegroundColor Yellow
try {
    $flyVersion = fly version 2>&1
    Write-Host "✅ Fly CLI found: $flyVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Fly CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   iwr https://fly.io/install.ps1 -useb | iex" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
Write-Host "📋 Checking Fly.io authentication..." -ForegroundColor Yellow
try {
    $whoami = fly auth whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Not logged in. Please run: fly auth login" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in. Please run: fly auth login" -ForegroundColor Red
    exit 1
}

# Build CORS URLs
$flyUrl = "https://$AppName.fly.dev"
$storeCors = "http://localhost:8000,http://localhost:3000"
$adminCors = "http://localhost:5173,http://localhost:9000,$flyUrl"
$authCors = "http://localhost:5173,http://localhost:9000,$flyUrl"

Write-Host ""
Write-Host "📝 Configuration:" -ForegroundColor Cyan
Write-Host "   App Name: $AppName"
Write-Host "   Region: $Region"
Write-Host "   Fly URL: $flyUrl"
Write-Host ""

# Set environment variables
Write-Host "🔐 Setting environment variables..." -ForegroundColor Yellow

$secrets = @{
    "DATABASE_URL" = $DatabaseUrl
    "REDIS_URL" = $RedisUrl
    "JWT_SECRET" = $JwtSecret
    "COOKIE_SECRET" = $CookieSecret
    "STORE_CORS" = $storeCors
    "ADMIN_CORS" = $adminCors
    "AUTH_CORS" = $authCors
    "ADMIN_EMAIL" = $AdminEmail
    "ADMIN_PASSWORD" = $AdminPassword
    "TRUST_PROXY" = "true"
    "NODE_ENV" = "production"
}

foreach ($key in $secrets.Keys) {
    Write-Host "   Setting $key..." -ForegroundColor Gray
    $value = $secrets[$key]
    fly secrets set "$key=$value" -a $AppName 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $key set" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed to set $key" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🚀 Deploying application..." -ForegroundColor Yellow
fly deploy -a $AppName

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Create admin user:" -ForegroundColor White
    Write-Host "      fly ssh console -a $AppName -C `"npx medusa user --email $AdminEmail --password $AdminPassword`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Open your app:" -ForegroundColor White
    Write-Host "      $flyUrl" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Admin panel:" -ForegroundColor White
    Write-Host "      $flyUrl/app" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check the errors above." -ForegroundColor Red
    Write-Host "   View logs: fly logs -a $AppName" -ForegroundColor Yellow
    exit 1
}

