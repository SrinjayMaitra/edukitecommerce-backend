# 🚂 Railway Environment Variables Template

Copy these variables to Railway → Your Service → Variables

## 📋 Complete Environment Variables List

### Step 1: Database & Redis (Auto-Added by Railway)

These are **automatically added** when you add PostgreSQL/Redis services:
- ✅ `DATABASE_URL` - Auto-added when you add PostgreSQL
- ✅ `REDIS_URL` - Auto-added when you add Redis (optional)

**You don't need to set these manually!**

---

### Step 2: Security Secrets (REQUIRED - Generate New Ones!)

```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
COOKIE_SECRET=your-super-secret-cookie-key-minimum-32-characters-long
```

**⚠️ IMPORTANT:** Generate NEW secrets! Don't use these examples!

**PowerShell to generate:**
```powershell
# Generate 32-character random string
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

### Step 3: CORS Configuration (REQUIRED)

**⚠️ IMPORTANT:** Replace `YOUR_RAILWAY_URL` with your actual Railway URL after deployment!

```env
ADMIN_CORS=https://YOUR_RAILWAY_URL.railway.app,http://localhost:5173,http://localhost:9000
AUTH_CORS=https://YOUR_RAILWAY_URL.railway.app,http://localhost:5173,http://localhost:9000
STORE_CORS=https://YOUR_STORE_FRONTEND.vercel.app,http://localhost:8000
```

**Example (replace with your actual URLs):**
```env
ADMIN_CORS=https://medusa-backend.railway.app,http://localhost:5173,http://localhost:9000
AUTH_CORS=https://medusa-backend.railway.app,http://localhost:5173,http://localhost:9000
STORE_CORS=https://my-store.vercel.app,http://localhost:8000
```

**Notes:**
- `ADMIN_CORS` and `AUTH_CORS` **must match** and include your Railway URL
- Add your admin frontend URL if using separate frontend
- Add your store frontend URL if using separate storefront

---

### Step 4: Admin User Configuration (REQUIRED)

```env
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=your-secure-password-here-change-this
```

**⚠️ IMPORTANT:** 
- Use a **strong password** (12+ characters, mix of letters, numbers, symbols)
- This password will be used to login to `/app`
- Admin user is created automatically on startup

---

### Step 5: Trust Proxy (CRITICAL - REQUIRED)

```env
TRUST_PROXY=true
```

**⚠️ CRITICAL:** This **must** be set to `true` for Railway deployments!

**Why:** Railway uses a reverse proxy, and Medusa needs to trust the `X-Forwarded-Proto` headers to set cookies correctly.

---

### Step 6: Optional - Admin Setup Secret

```env
ADMIN_SETUP_SECRET=your-secret-here
```

**Optional:** If set, the `/custom/create-first-admin` endpoint will require this secret in the `x-setup-secret` header.

**Leave empty** if you want the endpoint to be publicly accessible (not recommended for production).

---

## 📝 Quick Copy-Paste Template

**After you get your Railway URL, copy this and replace placeholders:**

```env
# Security Secrets (GENERATE NEW ONES!)
JWT_SECRET=REPLACE_WITH_32_CHAR_RANDOM_STRING
COOKIE_SECRET=REPLACE_WITH_32_CHAR_RANDOM_STRING

# CORS (REPLACE YOUR_RAILWAY_URL with your actual Railway URL)
ADMIN_CORS=https://YOUR_RAILWAY_URL.railway.app,http://localhost:5173,http://localhost:9000
AUTH_CORS=https://YOUR_RAILWAY_URL.railway.app,http://localhost:5173,http://localhost:9000
STORE_CORS=https://YOUR_STORE_FRONTEND.vercel.app,http://localhost:8000

# Admin User
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=REPLACE_WITH_SECURE_PASSWORD

# Trust Proxy (CRITICAL!)
TRUST_PROXY=true

# Optional
ADMIN_SETUP_SECRET=
```

---

## 🔍 Verification Checklist

After setting variables, verify:

- ✅ `DATABASE_URL` is set (auto-added by Railway)
- ✅ `JWT_SECRET` is set and 32+ characters
- ✅ `COOKIE_SECRET` is set and 32+ characters
- ✅ `ADMIN_CORS` includes your Railway URL
- ✅ `AUTH_CORS` matches `ADMIN_CORS` and includes Railway URL
- ✅ `STORE_CORS` includes your storefront URL
- ✅ `ADMIN_EMAIL` is set
- ✅ `ADMIN_PASSWORD` is set and strong
- ✅ `TRUST_PROXY=true` is set

---

## 🚨 Common Mistakes

### ❌ Wrong CORS URLs
```env
# WRONG - Missing Railway URL
ADMIN_CORS=http://localhost:5173
```

```env
# CORRECT - Includes Railway URL
ADMIN_CORS=https://your-app.railway.app,http://localhost:5173
```

### ❌ ADMIN_CORS and AUTH_CORS Don't Match
```env
# WRONG - Different values
ADMIN_CORS=https://your-app.railway.app
AUTH_CORS=http://localhost:5173
```

```env
# CORRECT - Same values
ADMIN_CORS=https://your-app.railway.app,http://localhost:5173
AUTH_CORS=https://your-app.railway.app,http://localhost:5173
```

### ❌ Missing TRUST_PROXY
```env
# WRONG - Missing or false
TRUST_PROXY=false
# or not set at all
```

```env
# CORRECT
TRUST_PROXY=true
```

### ❌ Weak Secrets
```env
# WRONG - Too short or predictable
JWT_SECRET=secret
COOKIE_SECRET=password123
```

```env
# CORRECT - 32+ random characters
JWT_SECRET=aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1pQ3
COOKIE_SECRET=xY9zA7bC5dE3fG1hI9jK7lM5nO3pQ1rS9tU7vW5xY3zA1bC9dE7fG5hI3jK1
```

---

## 📚 Reference

- **Railway Variables Docs:** https://docs.railway.app/develop/variables
- **Medusa Environment Variables:** https://docs.medusajs.com/resources/configurations/environment-variables

---

**Ready? Copy the template above, replace placeholders, and paste into Railway!** 🚀

