# 🔧 Fix Steps for Render.com Deployment

Your backend: `https://edukitecommerce-backend.onrender.com`

## ✅ What's Already Set

From your environment variables, I can see:
- ✅ `TRUST_PROXY=true` (CRITICAL - this is set!)
- ✅ `ADMIN_PASSWORD` (set)
- ✅ `AUTH_CORS` (set)
- ✅ `DATABASE_URL` (set)
- ✅ `JWT_SECRET` (set)
- ✅ `COOKIE_SECRET` (set)
- ✅ `REDIS_URL` (set)
- ✅ `STORE_CORS` (set)

## ⚠️ Missing: ADMIN_CORS

I don't see `ADMIN_CORS` in your environment variables. This is **CRITICAL** for admin login!

**Add this to Render environment variables:**
```
ADMIN_CORS=https://edukitecommerce-backend.onrender.com,http://localhost:5173,http://localhost:9000
```

**Why this matters:**
- `ADMIN_CORS` tells Medusa which domains can access the admin API
- Without it, your admin panel can't make authenticated requests
- This causes 401 Unauthorized errors

---

## Step 1: Add ADMIN_CORS

1. **Go to Render Dashboard** → Your service → Environment
2. **Click "+ Add Environment Variable"**
3. **Key:** `ADMIN_CORS`
4. **Value:** `https://edukitecommerce-backend.onrender.com,http://localhost:5173,http://localhost:9000`
5. **Save** (Render will auto-redeploy)

---

## Step 2: Verify TRUST_PROXY is Active

Since you just added `TRUST_PROXY=true`, make sure Render has **redeployed** your service.

**Check:**
1. Go to Render Dashboard → Your service → Deployments
2. Make sure the latest deployment shows "Live" status
3. If it's still deploying, wait for it to complete

---

## Step 3: Create Admin User

Run this PowerShell command to create/verify the admin user:

```powershell
$backendUrl = "https://edukitecommerce-backend.onrender.com"

# Create admin user
Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"your-admin-password"}'
```

**Replace `your-admin-password`** with the value from your `ADMIN_PASSWORD` environment variable.

**Expected response:**
```json
{
  "success": true,
  "message": "Admin user created successfully with password!",
  "email": "admin@medusa.com",
  "password": "your-admin-password"
}
```

---

## Step 4: Clear Browser Data

1. **Open DevTools** (F12)
2. **Application tab → Storage → Clear site data**
3. **Or manually clear cookies** for `edukitecommerce-backend.onrender.com`
4. **Hard refresh** (Ctrl+Shift+R)

---

## Step 5: Try Login

1. Go to: `https://edukitecommerce-backend.onrender.com/app`
2. Email: `admin@medusa.com`
3. Password: (value from your `ADMIN_PASSWORD` env var)
4. Click "Continue with Email"

---

## Complete Environment Variables Checklist

Make sure you have ALL of these in Render:

```env
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Security
JWT_SECRET=your-secret
COOKIE_SECRET=your-secret

# CORS (ALL THREE ARE REQUIRED!)
STORE_CORS=https://your-store-frontend.vercel.app,http://localhost:8000
ADMIN_CORS=https://edukitecommerce-backend.onrender.com,http://localhost:5173,http://localhost:9000
AUTH_CORS=https://edukitecommerce-backend.onrender.com,http://localhost:5173,http://localhost:9000

# Admin User
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=your-secure-password

# Trust Proxy (CRITICAL for production)
TRUST_PROXY=true
```

---

## Quick Test Script

Run this to test everything:

```powershell
$backendUrl = "https://edukitecommerce-backend.onrender.com"

Write-Host "=== Testing Backend ===" -ForegroundColor Cyan

# Test 1: Health check
Write-Host "`n1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/health" -Method GET
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 2: Create admin user
Write-Host "`n2. Creating/updating admin user..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"password1234"}'
    Write-Host "✅ Admin user ready!" -ForegroundColor Green
    Write-Host "   Email: $($result.email)" -ForegroundColor Gray
    Write-Host "   Password: $($result.password)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create admin user" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

Write-Host "`n=== Tests Complete ===" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Make sure ADMIN_CORS is set in Render" -ForegroundColor White
Write-Host "2. Wait for Render to finish redeploying" -ForegroundColor White
Write-Host "3. Clear browser cookies" -ForegroundColor White
Write-Host "4. Try logging in at: $backendUrl/app" -ForegroundColor White
```

---

## If Still Not Working

Check these:

1. **Is ADMIN_CORS set?** (This is likely missing!)
2. **Did Render finish redeploying?** (Check Deployments tab)
3. **What's the response from `/custom/create-first-admin`?**
4. **Check Network tab in browser:**
   - What's the status of `POST /auth/user/emailpass`?
   - What's the status of `GET /admin/users/me`?

---

## Most Likely Issue

Based on your environment variables, **`ADMIN_CORS` is missing**. This is critical for admin authentication to work.

**Add it now:**
```
ADMIN_CORS=https://edukitecommerce-backend.onrender.com,http://localhost:5173,http://localhost:9000
```

After adding, Render will auto-redeploy. Wait for deployment to complete, then try logging in again.



