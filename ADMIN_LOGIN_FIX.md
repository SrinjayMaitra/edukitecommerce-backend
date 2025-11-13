# 🔧 Admin Login Fix - Based on GitHub Issue #273

This fix addresses the admin authentication issues in production, based on [this GitHub issue](https://github.com/medusajs/nextjs-starter-medusa/issues/273).

## 🚨 The Problem

The GitHub issue shows that admin login fails in production due to:
1. **Incorrect `MEDUSA_ADMIN_BACKEND_URL`** - Set to admin frontend URL instead of backend API
2. **CORS misconfiguration** - ADMIN_CORS doesn't match actual admin frontend URL
3. **Database connection issues** - DATABASE_URL not properly configured

## ✅ The Solution

### Step 1: Fix Environment Variables

**CRITICAL:** If you're using a separate admin frontend (like Vercel), you need these variables:

#### For Backend (Railway/Render/Fly.io):

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Redis
REDIS_URL=redis://default:password@host:port

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
COOKIE_SECRET=your-super-secret-cookie-key-change-this-to-random-string

# CORS - CRITICAL: Must match your actual admin frontend URL
ADMIN_CORS=https://your-admin-frontend.vercel.app,http://localhost:5173,http://localhost:9000
AUTH_CORS=https://your-admin-frontend.vercel.app,http://localhost:5173,http://localhost:9000
STORE_CORS=https://your-store-frontend.vercel.app,http://localhost:8000

# Admin User (for auto-creation)
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=your-secure-password-here
```

#### For Admin Frontend (Vercel/Next.js):

```env
# CRITICAL: This must point to your BACKEND API URL, not the admin frontend!
MEDUSA_ADMIN_BACKEND_URL=https://your-backend.railway.app
# OR
MEDUSA_ADMIN_BACKEND_URL=https://your-backend.onrender.com
# OR
MEDUSA_ADMIN_BACKEND_URL=https://your-backend.fly.dev
```

**⚠️ Common Mistake:** Setting `MEDUSA_ADMIN_BACKEND_URL` to the admin frontend URL (e.g., `https://admin.yourdomain.com`) - this is WRONG! It must be your backend API URL.

---

### Step 2: Verify CORS Configuration

**ADMIN_CORS** must include:
- Your production admin frontend URL (e.g., `https://admin.vercel.app`)
- Local development URLs (e.g., `http://localhost:5173`)

**Example:**
```env
ADMIN_CORS=https://edukitecommerce-admin.vercel.app,http://localhost:5173,http://localhost:9000
AUTH_CORS=https://edukitecommerce-admin.vercel.app,http://localhost:5173,http://localhost:9000
```

**⚠️ Important:** Use comma-separated values, NO spaces after commas.

---

### Step 3: Create Admin User

After deployment, create the admin user using one of these methods:

#### Method A: API Endpoint (Recommended)

```powershell
Invoke-RestMethod -Uri "https://your-backend-url/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"your-password"}'
```

#### Method B: Medusa CLI (If you have shell access)

```bash
npx medusa user --email admin@medusa.com --password your-password
```

#### Method C: Automatic (via Middleware)

If you set `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables, the admin user will be created automatically on the first request to your backend.

---

### Step 4: Test the Configuration

1. **Check Backend Health:**
   ```powershell
   Invoke-RestMethod -Uri "https://your-backend-url/health"
   ```

2. **Check Admin Endpoint:**
   ```powershell
   Invoke-RestMethod -Uri "https://your-backend-url/admin/auth"
   ```

3. **Try Login:**
   - Go to your admin frontend: `https://your-admin-frontend.vercel.app`
   - Or backend admin: `https://your-backend-url/app`
   - Login with your credentials

---

## 🔍 Troubleshooting

### Issue: "CORS Error" in Browser Console

**Solution:**
1. Check that `ADMIN_CORS` includes your exact admin frontend URL
2. Check that `AUTH_CORS` matches `ADMIN_CORS`
3. Make sure there are no typos in URLs
4. Verify URLs use `https://` (not `http://`) in production

### Issue: "Invalid email or password"

**Solution:**
1. Make sure admin user exists (check via API or database)
2. Verify password is stored correctly (should be plain text in `provider_metadata.password`)
3. Try creating user again via API endpoint

### Issue: "401 Unauthorized" on `/admin/users/me` after login

**Solution:**
1. **Add `TRUST_PROXY=true` to environment variables** (CRITICAL!)
2. This is required for Medusa v2.6.0+ in production
3. See [X_FORWARDED_HEADERS_FIX.md](./X_FORWARDED_HEADERS_FIX.md) for details
4. Clear browser cookies and try again

### Issue: "Cannot connect to backend"

**Solution:**
1. Verify `MEDUSA_ADMIN_BACKEND_URL` points to your backend API (not admin frontend)
2. Check backend is running: `https://your-backend-url/health`
3. Verify backend URL is accessible (not blocked by firewall)

### Issue: Database Connection Error

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database is accessible from your hosting service
3. Run migrations: `npm run migrate` or `medusa db:migrate`

---

## 📋 Quick Checklist

Before deploying, verify:

- [ ] `DATABASE_URL` is set correctly
- [ ] `REDIS_URL` is set (if using Redis)
- [ ] `JWT_SECRET` is a long random string
- [ ] `COOKIE_SECRET` is a different long random string
- [ ] `ADMIN_CORS` includes your production admin frontend URL
- [ ] `AUTH_CORS` matches `ADMIN_CORS`
- [ ] `STORE_CORS` includes your store frontend URL
- [ ] `ADMIN_EMAIL` is set (for auto-creation)
- [ ] `ADMIN_PASSWORD` is set (for auto-creation)
- [ ] `MEDUSA_ADMIN_BACKEND_URL` points to **backend API** (not admin frontend)
- [ ] **`TRUST_PROXY=true`** is set (CRITICAL for production - fixes 401 errors)

---

## 🎯 Example Configuration

### Backend (Railway/Render/Fly.io):

```env
DATABASE_URL=postgresql://postgres:password@host:5432/railway
REDIS_URL=redis://default:password@host:6379
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
COOKIE_SECRET=xyz789vwx456stu123pqr890mno567jkl234ghi901def
ADMIN_CORS=https://edukitecommerce-admin.vercel.app,http://localhost:5173
AUTH_CORS=https://edukitecommerce-admin.vercel.app,http://localhost:5173
STORE_CORS=https://edukitecommerce.vercel.app,http://localhost:8000
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=SecurePassword123!
TRUST_PROXY=true
```

### Admin Frontend (Vercel):

```env
MEDUSA_ADMIN_BACKEND_URL=https://edukitecommerce-backend.railway.app
```

---

## ✅ After Fix

Once configured correctly:
1. Deploy backend
2. Create admin user (via API or CLI)
3. Access admin panel at your admin frontend URL
4. Login should work! 🎉

---

## 📚 References

- [GitHub Issue #273](https://github.com/medusajs/nextjs-starter-medusa/issues/273)
- [Medusa Admin Authentication Docs](https://docs.medusajs.com/api/admin#authentication)
- [Medusa CORS Configuration](https://docs.medusajs.com/development/backend/configurations#cors)

