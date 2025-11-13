# 🔧 Fix: Admin User Created But Login Fails

## ✅ What Happened

Your logs show:
- ✅ `Admin user created with password!` (200 OK)
- ❌ Login still fails with "Invalid email or password"

This means the admin user exists, but the **password stored doesn't match** what you're typing.

---

## 🚨 Common Causes

### 1. Password Has Special Characters
The `@` symbol in `password@123` might be causing issues:
- URL encoding problems
- JSON parsing issues
- Database storage issues

### 2. Password Not Stored Correctly
- Password might have been hashed incorrectly
- Auth identity might not have been created properly
- Database sync delay

### 3. Browser Cache/Cookies
- Old failed login attempts cached
- Cookies from previous attempts interfering

---

## ✅ The Fix

### Option 1: Use Simpler Password (Recommended)

Try recreating with a password that doesn't have `@`:

**PowerShell:**
```powershell
$backendUrl = "https://edukitecommerce-backend-production.up.railway.app"
$body = @{
    email = "admin@medusa.com"
    password = "Admin123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

**Then login with:**
- Email: `admin@medusa.com`
- Password: `Admin123456`

---

### Option 2: Use Fix Script

Run the fix script:

```powershell
.\fix-admin-password.ps1 -RailwayUrl "https://edukitecommerce-backend-production.up.railway.app" -Password "Admin123456"
```

---

### Option 3: Manual Steps

1. **Recreate admin user:**
```powershell
$backendUrl = "https://edukitecommerce-backend-production.up.railway.app"
$body = @{
    email = "admin@medusa.com"
    password = "Admin123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

2. **Wait 10 seconds** (for database sync)

3. **Clear browser cookies:**
   - Open DevTools (F12)
   - Application tab → Cookies
   - Delete all cookies for `edukitecommerce-backend-production.up.railway.app`

4. **Try login again:**
   - Go to: `https://edukitecommerce-backend-production.up.railway.app/app`
   - Email: `admin@medusa.com`
   - Password: `Admin123456`

---

## 🔍 Verify Password is Correct

### Test Login via API:

```powershell
$backendUrl = "https://edukitecommerce-backend-production.up.railway.app"
$loginBody = @{
    email = "admin@medusa.com"
    password = "Admin123456"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$backendUrl/admin/auth/token" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    Write-Host "✅ Login works! Token: $($result.access_token.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
}
```

**If this works but browser login doesn't:**
- It's a browser cookie/cache issue
- Clear cookies and try again

**If this also fails:**
- Password is still wrong
- Need to recreate admin user again

---

## 📋 Recommended Password

Use a password without special characters:

**Good passwords:**
- `Admin123456`
- `MedusaAdmin2024`
- `SecurePass123`

**Avoid:**
- `password@123` (has @ symbol)
- `pass#word` (has # symbol)
- `pass$word` (has $ symbol)

---

## ✅ After Fixing

1. ✅ Admin user recreated with simple password
2. ✅ Wait 10 seconds
3. ✅ Clear browser cookies
4. ✅ Login at `/app`
5. ✅ Should work!

---

## 🚨 If Still Not Working

Check Railway logs for:
- `✅ Admin user ready!` (subscriber ran)
- `✅ Admin user created with password!` (API endpoint ran)
- Any errors about auth_identity creation

**If you see errors:**
- Database might not be ready
- Try recreating admin user again
- Check that `TRUST_PROXY=true` is set

---

**Try Option 1 first - use a simpler password without @ symbol!** 🚀

