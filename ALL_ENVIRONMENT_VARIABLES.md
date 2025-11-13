# 📋 Complete List of All Environment Variables

**Complete reference of all environment variables used in this Medusa project.**

---

## 🔴 Required Environment Variables

### Database & Cache

```env
DATABASE_URL=postgresql://user:password@host:port/database
```
- **Required:** ✅ Yes
- **Description:** PostgreSQL database connection string
- **How to get:**
  - **Railway:** Auto-added when you add PostgreSQL service
  - **Render:** Copy "Internal Database URL" from Postgres service
  - **Local:** `postgresql://postgres:password@localhost:5432/medusa_db`

```env
REDIS_URL=redis://default:password@host:port
```
- **Required:** ⚠️ Optional (but recommended)
- **Description:** Redis connection string for caching and sessions
- **Alternative:** `REDISCLOUD_URL` (if using Redis Cloud)
- **How to get:**
  - **Railway:** Auto-added when you add Redis service
  - **Render:** Copy "Internal Redis URL" from Key Value service
  - **Local:** `redis://localhost:6379`

---

### Security Secrets

```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```
- **Required:** ✅ Yes
- **Description:** Secret key for signing JWT tokens
- **Minimum length:** 32 characters
- **Default (dev only):** `supersecret` (⚠️ Never use in production!)
- **Generate:** Use random string generator or PowerShell (see below)

```env
COOKIE_SECRET=your-super-secret-cookie-key-minimum-32-characters-long
```
- **Required:** ✅ Yes
- **Description:** Secret key for signing cookies
- **Minimum length:** 32 characters
- **Default (dev only):** `supersecret` (⚠️ Never use in production!)
- **Generate:** Use different random string than JWT_SECRET

**PowerShell to generate secrets:**
```powershell
# Generate JWT_SECRET (64 characters)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Generate COOKIE_SECRET (64 characters)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Online generator:** https://randomkeygen.com/

---

### CORS Configuration

```env
STORE_CORS=http://localhost:8000,http://localhost:3000,https://your-store-frontend.vercel.app
```
- **Required:** ✅ Yes
- **Description:** Comma-separated list of allowed origins for store API
- **Format:** `origin1,origin2,origin3` (no spaces)
- **Must include:**
  - Local development URLs: `http://localhost:8000`, `http://localhost:3000`
  - Production storefront URL: `https://your-store.vercel.app`

```env
ADMIN_CORS=http://localhost:5173,http://localhost:9000,https://your-admin-frontend.vercel.app,https://your-backend.railway.app
```
- **Required:** ✅ Yes
- **Description:** Comma-separated list of allowed origins for admin API
- **Format:** `origin1,origin2,origin3` (no spaces)
- **⚠️ CRITICAL:** Must include your backend URL (Railway/Render) for admin panel to work!
- **Must include:**
  - Local development URLs: `http://localhost:5173`, `http://localhost:9000`
  - Production admin frontend URL: `https://admin.vercel.app`
  - **Backend URL:** `https://your-backend.railway.app` or `https://your-backend.onrender.com`

```env
AUTH_CORS=http://localhost:5173,http://localhost:9000,https://your-admin-frontend.vercel.app,https://your-backend.railway.app
```
- **Required:** ✅ Yes
- **Description:** Comma-separated list of allowed origins for authentication
- **Format:** `origin1,origin2,origin3` (no spaces)
- **⚠️ CRITICAL:** Must match `ADMIN_CORS` exactly!
- **Must include:** Same URLs as `ADMIN_CORS`

**⚠️ Common Mistakes:**
- ❌ `ADMIN_CORS` and `AUTH_CORS` don't match
- ❌ Missing backend URL in CORS (causes 401 errors)
- ❌ Using `http://` instead of `https://` in production
- ❌ Extra spaces in URLs

---

### Admin User Configuration

```env
ADMIN_EMAIL=admin@medusa.com
```
- **Required:** ✅ Yes (for auto-creation)
- **Description:** Email address for the admin user
- **Default:** `admin@medusa.com`
- **Used by:**
  - `src/subscribers/ensure-admin-on-startup.ts`
  - `src/api/middlewares.ts`
  - `src/api/custom/create-first-admin/route.ts`
  - `src/scripts/create-admin.ts`

```env
ADMIN_PASSWORD=your-secure-password-here-change-this
```
- **Required:** ✅ Yes (for auto-creation)
- **Description:** Password for the admin user
- **Default:** `password1234` (⚠️ Change this!)
- **Requirements:**
  - Minimum 12 characters
  - Mix of letters, numbers, symbols
- **Used by:** Same files as `ADMIN_EMAIL`
- **⚠️ IMPORTANT:** Password is stored in plain text in database (Medusa hashes it during authentication)

---

### Production Configuration

