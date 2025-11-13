# 🔧 Railway Login Fix - "Invalid email or password"

## ✅ CORS is Fixed!

I can see your CORS variables are now correct:
- ✅ `ADMIN_CORS` includes Railway URL
- ✅ `AUTH_CORS` includes Railway URL

But you're still getting "Invalid email or password" - this means the **admin user doesn't exist or password is wrong**.

---

## 🚨 The Problem

The error `POST /auth/user/emailpass 401 (Unauthorized)` means:
- ✅ CORS is working (request goes through)
- ❌ Admin user doesn't exist OR password is incorrect

---

## ✅ The Fix

### Step 1: Create Admin User Manually

Run this PowerShell script to create/verify the admin user:

```powershell
.\test-railway-admin.ps1 -RailwayUrl "https://edukitecommerce-backend-production.up.railway.app" -Password "password@123"
```

**Or manually:**

```powershell
$backendUrl = "https://edukitecommerce-backend-production.up.railway.app"
$password = "password@123"

# Create admin user
Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body (@{
    email = "admin@medusa.com"
    password = $password
} | ConvertTo-Json)
```

---

### Step 2: Check Railway Deployment Logs

1. Go to Railway → Your Service → **Deployments**
2. Click on the **latest deployment**
3. Click **"View Logs"**
4. Look for these messages:
   - ✅ `✅ Admin user ready!`
   - ✅ `📧 Email: admin@medusa.com`
   - ✅ `🔑 Password: password@123`
   - ❌ `❌ Error ensuring admin user`

**If you see errors:**
- The subscriber might have failed
- Database might not be ready when subscriber runs
- Need to create admin manually (Step 1)

---

### Step 3: Verify Environment Variables Match

Make sure these match what you're using to login:

```env
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=password@123
```

**⚠️ IMPORTANT:** 
- The password in `ADMIN_PASSWORD` must match what you're typing in the login form
- Check for typos or extra spaces

---

### Step 4: Wait and Retry

After creating admin user:
1. **Wait 10-15 seconds** (for database to sync)
2. **Clear browser cookies** for Railway domain
3. **Try login again** at `/app`

---

## 🔍 Why Admin User Might Not Exist

### Reason 1: Subscriber Didn't Run
- Subscriber runs on `application.ready` event
- If database wasn't ready, it might have failed silently
- **Fix:** Create admin manually (Step 1)

### Reason 2: Database Migration Issues
- If migrations failed, tables might not exist
- **Fix:** Check deployment logs for migration errors

### Reason 3: Password Mismatch
- `ADMIN_PASSWORD` env var doesn't match what you're typing
- **Fix:** Verify both match exactly

---

## 🧪 Test Script

I've created `test-railway-admin.ps1` that will:
1. ✅ Test backend health
2. ✅ Create/recreate admin user
3. ✅ Test login
4. ✅ Test authenticated endpoint

**Run it:**
```powershell
.\test-railway-admin.ps1 -RailwayUrl "https://edukitecommerce-backend-production.up.railway.app" -Password "password@123"
```

---

## 📋 Complete Fix Checklist

- [ ] CORS includes Railway URL ✅ (Already done!)
- [ ] Create admin user manually (Step 1)
- [ ] Check deployment logs for errors
- [ ] Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` match
- [ ] Wait 10-15 seconds after creating admin
- [ ] Clear browser cookies
- [ ] Try login again

---

## 🚨 If Still Not Working

### Check Database Directly

If you have Railway database access:

1. **Connect to PostgreSQL:**
   - Railway → PostgreSQL Service → Connect
   - Or use `psql` with connection string

2. **Check if user exists:**
```sql
SELECT id, email FROM "user" WHERE email = 'admin@medusa.com';
```

3. **Check if auth_identity exists:**
```sql
SELECT 
    ai.id,
    pi.provider,
    pi.provider_metadata,
    u.email
FROM auth_identity ai
JOIN provider_identity pi ON pi.auth_identity_id = ai.id
JOIN "user" u ON u.id = pi.entity_id
WHERE u.email = 'admin@medusa.com';
```

4. **If user exists but no auth_identity:**
   - Run the create-admin script again
   - Or manually create auth_identity

---

## ✅ Expected Result

After fixing, you should see:
- ✅ Login successful
- ✅ No 401 errors in console
- ✅ Can access `/admin/users/me`
- ✅ Admin panel loads correctly

---

**Run the test script first - it will diagnose and fix the issue!** 🚀

