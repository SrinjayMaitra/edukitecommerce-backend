# ✅ Railway Setup Checklist - Get Back on Track

**Quick checklist to ensure your Railway deployment is configured correctly.**

---

## 🔍 Step 1: Verify Your Railway Project

1. **Go to:** https://railway.app
2. **Check your project** is still active
3. **Get your Railway URL:**
   - Click on your service → **Settings** → **Networking**
   - Copy your public URL (e.g., `https://edukitecommerce-backend-production.up.railway.app`)

---

## 🔐 Step 2: Verify Environment Variables

Go to **Railway → Your Service → Variables** and verify these are set:

### ✅ Required Variables:

```env
# Database (auto-added by Railway when you add PostgreSQL)
DATABASE_URL=postgresql://... ✅

# Redis (if you added Redis)
REDIS_URL=redis://... ✅

# Security Secrets
JWT_SECRET=your-64-char-secret ✅
COOKIE_SECRET=your-64-char-secret ✅

# CORS - CRITICAL: Must include your Railway URL!
ADMIN_CORS=https://YOUR_RAILWAY_URL.railway.app,http://localhost:5173 ✅
AUTH_CORS=https://YOUR_RAILWAY_URL.railway.app,http://localhost:5173 ✅
STORE_CORS=http://localhost:8000,http://localhost:3000 ✅

# Admin User
ADMIN_EMAIL=admin@medusa.com ✅
ADMIN_PASSWORD=test123 ✅

# CRITICAL: Trust Proxy (fixes 401 errors)
TRUST_PROXY=true ✅

# Node Environment
NODE_ENV=production ✅
```

**⚠️ IMPORTANT:** Replace `YOUR_RAILWAY_URL` with your actual Railway URL!

---

## 🚀 Step 3: Verify Latest Code is Deployed

The latest code includes:
- ✅ Custom `/auth/user/emailpass` endpoint that sets cookies
- ✅ Middleware to ensure admin user creation
- ✅ Proper cookie configuration

**Check if deployed:**
1. Go to **Railway → Deployments**
2. Check the **latest deployment** has these commits:
   - "Override /auth/user/emailpass endpoint to set cookie"
   - "Fix syntax and add jsonwebtoken dependency"

**If not deployed:**
```powershell
cd medusa-starter-default
git pull  # Make sure you have latest code
# Railway should auto-deploy, or trigger manual deploy
```

---

## 🧪 Step 4: Test Admin User Creation

**Run this PowerShell command** (replace with your Railway URL):

```powershell
$railwayUrl = "https://edukitecommerce-backend-production.up.railway.app"
$body = @{
    email = "admin@medusa.com"
    password = "test123"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$railwayUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
    Write-Host "✅ Admin user created:" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Yellow
}
```

**Expected response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "email": "admin@medusa.com"
}
```

---

## 🍪 Step 5: Test Login & Cookie

**Test the login endpoint:**

```powershell
$railwayUrl = "https://edukitecommerce-backend-production.up.railway.app"
$body = @{
    email = "admin@medusa.com"
    password = "test123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$railwayUrl/auth/user/emailpass" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -SessionVariable session
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    
    # Check for Set-Cookie header
    $setCookie = $response.Headers['Set-Cookie']
    if ($setCookie) {
        Write-Host "✅ Cookie header found: $setCookie" -ForegroundColor Green
    } else {
        Write-Host "❌ No Set-Cookie header!" -ForegroundColor Red
    }
    
    # Show response body
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
    
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
}
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Response contains `{"token": "..."}`
- ✅ `Set-Cookie` header present with `_medusa_jwt`

---

## 🌐 Step 6: Test in Browser

1. **Clear browser data:**
   - DevTools (F12) → Application → Storage → Clear site data
   - Or manually clear cookies for your Railway domain

2. **Open admin panel:**
   ```
   https://your-railway-url.railway.app/app
   ```

3. **Login:**
   - Email: `admin@medusa.com`
   - Password: `test123`

4. **Check DevTools:**
   - **Network tab:** `POST /auth/user/emailpass` → Should be 200 OK
   - **Response Headers:** Should have `Set-Cookie: _medusa_jwt=...`
   - **Application tab → Cookies:** Should see `_medusa_jwt` cookie

---

## 🐛 Troubleshooting

### Issue: "401 Unauthorized" on login

**Check:**
1. ✅ `TRUST_PROXY=true` is set
2. ✅ CORS includes your Railway URL
3. ✅ Admin user exists (run Step 4)
4. ✅ Password matches `ADMIN_PASSWORD`

**Fix:**
```powershell
# Recreate admin user
$railwayUrl = "https://your-railway-url.railway.app"
Invoke-RestMethod -Uri "$railwayUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"test123"}'
```

---

### Issue: No Set-Cookie header

**This means the custom endpoint isn't working. Check:**

1. **Latest code deployed?**
   - Railway → Deployments → Check commit history
   - Should see: "Override /auth/user/emailpass endpoint to set cookie"

2. **Check Railway logs:**
   ```powershell
   # View logs in Railway dashboard
   # Or check if endpoint exists:
   Invoke-WebRequest -Uri "https://your-railway-url.railway.app/auth/user/emailpass" -Method OPTIONS
   ```

3. **Verify file exists:**
   - `src/api/auth/user/emailpass/route.ts` should exist
   - Should contain cookie-setting code

---

### Issue: "Invalid email or password"

**This means:**
- Admin user doesn't exist, OR
- Password is wrong

**Fix:**
1. Run Step 4 to create admin user
2. Wait 10 seconds
3. Try login again
4. Make sure password matches `ADMIN_PASSWORD` env var

---

## ✅ Success Checklist

- [ ] Railway project is active
- [ ] All environment variables set correctly
- [ ] CORS includes Railway URL
- [ ] `TRUST_PROXY=true` is set
- [ ] Latest code deployed (with cookie fix)
- [ ] Admin user created successfully
- [ ] Login returns 200 OK
- [ ] `Set-Cookie` header present
- [ ] Cookie appears in browser DevTools
- [ ] Can access admin panel

---

## 🎯 Quick Fix Commands

**If something's broken, run these in order:**

```powershell
# 1. Set your Railway URL
$railwayUrl = "https://your-railway-url.railway.app"

# 2. Create admin user
Invoke-RestMethod -Uri "$railwayUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"test123"}'

# 3. Test login
$response = Invoke-WebRequest -Uri "$railwayUrl/auth/user/emailpass" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"test123"}'
$response.Headers['Set-Cookie']

# 4. Open in browser
Start-Process "$railwayUrl/app"
```

---

## 📚 Next Steps

Once everything works:
1. ✅ Bookmark your Railway URL
2. ✅ Save your admin credentials securely
3. ✅ Set up custom domain (optional)
4. ✅ Configure storefront CORS for production

---

**You're all set! Railway is simpler and should work better than Fly.io for your needs.** 🚀

