# 🔍 Verify TRUST_PROXY is Actually Working

## 🚨 Current Situation

- ✅ `TRUST_PROXY=true` is set in Railway
- ❌ Login still returns 401 Unauthorized
- ❌ Both `/auth/user/emailpass` and `/admin/auth/token` fail

**Possible issues:**
1. `TRUST_PROXY` not being read correctly by Medusa
2. Password not stored correctly (separate issue)
3. Both issues combined

---

## ✅ Step 1: Verify TRUST_PROXY Format

**In Railway Variables, check:**
- ✅ Value is exactly `true` (lowercase, no quotes)
- ❌ NOT `"true"` (with quotes)
- ❌ NOT `TRUE` (uppercase)
- ❌ NOT `1` (number)
- ❌ NOT ` true` (with space)

**Correct:** `TRUST_PROXY=true`

---

## ✅ Step 2: Force Redeploy

After verifying `TRUST_PROXY=true`:
1. **Railway:** Click "Redeploy" button (or wait for auto-redeploy)
2. **Wait for deployment to complete**
3. **Check logs** to ensure it restarted

---

## ✅ Step 3: Check Railway Logs for TRUST_PROXY

Look in Railway deployment logs for:
- Any mention of `TRUST_PROXY`
- Any errors about proxy/headers
- Check if Medusa is reading the env var

---

## 🔧 Step 4: Test if TRUST_PROXY Affects Login

The X-Forwarded headers issue typically affects cookies AFTER login, but it might also affect the initial authentication request.

**Test:**
1. After redeploying with `TRUST_PROXY=true`
2. Try login again
3. Check browser DevTools → Network → Login request
4. Look at response headers - should include `Set-Cookie` if TRUST_PROXY is working

---

## 🚨 Most Likely: Password Storage Issue

However, the 401 on `/auth/user/emailpass` suggests the **password itself is wrong**, not a cookie issue.

**The real problem:** Password is not being stored correctly in `provider_metadata`.

**But TRUST_PROXY could still be relevant** if Medusa is rejecting requests due to protocol mismatch.

---

## ✅ Combined Fix

1. **Verify `TRUST_PROXY=true` is set correctly** (no quotes, lowercase)
2. **Redeploy** (wait for completion)
3. **Recreate admin user** with simple password:
   ```powershell
   $backendUrl = "https://edukitecommerce-backend-production.up.railway.app"
   $body = @{
       email = "admin@medusa.com"
       password = "test123"
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "$backendUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
   ```
4. **Wait 15 seconds**
5. **Test login** with `test123`
6. **Check browser cookies** - should have `Secure` flag if TRUST_PROXY is working

---

## 📋 Action Items

1. ✅ Verify `TRUST_PROXY=true` format (no quotes, lowercase)
2. ✅ Redeploy after verifying
3. ✅ Recreate admin user with simple password
4. ✅ Test login
5. ✅ Check cookies have `Secure` flag (confirms TRUST_PROXY is working)

---

**The X-Forwarded headers fix IS relevant - let's make sure TRUST_PROXY is actually being read correctly!** 🔍

