# 🚂 Railway Deployment Guide - Complete Setup

This guide will help you deploy your Medusa backend to Railway with admin access configured automatically.

## ✅ Pre-Deployment Checklist

Before deploying, ensure:
- ✅ Your code is pushed to GitHub
- ✅ You have a Railway account (free tier available)
- ✅ You understand that Railway's `.railway.app` domain **works with cookies** (unlike Render's `.onrender.com`)

---

## Step 1: Create Railway Account & Project

1. **Go to** https://railway.app
2. **Sign up** with GitHub (recommended for easy repo access)
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository** (`ChildEcommerce` or your repo name)
6. **Select the `medusa-starter-default` folder** as the root directory

---

## Step 2: Add PostgreSQL Database

1. **In your Railway project**, click **"+ New"**
2. **Select "Database"** → **"Add PostgreSQL"**
3. Railway will automatically:
   - Create a PostgreSQL database
   - Add `DATABASE_URL` environment variable to your service
   - Link it to your backend service

**✅ No manual configuration needed!**

---

## Step 3: Add Redis (Optional but Recommended)

1. **In your Railway project**, click **"+ New"**
2. **Select "Database"** → **"Add Redis"**
3. Railway will automatically add `REDIS_URL` environment variable

**Note:** Redis is optional but recommended for production performance.

---

## Step 4: Configure Environment Variables

Go to your **backend service** → **Variables** tab and add these:

### Required Environment Variables

```env
# Database (auto-added by Railway when you add PostgreSQL)
DATABASE_URL=postgresql://...  # ✅ Auto-added by Railway

# Redis (auto-added by Railway when you add Redis)
REDIS_URL=redis://...  # ✅ Auto-added by Railway

# Security Secrets (GENERATE NEW ONES!)
JWT_SECRET=your-super-secret-jwt-key-change-this-min-32-chars
COOKIE_SECRET=your-super-secret-cookie-key-change-this-min-32-chars

# CORS Configuration
# Replace YOUR_RAILWAY_URL with your actual Railway URL after deployment
ADMIN_CORS=https://YOUR_RAILWAY_URL.railway.app,http://localhost:5173,http://localhost:9000
AUTH_CORS=https://YOUR_RAILWAY_URL.railway.app,http://localhost:5173,http://localhost:9000
STORE_CORS=https://YOUR_STORE_FRONTEND.vercel.app,http://localhost:8000

# Admin User Auto-Creation
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=your-secure-password-here-change-this

# ⭐ CRITICAL: Trust Proxy (Required for Railway)
TRUST_PROXY=true

# Optional: Admin Setup Secret (for /custom/create-first-admin endpoint)
ADMIN_SETUP_SECRET=your-secret-here
```

### How to Generate Secrets

**PowerShell:**
```powershell
# Generate JWT_SECRET (32+ characters)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Generate COOKIE_SECRET (32+ characters)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Or use an online generator:** https://randomkeygen.com/

---

## Step 5: Deploy & Get Your URL

1. **Railway will auto-deploy** when you connect the repo
2. **Wait for deployment** to complete (check Deployments tab)
3. **Get your Railway URL:**
   - Go to **Settings** → **Networking**
   - Copy your **Public Domain** (e.g., `your-app.railway.app`)

---

## Step 6: Update CORS URLs

After you get your Railway URL:

1. **Go back to Variables**
2. **Update these variables** with your actual Railway URL:

```env
ADMIN_CORS=https://your-app.railway.app,http://localhost:5173,http://localhost:9000
AUTH_CORS=https://your-app.railway.app,http://localhost:5173,http://localhost:9000
```

3. **Railway will auto-redeploy** with the new variables

---

## Step 7: Verify Admin User Creation

After deployment completes, check the logs:

1. **Go to** Deployments → **Latest deployment** → **View Logs**
2. **Look for these messages:**
   ```
   ✅ Admin user ready!
   📧 Email: admin@medusa.com
   🔑 Password: your-password
   ```

If you see these, **admin user was created automatically!** ✅

---

## Step 8: Test Admin Login

1. **Open** `https://your-app.railway.app/app`
2. **Login with:**
   - Email: `admin@medusa.com` (or your `ADMIN_EMAIL`)
   - Password: Your `ADMIN_PASSWORD` value
3. **Should work immediately!** ✅

---

## Step 9: Manual Admin Creation (If Needed)

If automatic creation didn't work, create admin manually:

**PowerShell:**
```powershell
$backendUrl = "https://your-app.railway.app"

# Create admin user
Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"your-password"}'
```

**Replace:**
- `your-app.railway.app` with your Railway URL
- `your-password` with your `ADMIN_PASSWORD` value

---

## 🎉 Success Checklist

After deployment, verify:

- ✅ Backend is running: `https://your-app.railway.app/health`
- ✅ Admin panel loads: `https://your-app.railway.app/app`
- ✅ Can login with `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- ✅ Cookies are set (check browser DevTools → Application → Cookies)
- ✅ No 401 errors in browser console

---

## 🔧 Troubleshooting

### Issue: "Invalid email or password"

**Solution:**
1. Check logs for admin creation messages
2. If not found, manually create admin (Step 9)
3. Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` match what you're using

