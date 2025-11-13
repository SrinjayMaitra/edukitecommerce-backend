# 🚨 Quick Fix: 401 Unauthorized Errors

Based on your console errors, here's a step-by-step fix:

## Immediate Steps

### Step 1: Verify TRUST_PROXY is Set and Redeployed

**Check if it's set:**
- Railway: Variables tab → Look for `TRUST_PROXY=true`
- Render: Environment tab → Look for `TRUST_PROXY=true`

**If missing, add it:**
```env
TRUST_PROXY=true
```

**⚠️ CRITICAL:** After adding, you MUST redeploy your backend!

---

### Step 2: Create Admin User (If Not Exists)

The 401 error on `/auth/user/emailpass` suggests the admin user might not exist or password is wrong.

**Run this PowerShell command** (replace with your backend URL):

```powershell
$backendUrl = "https://your-backend.railway.app"  # CHANGE THIS!

# Create admin user
Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"password1234"}'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Admin user created successfully with password!",
  "email": "admin@medusa.com",
  "password": "password1234"
}
```

---

### Step 3: Clear Browser Data

1. **Open DevTools** (F12)
2. **Application tab → Storage → Clear site data**
3. **Or manually:**
   - Clear Cookies for your backend domain
   - Clear LocalStorage
   - Hard refresh (Ctrl+Shift+R)

---

### Step 4: Try Login Again

1. Go to your admin panel: `https://your-backend-url/app`
2. Email: `admin@medusa.com`
3. Password: `password1234` (or whatever you set)
4. Click "Continue with Email"

---

## If Still Not Working

### Check Network Tab

1. **Open DevTools → Network tab**
2. **Try logging in**
3. **Look for these requests:**

**Request 1: `POST /auth/user/emailpass`**
- **Status should be:** 200 OK (not 401)
- **If 401:** Admin user doesn't exist or password is wrong
- **Fix:** Run Step 2 again

**Request 2: `GET /admin/users/me`**
- **Status should be:** 200 OK (not 401)
- **If 401:** Cookie not being set (TRUST_PROXY issue)
- **Fix:** Verify TRUST_PROXY=true and redeploy

---

### Verify Environment Variables

Make sure you have ALL of these set:

```env
# Database
DATABASE_URL=postgresql://...

# Redis (optional)
REDIS_URL=redis://...

# Security
JWT_SECRET=your-secret
COOKIE_SECRET=your-secret

# CORS (MUST include your admin frontend URL!)
ADMIN_CORS=https://your-admin-frontend.vercel.app,http://localhost:5173
AUTH_CORS=https://your-admin-frontend.vercel.app,http://localhost:5173
STORE_CORS=https://your-store-frontend.vercel.app,http://localhost:8000

# Admin User
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=password1234

# ⭐ CRITICAL: Trust Proxy (fixes 401 errors)
TRUST_PROXY=true
```

---

### Complete Reset (Last Resort)

If nothing works, do a complete reset:

1. **Add all environment variables** (see above)
2. **Redeploy backend** (wait for completion)
3. **Create admin user:**
   ```powershell
   Invoke-RestMethod -Uri "https://your-backend-url/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"password1234"}'
   ```
4. **Clear browser data** (cookies, localStorage)
5. **Hard refresh** (Ctrl+Shift+R)
6. **Try login again**

---

## Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| 401 on `/auth/user/emailpass` | User doesn't exist or wrong password | Create admin user (Step 2) |
| 401 on `/admin/users/me` | Cookie not set (TRUST_PROXY issue) | Add `TRUST_PROXY=true` and redeploy |
| "Invalid email or password" | Password stored incorrectly | Recreate admin user |
| Cookies not appearing | TRUST_PROXY not set | Add `TRUST_PROXY=true` and redeploy |

---

## Quick Test

Run this to test everything at once:

```powershell
$backendUrl = "https://your-backend-url"  # CHANGE THIS!

Write-Host "=== Testing Backend ===" -ForegroundColor Cyan

# Test 1: Health check
Write-Host "`n1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/health" -Method GET
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not accessible" -ForegroundColor Red
    exit
}

# Test 2: Create admin user
Write-Host "`n2. Creating admin user..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"password1234"}'
    Write-Host "✅ Admin user created/updated" -ForegroundColor Green
    Write-Host "   Email: $($result.email)" -ForegroundColor Gray
    Write-Host "   Password: $($result.password)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create admin user" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check if TRUST_PROXY is needed
Write-Host "`n3. Testing user endpoint (will fail without auth, but should not be 401)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$backendUrl/admin/users/me" -Method GET
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "⚠️  Got 401 - TRUST_PROXY might not be set or cookies not working" -ForegroundColor Yellow
        Write-Host "   Fix: Add TRUST_PROXY=true to environment variables and redeploy" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Got $statusCode (expected - no auth token provided)" -ForegroundColor Green
    }
}

Write-Host "`n=== Tests Complete ===" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Make sure TRUST_PROXY=true is set" -ForegroundColor White
Write-Host "2. Redeploy your backend" -ForegroundColor White
Write-Host "3. Clear browser cookies" -ForegroundColor White
Write-Host "4. Try logging in at: $backendUrl/app" -ForegroundColor White
```

---

## Still Not Working?

Share these details:

1. **What's your backend URL?**
2. **Did you add `TRUST_PROXY=true`?**
3. **Did you redeploy after adding it?**
4. **What's the response from `/custom/create-first-admin`?**
5. **What's the status code from Network tab for `/auth/user/emailpass`?**



