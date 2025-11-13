# 🔧 X-Forwarded Headers Fix - Production Login Issue

Based on [GitHub Issue #11769](https://github.com/medusajs/medusa/issues/11769), Medusa v2.6.0+ has issues with admin login in production when behind a reverse proxy (Railway, Render, Fly.io, etc.).

## 🚨 The Problem

**Symptoms:**
- ✅ Login works in development
- ❌ Login fails in production (401 Unauthorized)
- ❌ Cookies not being set in browser
- ❌ `GET /admin/users/me 401 (Unauthorized)` error
- ❌ Session data sent but never stored locally

**Root Cause:**
When Medusa is deployed behind a reverse proxy (Railway, Render, Fly.io, etc.), the proxy handles HTTPS and forwards requests to Medusa over HTTP. Medusa needs to know the original protocol to:
- Set cookies correctly (Secure flag for HTTPS)
- Generate correct redirect URLs
- Validate requests properly

Without proper X-Forwarded headers handling, Medusa thinks requests are HTTP when they're actually HTTPS, causing authentication failures.

---

## ✅ The Solution

### Step 1: Add TRUST_PROXY Environment Variable

**Add this to your backend environment variables:**

```env
TRUST_PROXY=true
```

This tells Medusa to trust the `X-Forwarded-*` headers set by your hosting platform's reverse proxy.

---

### Step 2: Verify Your Hosting Platform Sets Headers

Most modern hosting platforms automatically set X-Forwarded headers:

- ✅ **Railway** - Automatically sets `X-Forwarded-Proto: https`
- ✅ **Render** - Automatically sets `X-Forwarded-Proto: https`
- ✅ **Fly.io** - Automatically sets `X-Forwarded-Proto: https`
- ✅ **Vercel** - Automatically sets `X-Forwarded-Proto: https`

**You don't need to configure anything on the platform side** - just set `TRUST_PROXY=true` in your environment variables.

---

### Step 3: Update Environment Variables

Add `TRUST_PROXY=true` to your backend environment variables:

#### For Railway:
1. Go to your Railway project → Service → Variables
2. Add: `TRUST_PROXY=true`
3. Redeploy

#### For Render:
1. Go to your Render service → Environment
2. Add: `TRUST_PROXY=true`
3. Save (auto-redeploys)

#### For Fly.io:
1. Run: `fly secrets set TRUST_PROXY=true`
2. Or add to `fly.toml` environment section

---

## 📋 Complete Environment Variables Checklist

After adding `TRUST_PROXY=true`, verify you have:

```env
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Security
JWT_SECRET=your-secret
COOKIE_SECRET=your-secret

# CORS (MUST include production URLs!)
ADMIN_CORS=https://your-admin-frontend.vercel.app,http://localhost:5173
AUTH_CORS=https://your-admin-frontend.vercel.app,http://localhost:5173
STORE_CORS=https://your-store-frontend.vercel.app,http://localhost:8000

# Admin User (for auto-creation)
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=your-password

# ⭐ CRITICAL FIX: Trust Proxy Headers
TRUST_PROXY=true
```

---

## 🔍 How It Works

**Without `TRUST_PROXY=true`:**
1. Client makes HTTPS request → `https://your-backend.railway.app/admin/auth/token`
2. Railway proxy receives HTTPS, forwards as HTTP to Medusa
3. Medusa sees HTTP request (doesn't trust X-Forwarded-Proto header)
4. Medusa sets cookie with `Secure=false` (wrong for HTTPS)
5. Browser rejects cookie or cookie doesn't work
6. Next request fails with 401 Unauthorized

**With `TRUST_PROXY=true`:**
1. Client makes HTTPS request → `https://your-backend.railway.app/admin/auth/token`
2. Railway proxy receives HTTPS, forwards as HTTP with `X-Forwarded-Proto: https` header
3. Medusa trusts the header, knows original request was HTTPS
4. Medusa sets cookie with `Secure=true` (correct for HTTPS)
5. Browser accepts cookie
6. Next request succeeds! ✅

---

## 🧪 Testing the Fix

After adding `TRUST_PROXY=true` and redeploying:

1. **Clear browser cookies** for your backend domain
2. **Try logging in** at your admin panel
3. **Check browser DevTools → Network tab:**
   - Login request should return 200 OK
   - Response should include `Set-Cookie` header
   - Cookie should have `Secure` flag
4. **Check browser DevTools → Application → Cookies:**
   - Cookie should be stored
   - Cookie should have `Secure` flag checked

---

## 🚨 If It Still Doesn't Work

### Check 1: Verify TRUST_PROXY is Set
```powershell
# Check environment variable is set (if you have shell access)
echo $env:TRUST_PROXY
# Should output: true
```

### Check 2: Verify Headers Are Being Sent
Check your hosting platform's logs to see if `X-Forwarded-Proto: https` is being sent.

### Check 3: Check CORS Configuration
Make sure `ADMIN_CORS` and `AUTH_CORS` include your production admin frontend URL.

### Check 4: Verify Cookie Settings
In browser DevTools → Application → Cookies, check:
- Cookie domain matches your backend domain
- Cookie has `Secure` flag (for HTTPS)
- Cookie has `SameSite` attribute set correctly

---

## 📚 Additional Resources

- [GitHub Issue #11769](https://github.com/medusajs/medusa/issues/11769) - Original issue
- [Express Trust Proxy Documentation](https://expressjs.com/en/guide/behind-proxies.html)
- [X-Forwarded-Proto Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto)

---

## ✅ Summary

**The fix is simple:**
1. Add `TRUST_PROXY=true` to your backend environment variables
2. Redeploy your backend
3. Clear browser cookies
4. Try logging in again

This should resolve the 401 Unauthorized errors and cookie issues in production! 🎉