```env
TRUST_PROXY=true
```
- **Required:** ✅ Yes (for production)
- **Description:** Trust X-Forwarded headers from reverse proxy
- **Values:** `true` or `false`
- **When to set:**
  - ✅ Always `true` in production (Railway, Render, Fly.io)
  - ✅ Required when behind reverse proxy
  - ❌ Not needed for local development
- **Why needed:**
  - Medusa v2.6.0+ requires this for proper cookie handling
  - Without it, cookies won't be set correctly in production
  - Causes 401 Unauthorized errors on `/admin/users/me`
  - See [GitHub Issue #11769](https://github.com/medusajs/medusa/issues/11769)

```env
NODE_ENV=production
```
- **Required:** ⚠️ Optional
- **Description:** Node.js environment
- **Values:** `development`, `production`, `test`
- **Default:** `development`
- **Used by:** Medusa config loader

---

## 🟡 Optional Environment Variables

### Admin Setup Security

```env
ADMIN_SETUP_SECRET=your-secret-here
```
- **Required:** ⚠️ Optional
- **Description:** Secret required to access `/custom/create-first-admin` endpoint
- **Usage:** If set, endpoint requires `x-setup-secret` header or `secret` query param
- **Security:** Recommended for production
- **Used by:**
  - `src/api/custom/create-first-admin/route.ts`
  - `src/api/custom/set-admin-password/route.ts`
  - `src/api/custom/reset-admin-password-token/route.ts`

---

### Frontend Configuration (Set in Frontend, NOT Backend!)

```env
MEDUSA_ADMIN_BACKEND_URL=https://your-backend.railway.app
```
- **Required:** ⚠️ Optional (if using separate admin frontend)
- **Description:** Backend API URL for admin frontend
- **⚠️ IMPORTANT:** Set this in your **admin frontend** (Vercel/Next.js), NOT in backend!
- **Must point to:** Your backend URL (e.g., `https://medusa-backend.railway.app`)
- **Must NOT point to:** Your admin frontend URL (e.g., `https://admin.vercel.app`)

**Example:**
- Backend URL: `https://medusa-backend.railway.app`
- Admin Frontend URL: `https://admin.vercel.app`
- Set in **Vercel** (admin frontend): `MEDUSA_ADMIN_BACKEND_URL=https://medusa-backend.railway.app`

---

## 📝 Complete Template (Copy-Paste Ready)

### For Railway Deployment

```env
# Database (Auto-added by Railway when you add PostgreSQL)
DATABASE_URL=postgresql://...  # ✅ Auto-added

# Redis (Auto-added by Railway when you add Redis - Optional)
REDIS_URL=redis://...  # ✅ Auto-added (optional)

# Security Secrets (GENERATE NEW RANDOM STRINGS!)
JWT_SECRET=REPLACE_WITH_64_CHAR_RANDOM_STRING
COOKIE_SECRET=REPLACE_WITH_64_CHAR_RANDOM_STRING

# CORS Configuration (REPLACE YOUR_RAILWAY_URL with your actual Railway URL)
ADMIN_CORS=https://YOUR_RAILWAY_URL.railway.app,http://localhost:5173,http://localhost:9000
AUTH_CORS=https://YOUR_RAILWAY_URL.railway.app,http://localhost:5173,http://localhost:9000
STORE_CORS=https://YOUR_STORE_FRONTEND.vercel.app,http://localhost:8000

# Admin User
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=REPLACE_WITH_SECURE_PASSWORD_MIN_12_CHARS

# Production Configuration (CRITICAL!)
TRUST_PROXY=true

# Optional: Admin Setup Secret
ADMIN_SETUP_SECRET=your-secret-here
```

### For Render.com Deployment

```env
# Database (Copy from Render Postgres service)
DATABASE_URL=postgresql://render_user:password@dpg-xxxxx-a.oregon-postgres.render.com/medusa_db

# Redis (Copy from Render Key Value service)
REDIS_URL=redis://red-xxxxx:6379

# Security Secrets (GENERATE NEW RANDOM STRINGS!)
JWT_SECRET=REPLACE_WITH_64_CHAR_RANDOM_STRING
COOKIE_SECRET=REPLACE_WITH_64_CHAR_RANDOM_STRING

# CORS Configuration (REPLACE YOUR_RENDER_URL with your actual Render URL)
ADMIN_CORS=https://YOUR_RENDER_URL.onrender.com,http://localhost:5173,http://localhost:9000
AUTH_CORS=https://YOUR_RENDER_URL.onrender.com,http://localhost:5173,http://localhost:9000
STORE_CORS=https://YOUR_STORE_FRONTEND.vercel.app,http://localhost:8000

# Admin User
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=REPLACE_WITH_SECURE_PASSWORD_MIN_12_CHARS

# Production Configuration (CRITICAL!)
TRUST_PROXY=true

# Optional: Admin Setup Secret
ADMIN_SETUP_SECRET=your-secret-here
```

### For Local Development

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/medusa_db

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Security Secrets (Use defaults for local dev)
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret

# CORS Configuration
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:5173,http://localhost:9000
STORE_CORS=http://localhost:8000,http://localhost:3000

# Admin User
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=password1234

# Production Configuration (Not needed for local)
# TRUST_PROXY=true  # Not needed for local development
```

---

## 🔍 Environment Variables Used in Code

### In `medusa-config.ts`:
- `DATABASE_URL` - Database connection
- `REDIS_URL` or `REDISCLOUD_URL` - Redis connection
- `STORE_CORS` - Store CORS origins
- `ADMIN_CORS` - Admin CORS origins
- `AUTH_CORS` - Auth CORS origins
- `JWT_SECRET` - JWT signing secret
- `COOKIE_SECRET` - Cookie signing secret
- `NODE_ENV` - Environment mode

### In Admin Creation Scripts:
- `ADMIN_EMAIL` - Admin user email
- `ADMIN_PASSWORD` - Admin user password
- `ADMIN_SETUP_SECRET` - Secret for admin creation endpoint

**Files using admin variables:**
- `src/subscribers/ensure-admin-on-startup.ts`
- `src/api/middlewares.ts`
- `src/api/custom/create-first-admin/route.ts`
- `src/api/custom/set-admin-password/route.ts`
- `src/api/custom/force-create-admin/route.ts`
- `src/scripts/create-admin.ts`
- `src/scripts/ensure-admin-on-startup.ts`
- `src/scripts/set-admin-password-on-startup.ts`

---

## ✅ Verification Checklist

After setting environment variables, verify:

- [ ] `DATABASE_URL` is set and valid
- [ ] `JWT_SECRET` is set and 32+ characters
- [ ] `COOKIE_SECRET` is set and 32+ characters (different from JWT_SECRET)
- [ ] `ADMIN_CORS` includes your backend URL
- [ ] `AUTH_CORS` matches `ADMIN_CORS` exactly
- [ ] `STORE_CORS` includes your storefront URL
- [ ] `ADMIN_EMAIL` is set
- [ ] `ADMIN_PASSWORD` is set and strong (12+ chars)
- [ ] `TRUST_PROXY=true` is set (for production)
- [ ] `ADMIN_SETUP_SECRET` is set (optional but recommended)

---

## 🚨 Common Mistakes

### ❌ Missing Backend URL in CORS
```env
# WRONG - Missing backend URL
ADMIN_CORS=http://localhost:5173
```

```env
# CORRECT - Includes backend URL
ADMIN_CORS=https://your-backend.railway.app,http://localhost:5173
```

### ❌ ADMIN_CORS and AUTH_CORS Don't Match
```env
# WRONG - Different values
ADMIN_CORS=https://your-backend.railway.app
AUTH_CORS=http://localhost:5173
```

```env
# CORRECT - Same values
ADMIN_CORS=https://your-backend.railway.app,http://localhost:5173
AUTH_CORS=https://your-backend.railway.app,http://localhost:5173
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

### ❌ Setting MEDUSA_ADMIN_BACKEND_URL in Backend
```env
# WRONG - Set in backend (doesn't work)
MEDUSA_ADMIN_BACKEND_URL=https://your-backend.railway.app
```

```env
# CORRECT - Set in admin frontend (Vercel/Next.js)
# Not in backend environment variables!
```

---

## 📚 References

- **Medusa Environment Variables:** https://docs.medusajs.com/resources/configurations/environment-variables
- **Railway Variables:** https://docs.railway.app/develop/variables
- **Render Environment Variables:** https://render.com/docs/environment-variables

---

## 🎯 Quick Reference Table

| Variable | Required | Type | Default | Used For |
|----------|----------|------|---------|----------|
| `DATABASE_URL` | ✅ Yes | String | - | PostgreSQL connection |
| `REDIS_URL` | ⚠️ Optional | String | - | Redis connection |
| `JWT_SECRET` | ✅ Yes | String | `supersecret` | JWT signing |
| `COOKIE_SECRET` | ✅ Yes | String | `supersecret` | Cookie signing |
| `STORE_CORS` | ✅ Yes | String | - | Store API CORS |
| `ADMIN_CORS` | ✅ Yes | String | - | Admin API CORS |
| `AUTH_CORS` | ✅ Yes | String | - | Auth API CORS |
| `ADMIN_EMAIL` | ✅ Yes | String | `admin@medusa.com` | Admin user email |
| `ADMIN_PASSWORD` | ✅ Yes | String | `password1234` | Admin user password |
| `TRUST_PROXY` | ✅ Yes (prod) | Boolean | - | Trust proxy headers |
| `ADMIN_SETUP_SECRET` | ⚠️ Optional | String | - | Admin creation security |
| `NODE_ENV` | ⚠️ Optional | String | `development` | Environment mode |

---

**Copy the template above, replace placeholders, and you're ready to deploy!** 🚀

