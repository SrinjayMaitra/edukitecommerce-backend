# 🚨 CRITICAL FIX: Railway CORS Configuration

## The Problem

Your `ADMIN_CORS` and `AUTH_CORS` are missing your Railway backend URL!

**Current (WRONG):**
```
ADMIN_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com
AUTH_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com
```

**Your Railway URL:** `https://edukitecommerce-backend-production.up.railway.app`

**Why this causes "Invalid email or password":**
- When you access `/app` on Railway, your browser makes requests from `https://edukitecommerce-backend-production.up.railway.app`
- Medusa checks if this origin is in `ADMIN_CORS` and `AUTH_CORS`
- It's NOT there, so Medusa rejects the requests with 401 Unauthorized
- This appears as "Invalid email or password" even though credentials are correct

---

## ✅ The Fix

### Step 1: Update CORS Variables in Railway

Go to Railway → Your Service → Variables and **UPDATE** these:

**ADMIN_CORS:**
```
https://edukitecommerce-backend-production.up.railway.app,http://localhost:5173,http://localhost:9000
```

**AUTH_CORS:**
```
https://edukitecommerce-backend-production.up.railway.app,http://localhost:5173,http://localhost:9000
```

**⚠️ IMPORTANT:**
- Remove `https://docs.medusajs.com` (that's wrong!)
- Add your Railway backend URL: `https://edukitecommerce-backend-production.up.railway.app`
- Keep localhost URLs for local development
- NO spaces after commas!

---

### Step 2: Railway Will Auto-Redeploy

After saving the variables, Railway will automatically redeploy your service.

**Wait for deployment to complete** (check Deployments tab).

---

### Step 3: Verify Admin User Exists

After redeployment, check if admin user was created:

**PowerShell:**
```powershell
$backendUrl = "https://edukitecommerce-backend-production.up.railway.app"

# Create/verify admin user
Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"password@123"}'
```

---

### Step 4: Test Login

1. **Clear browser cookies** for `edukitecommerce-backend-production.up.railway.app`
2. **Go to:** `https://edukitecommerce-backend-production.up.railway.app/app`
3. **Login with:**
   - Email: `admin@medusa.com`
   - Password: `password@123`
4. **Should work now!** ✅

---

## 🔍 Why This Happens

When you access the admin panel at `https://edukitecommerce-backend-production.up.railway.app/app`:

1. Browser loads the admin panel from Railway URL
2. Admin panel makes API requests to `/admin/auth/token` and `/admin/users/me`
3. Browser sends `Origin: https://edukitecommerce-backend-production.up.railway.app` header
4. Medusa checks: "Is this origin in `ADMIN_CORS`?"
5. **NO** → Medusa rejects with 401 Unauthorized
6. Error appears as "Invalid email or password" (misleading!)

**With correct CORS:**
1. Browser sends `Origin: https://edukitecommerce-backend-production.up.railway.app`
2. Medusa checks: "Is this origin in `ADMIN_CORS`?"
3. **YES** → Medusa allows the request
4. Login works! ✅

---

## 📋 Complete Corrected Variables

After fixing, your CORS variables should be:

```env
ADMIN_CORS=https://edukitecommerce-backend-production.up.railway.app,http://localhost:5173,http://localhost:9000
AUTH_CORS=https://edukitecommerce-backend-production.up.railway.app,http://localhost:5173,http://localhost:9000
STORE_CORS=http://localhost:8000,https://your-store-frontend.vercel.app
```

---

## 🚨 Additional Issues to Fix

### 1. Weak Secrets (Security Risk)

Your `JWT_SECRET` and `COOKIE_SECRET` are set to `supersecret` (default).

**Fix:** Generate strong secrets:

**PowerShell:**
```powershell
# Generate JWT_SECRET (64 characters)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Generate COOKIE_SECRET (64 characters - different from JWT_SECRET!)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Update in Railway:**
- `JWT_SECRET` = (paste generated value)
- `COOKIE_SECRET` = (paste different generated value)

---

## ✅ Verification Checklist

After fixing CORS:

- [ ] `ADMIN_CORS` includes Railway backend URL
- [ ] `AUTH_CORS` matches `ADMIN_CORS` exactly
- [ ] Removed `https://docs.medusajs.com` from CORS
- [ ] Railway redeployed successfully
- [ ] Admin user created/verified
- [ ] Can login at `/app`

---

**Fix the CORS issue first - that's the main problem!** 🚀

