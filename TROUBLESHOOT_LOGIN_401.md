# 🔧 Troubleshooting: 401 Unauthorized Login Errors

If you're still getting 401 errors after adding `TRUST_PROXY=true`, follow these steps:

## Step 1: Verify TRUST_PROXY is Set

**Check your environment variables:**
- Railway: Go to Variables tab → Look for `TRUST_PROXY=true`
- Render: Go to Environment tab → Look for `TRUST_PROXY=true`
- Fly.io: Run `fly secrets list` → Look for `TRUST_PROXY`

**If it's not there, add it:**
- Railway: Add `TRUST_PROXY=true` in Variables
- Render: Add `TRUST_PROXY=true` in Environment
- Fly.io: Run `fly secrets set TRUST_PROXY=true`

**⚠️ IMPORTANT:** After adding, you MUST redeploy!

---

## Step 2: Verify Admin User Exists

The 401 error could also mean the admin user doesn't exist or password is wrong.

### Check if user exists via API:

```powershell
# Replace with your backend URL
$backendUrl = "https://your-backend.railway.app"

# Try to get user info (will fail if user doesn't exist)
Invoke-RestMethod -Uri "$backendUrl/admin/users/me" -Method GET
```

### Create admin user if missing:

**Option A: Via API Endpoint**
```powershell
Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"your-password"}'
```

**Option B: Via Shell (if available)**
```bash
npx medusa user --email admin@medusa.com --password your-password
```

---

## Step 3: Check Browser Cookies

The issue might be cookies not being set correctly.

1. **Open Browser DevTools** (F12)
2. **Go to Application tab → Cookies**
3. **Look for cookies from your backend domain**
4. **Check:**
   - Are cookies being set?
   - Do they have `Secure` flag?
   - What's the domain?

**If cookies aren't being set:**
- Clear all cookies for your backend domain
- Try again after adding `TRUST_PROXY=true` and redeploying

---

## Step 4: Verify CORS Configuration

Make sure your CORS settings include your admin frontend URL:

```env
ADMIN_CORS=https://your-admin-frontend.vercel.app,http://localhost:5173
AUTH_CORS=https://your-admin-frontend.vercel.app,http://localhost:5173
```

**⚠️ Common mistakes:**
- Missing production URL in ADMIN_CORS
- Using `http://` instead of `https://` in production
- Typos in URLs

---

## Step 5: Check Network Tab

1. **Open DevTools → Network tab**
2. **Try logging in**
3. **Look for these requests:**
   - `POST /auth/user/emailpass` - Should return 200 OK
   - `GET /admin/users/me` - Should return 200 OK (not 401)

**If `/auth/user/emailpass` returns 401:**
- Admin user doesn't exist or password is wrong
- Create admin user (see Step 2)

**If `/admin/users/me` returns 401:**
- Cookie not being set (TRUST_PROXY issue)
- Cookie not being sent (CORS issue)
- Cookie expired or invalid

---

## Step 6: Complete Reset Process

If nothing works, do a complete reset:

1. **Add/Verify Environment Variables:**
   ```env
   TRUST_PROXY=true
   ADMIN_CORS=https://your-admin-frontend.vercel.app,http://localhost:5173
   AUTH_CORS=https://your-admin-frontend.vercel.app,http://localhost:5173
   ADMIN_EMAIL=admin@medusa.com
   ADMIN_PASSWORD=your-secure-password
   ```

2. **Redeploy Backend** (wait for deployment to complete)

3. **Clear Browser Data:**
   - Clear cookies for your backend domain
   - Clear localStorage
   - Hard refresh (Ctrl+Shift+R)

4. **Create Admin User:**
   ```powershell
   Invoke-RestMethod -Uri "https://your-backend-url/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"your-password"}'
   ```

5. **Try Login Again**

---

## Step 7: Check Backend Logs

Check your hosting platform's logs for errors:

**Railway:**
- Go to Deployments → Latest → View Logs

**Render:**
- Go to Logs tab

**Look for:**
- Database connection errors
- Authentication errors
- CORS errors
- Any 401/403 errors

---

## Step 8: Verify Password Storage

If admin user exists but login still fails, password might be stored incorrectly.

**Check database (if you have access):**
```sql
SELECT 
  u.email,
  pi.provider,
  pi.provider_metadata
FROM "user" u
JOIN provider_identity pi ON pi.entity_id = u.id
WHERE u.email = 'admin@medusa.com';
```

**Password should be stored as PLAIN TEXT in `provider_metadata.password`** (Medusa hashes it during auth).

**If password is hashed, recreate the auth identity:**
```powershell
# Delete and recreate via API
Invoke-RestMethod -Uri "https://your-backend-url/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"your-password"}'
```

---

## Common Issues Summary

| Issue | Symptom | Fix |
|-------|---------|-----|
| TRUST_PROXY not set | Cookies not set, 401 on `/admin/users/me` | Add `TRUST_PROXY=true` and redeploy |
| Admin user doesn't exist | 401 on `/auth/user/emailpass` | Create admin user |
| Wrong password | "Invalid email or password" | Reset password or recreate user |
| CORS misconfigured | 401 on all requests | Fix ADMIN_CORS and AUTH_CORS |
| Password double-hashed | Login fails even with correct password | Recreate auth identity with plain text password |
| Cookies blocked | No cookies in browser | Check browser settings, clear cookies |

---

## Still Not Working?

If you've tried everything above:

1. **Share your environment variables** (without secrets):
   - Which hosting platform?
   - Is `TRUST_PROXY=true` set?
   - What are your CORS URLs?

2. **Share Network tab details:**
   - What's the response from `/auth/user/emailpass`?
   - What's the response from `/admin/users/me`?
   - Are cookies being set?

3. **Check backend logs** for any errors

4. **Verify admin user exists** in database

---

## Quick Test Script

Run this to test everything:

```powershell
$backendUrl = "https://your-backend-url"

# Test 1: Health check
Write-Host "Testing backend health..."
Invoke-RestMethod -Uri "$backendUrl/health" -Method GET

# Test 2: Create admin user
Write-Host "Creating admin user..."
Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"test1234"}'

# Test 3: Try to get user (will fail without auth, but should not be 401 if user exists)
Write-Host "Testing user endpoint..."
try {
    Invoke-RestMethod -Uri "$backendUrl/admin/users/me" -Method GET
} catch {
    Write-Host "Expected to fail (no auth), but status should not be 401 if TRUST_PROXY is set correctly"
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
}
```



