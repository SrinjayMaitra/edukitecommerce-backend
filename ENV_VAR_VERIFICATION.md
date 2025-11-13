# Environment Variables Verification

## ✅ Correctly Set

1. **ADMIN_CORS**: ✅ Set with production URL
   - Value: `https://edukitecommerce-backend.onrender.com,http://localhost:5173, http://localhost:9000`
   - ⚠️ Minor: Has extra space after comma (should be fine, but ideally no spaces)

2. **ADMIN_EMAIL**: ✅ Correct
   - Value: `admin@medusa.com`

3. **ADMIN_PASSWORD**: ✅ Set
   - Value: `password1234`

4. **TRUST_PROXY**: ✅ Critical fix is set!
   - Value: `true`

5. **DATABASE_URL**: ✅ Valid PostgreSQL URL
   - Format looks correct

6. **REDIS_URL**: ✅ Valid Redis URL
   - Format looks correct

---

## ⚠️ Issues Found

### 1. AUTH_CORS Missing Production URL

**Current:**
```
AUTH_CORS: http://localhost:5173, http://localhost:9000
```

**Should be:**
```
AUTH_CORS: https://edukitecommerce-backend.onrender.com,http://localhost:5173,http://localhost:9000
```

**Why this matters:**
- `AUTH_CORS` must match `ADMIN_CORS` for authentication to work
- Without the production URL, auth requests from your admin panel will be blocked
- This is likely causing your 401 errors!

**Fix:** Update `AUTH_CORS` to include the production URL (same as `ADMIN_CORS`)

---

### 2. JWT_SECRET Still Has Placeholder

**Current:**
```
JWT_SECRET: your-64-character-random-string-here
```

**Issue:** This is still placeholder text, not a real secret.

**Fix:** Generate a real random string (at least 32 characters). You can use:
- Online: https://randomkeygen.com/
- PowerShell: `-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})`

---

### 3. COOKIE_SECRET Still Has Placeholder

**Current:**
```
COOKIE_SECRET: your-different-64-character-random-string-here
```

**Issue:** This is still placeholder text, not a real secret.

**Fix:** Generate a different random string (must be different from JWT_SECRET). Same method as above.

---

### 4. STORE_CORS Missing Production URL

**Current:**
```
STORE_CORS: http://localhost:8000, http://localhost:3000
```

**Issue:** Only has localhost URLs. If you have a production store frontend, add it here.

**Fix (if you have a store frontend):**
```
STORE_CORS: https://your-store-frontend.vercel.app,http://localhost:8000,http://localhost:3000
```

---

## Summary

### Critical Issues (Fix These First):
1. ❌ **AUTH_CORS** - Missing production URL (likely causing 401 errors)
2. ⚠️ **JWT_SECRET** - Still placeholder (security risk)
3. ⚠️ **COOKIE_SECRET** - Still placeholder (security risk)

### Minor Issues:
4. ⚠️ **STORE_CORS** - Missing production URL (only matters if you have a store frontend)
5. ℹ️ **ADMIN_CORS** - Has extra spaces (not critical, but cleaner without spaces)

---

## Recommended Fixes

### Priority 1: Fix AUTH_CORS (This is likely your login issue!)

Update `AUTH_CORS` to:
```
https://edukitecommerce-backend.onrender.com,http://localhost:5173,http://localhost:9000
```

### Priority 2: Generate Real Secrets

Replace `JWT_SECRET` and `COOKIE_SECRET` with actual random strings.

### Priority 3: Update STORE_CORS (if needed)

Add your production store frontend URL if you have one.

---

## After Making Changes

1. **Save** the environment variables in Render
2. **Wait for Render to redeploy** (check Deployments tab)
3. **Clear browser cookies** for `edukitecommerce-backend.onrender.com`
4. **Try logging in again** at `https://edukitecommerce-backend.onrender.com/app`

---

## Verification Checklist

- [x] ADMIN_CORS includes production URL
- [ ] AUTH_CORS includes production URL (MISSING!)
- [x] ADMIN_EMAIL is set
- [x] ADMIN_PASSWORD is set
- [x] TRUST_PROXY is true
- [x] DATABASE_URL is valid
- [x] REDIS_URL is valid
- [ ] JWT_SECRET is a real random string (still placeholder)
- [ ] COOKIE_SECRET is a real random string (still placeholder)
- [ ] STORE_CORS includes production URL (if you have a store frontend)