### Issue: 401 Unauthorized after login

**Solution:**
1. Verify `TRUST_PROXY=true` is set
2. Verify `ADMIN_CORS` includes your Railway URL
3. Verify `AUTH_CORS` matches `ADMIN_CORS`
4. Clear browser cookies and try again

### Issue: Database migration errors

**Solution:**
1. Check that `DATABASE_URL` is set correctly
2. Railway auto-adds this, but verify in Variables
3. Check deployment logs for migration errors

### Issue: Build fails

**Solution:**
1. Check `nixpacks.toml` exists (it should)
2. Verify Node.js version (should be 20+)
3. Check build logs for specific errors

---

## 📋 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | Auto-added by Railway |
| `REDIS_URL` | ⚠️ Optional | Redis connection string | Auto-added by Railway |
| `JWT_SECRET` | ✅ Yes | Secret for JWT tokens | `your-secret-32-chars-min` |
| `COOKIE_SECRET` | ✅ Yes | Secret for cookies | `your-secret-32-chars-min` |
| `ADMIN_CORS` | ✅ Yes | Admin CORS origins | `https://your-app.railway.app,http://localhost:5173` |
| `AUTH_CORS` | ✅ Yes | Auth CORS origins | `https://your-app.railway.app,http://localhost:5173` |
| `STORE_CORS` | ✅ Yes | Store CORS origins | `https://store.vercel.app,http://localhost:8000` |
| `ADMIN_EMAIL` | ✅ Yes | Admin user email | `admin@medusa.com` |
| `ADMIN_PASSWORD` | ✅ Yes | Admin user password | `your-secure-password` |
| `TRUST_PROXY` | ✅ Yes | Trust proxy headers | `true` |
| `ADMIN_SETUP_SECRET` | ⚠️ Optional | Secret for admin creation endpoint | `your-secret` |

---

## 🚀 Quick Deploy Script

Save this as `deploy-railway.ps1`:

```powershell
# Railway Deployment Helper Script
param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$AdminPassword
)

Write-Host "=== Railway Deployment Test ===" -ForegroundColor Cyan

# Test backend health
Write-Host "`n1. Testing backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$RailwayUrl/health" -Method GET
    Write-Host "✅ Backend is healthy!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not responding: $_" -ForegroundColor Red
    exit 1
}

# Create admin user
Write-Host "`n2. Creating admin user..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$RailwayUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body (@{
        email = "admin@medusa.com"
        password = $AdminPassword
    } | ConvertTo-Json)
    
    Write-Host "✅ Admin user created!" -ForegroundColor Green
    Write-Host "   Email: $($result.email)" -ForegroundColor Gray
    Write-Host "   ID: $($result.id)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Admin creation: $_" -ForegroundColor Yellow
    Write-Host "   (This is OK if user already exists)" -ForegroundColor Gray
}

# Test login
Write-Host "`n3. Testing login..." -ForegroundColor Yellow
try {
    $login = Invoke-RestMethod -Uri "$RailwayUrl/admin/auth/token" -Method POST -Headers @{"Content-Type"="application/json"} -Body (@{
        email = "admin@medusa.com"
        password = $AdminPassword
    } | ConvertTo-Json) -SessionVariable session
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   Token received: $($login.access_token.Substring(0, 20))..." -ForegroundColor Gray
    
    # Test authenticated endpoint
    Write-Host "`n4. Testing authenticated endpoint..." -ForegroundColor Yellow
    $me = Invoke-RestMethod -Uri "$RailwayUrl/admin/users/me" -Method GET -WebSession $session
    Write-Host "✅ Authenticated request successful!" -ForegroundColor Green
    Write-Host "   User: $($me.user.email)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    Write-Host "   Check TRUST_PROXY and CORS settings" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=== ✅ All tests passed! ===" -ForegroundColor Green
Write-Host "`n🌐 Admin Panel: $RailwayUrl/app" -ForegroundColor Cyan
Write-Host "📧 Email: admin@medusa.com" -ForegroundColor Cyan
Write-Host "🔑 Password: $AdminPassword" -ForegroundColor Cyan
```

**Usage:**
```powershell
.\deploy-railway.ps1 -RailwayUrl "https://your-app.railway.app" -AdminPassword "your-password"
```

---

## 📚 Additional Resources

- **Railway Docs:** https://docs.railway.app
- **Medusa Docs:** https://docs.medusajs.com
- **Railway Discord:** https://discord.gg/railway

---

## ✅ Why Railway Works (vs Render)

| Feature | Railway | Render |
|---------|---------|--------|
| **Domain** | `.railway.app` | `.onrender.com` |
| **Public Suffix List** | ❌ Not on list | ✅ On list (blocks cookies) |
| **Cookies Work** | ✅ Yes | ❌ No (blocked by browser) |
| **Admin Login** | ✅ Works | ❌ Fails (cookie issue) |
| **Free Tier** | ✅ Yes | ✅ Yes |

**Railway's `.railway.app` domain is NOT on the Public Suffix List, so browsers allow cookies!** 🎉

---

**Ready to deploy? Follow the steps above and you'll have a working admin login in minutes!** 🚀

