# 🔍 Check Password Storage - Both Endpoints Fail

## 🚨 Current Status

Both auth endpoints return 401 Unauthorized:
- ❌ `/auth/user/emailpass` → 401
- ❌ `/admin/auth/token` → 401

This means the **password is not stored correctly** in the database.

---

## 🔍 What to Check

### Step 1: Check Railway Deployment Logs

1. **Go to Railway → Your Service → Deployments**
2. **Click latest deployment → View Logs**
3. **Search for:**
   - `✅ Admin user created with password!` (should see this)
   - `Creating auth identity` (should see this)
   - Any errors about `auth_identity`
   - Any errors about `provider_metadata`

**Look for errors like:**
- `Error creating auth identity`
- `Failed to set password`
- `provider_metadata` errors

---

### Step 2: Verify Admin User Was Created

Run this to check if user exists:

```powershell
$backendUrl = "https://edukitecommerce-backend-production.up.railway.app"

# Try to access admin endpoint (will fail but might give us info)
try {
    Invoke-RestMethod -Uri "$backendUrl/admin/users" -Method GET
} catch {
    Write-Host "Error: $_"
}
```

---

### Step 3: Check Database Directly (If Possible)

If you have Railway database access:

**Connect to PostgreSQL:**
- Railway → PostgreSQL Service → Connect
- Or use `psql` with connection string from `DATABASE_URL`

**Check user:**
```sql
SELECT id, email, metadata FROM "user" WHERE email = 'admin@medusa.com';
```

**Check auth_identity:**
```sql
SELECT 
    ai.id as auth_id,
    pi.provider,
    pi.provider_metadata,
    pi.user_metadata,
    u.email
FROM auth_identity ai
JOIN provider_identity pi ON pi.auth_identity_id = ai.id
JOIN "user" u ON u.id = pi.entity_id
WHERE u.email = 'admin@medusa.com';
```

**What to look for:**
- `provider_metadata` should be: `{"password": "Admin123456"}` (plain text)
- If it's hashed or empty, that's the problem
- If no rows returned, auth_identity wasn't created

---

## ✅ Possible Fixes

### Fix 1: Recreate Admin User Multiple Times

Sometimes the auth_identity creation fails silently. Try recreating 2-3 times:

```powershell
$backendUrl = "https://edukitecommerce-backend-production.up.railway.app"
$body = @{
    email = "admin@medusa.com"
    password = "Admin123456"
} | ConvertTo-Json

# Try 3 times
1..3 | ForEach-Object {
    Write-Host "Attempt $_..." -ForegroundColor Yellow
    try {
        $result = Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
        Write-Host "  ✅ Success: $($result.message)" -ForegroundColor Green
        Start-Sleep -Seconds 5
    } catch {
        Write-Host "  ❌ Failed: $_" -ForegroundColor Red
    }
}
```

---

### Fix 2: Check if Subscriber/Middleware Ran

The subscriber should create admin on startup. Check logs for:
- `✅ Admin user ready!` (subscriber ran)
- `✅ [Middleware] Admin user ready!` (middleware ran)

If you don't see these, the automatic creation failed.

---

### Fix 3: Try Different Password Format

Maybe special characters are causing issues. Try:

```powershell
$backendUrl = "https://edukitecommerce-backend-production.up.railway.app"

# Try with very simple password
$body = @{
    email = "admin@medusa.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body

# Then try login
$loginBody = @{
    email = "admin@medusa.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$backendUrl/auth/user/emailpass" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
```

---

## 🚨 Most Likely Issue

Based on the symptoms:
1. ✅ User creation succeeds
2. ❌ Login fails with 401
3. ❌ Both endpoints fail

**Most likely:** The `auth_identity` is being created but the `provider_metadata.password` is either:
- Empty/null
- Stored in wrong format
- Not being read correctly by Medusa

**Check Railway logs first** - they will tell us exactly what's happening!

---

## 📋 Action Items

1. ✅ Check Railway deployment logs (most important!)
2. ✅ Try recreating admin user 2-3 times
3. ✅ Try simpler password (`test123`)
4. ✅ Check database directly (if possible)
5. ✅ Verify subscriber/middleware ran

**Start with checking the logs - they'll tell us what's wrong!** 🔍

