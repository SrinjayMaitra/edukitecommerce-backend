# ⚡ Fly.io Quick Start Guide

**Fastest way to deploy Medusa to Fly.io - 5 minutes!**

---

## 🚀 Quick Deploy (Copy-Paste Commands)

### Step 1: Install & Login
```powershell
# Install Fly CLI
iwr https://fly.io/install.ps1 -useb | iex

# Login
fly auth login
```

### Step 2: Create App with PostgreSQL & Redis
```powershell
cd medusa-starter-default
fly launch
```

**When prompted:**
- App name: `your-medusa-backend` (or press Enter)
- Region: `iad` (or closest to you)
- PostgreSQL: `y` ✅
- Redis: `y` ✅
- Deploy now: `n` ❌ (we'll set env vars first)

### Step 3: Get Database URLs

**Get PostgreSQL URL:**
1. Go to https://fly.io/dashboard
2. Click your PostgreSQL app
3. Copy `DATABASE_URL` from Secrets tab

**Get Redis URL:**
1. Go to https://fly.io/dashboard
2. Click your Redis app
3. Copy `REDIS_URL` from Secrets tab

### Step 4: Generate Secrets

```powershell
# JWT_SECRET
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "JWT_SECRET: $jwtSecret"

# COOKIE_SECRET
$cookieSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "COOKIE_SECRET: $cookieSecret"
```

**Save both secrets!**

### Step 5: Set Environment Variables

**Replace these values:**
- `your-app-name` → Your app name from Step 2
- `postgres-url` → PostgreSQL URL from Step 3
- `redis-url` → Redis URL from Step 3
- `jwt-secret` → JWT_SECRET from Step 4
- `cookie-secret` → COOKIE_SECRET from Step 4

```powershell
$appName = "your-app-name"
$flyUrl = "https://$appName.fly.dev"

# Database & Cache
fly secrets set DATABASE_URL="postgres-url" -a $appName
fly secrets set REDIS_URL="redis-url" -a $appName

# Security
fly secrets set JWT_SECRET="jwt-secret" -a $appName
fly secrets set COOKIE_SECRET="cookie-secret" -a $appName

# CORS (IMPORTANT: Include Fly.io URL!)
fly secrets set STORE_CORS="http://localhost:8000,http://localhost:3000" -a $appName
fly secrets set ADMIN_CORS="http://localhost:5173,http://localhost:9000,$flyUrl" -a $appName
fly secrets set AUTH_CORS="http://localhost:5173,http://localhost:9000,$flyUrl" -a $appName

# Admin User
fly secrets set ADMIN_EMAIL="admin@medusa.com" -a $appName
fly secrets set ADMIN_PASSWORD="test123" -a $appName

# Critical Settings
fly secrets set TRUST_PROXY="true" -a $appName
fly secrets set NODE_ENV="production" -a $appName
```

### Step 6: Update fly.toml

Edit `fly.toml` and replace `your-app-name` with your actual app name:
```toml
app = "your-app-name"
```

### Step 7: Deploy
```powershell
fly deploy -a $appName
```

### Step 8: Create Admin User
```powershell
fly ssh console -a $appName -C "npx medusa user --email admin@medusa.com --password test123"
```

### Step 9: Test Login
Open: `https://your-app-name.fly.dev/app`
- Email: `admin@medusa.com`
- Password: `test123`

---

## ✅ Done!

Your Medusa backend is live at: `https://your-app-name.fly.dev`

---

## 🆘 Troubleshooting

**401 Unauthorized?**
- Check: `fly secrets list -a your-app-name` → Verify `TRUST_PROXY=true`
- Check CORS includes your Fly.io URL

**Database connection failed?**
- Verify PostgreSQL app is running: `fly status -a your-postgres-app-name`
- Check DATABASE_URL format

**App won't start?**
- Check logs: `fly logs -a your-app-name`
- Verify all secrets are set: `fly secrets list -a your-app-name`

---

## 📚 Full Guide

For detailed instructions, see: [FLY_IO_COMPLETE_GUIDE.md](./FLY_IO_COMPLETE_GUIDE.md)

