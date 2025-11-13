# 🔍 Verify TRUST_PROXY is Actually Working

## 🚨 The Issue

Even though `TRUST_PROXY=true` is set, Medusa might not be reading it correctly, or Railway might not be sending X-Forwarded headers properly.

---

## ✅ Step 1: Verify TRUST_PROXY is Set Correctly

**In Railway:**
1. Go to Variables tab
2. Check that `TRUST_PROXY=true` (not `TRUST_PROXY="true"` or `TRUST_PROXY=1`)
3. Make sure there are no extra spaces

**Common mistakes:**
- ❌ `TRUST_PROXY="true"` (quotes)
- ❌ `TRUST_PROXY= true` (space)
- ❌ `TRUST_PROXY=1` (should be "true")
- ✅ `TRUST_PROXY=true` (correct)

---

## ✅ Step 2: Force Redeploy After Setting TRUST_PROXY

**Important:** After setting `TRUST_PROXY=true`, you MUST redeploy:

1. **Railway:** After adding variable, click "Redeploy" or wait for auto-redeploy
2. **Check deployment logs** to ensure it restarted with new variable

---

## ✅ Step 3: Verify X-Forwarded Headers Are Being Sent

Railway should automatically send `X-Forwarded-Proto: https`, but let's verify:

**Check Railway logs:**
1. Go to Deployments → Latest → View Logs
2. Look for any mention of `X-Forwarded-Proto` or proxy headers
3. If you see errors about headers, Railway might not be sending them

---

## ✅ Step 4: Add Explicit Trust Proxy Configuration

If `TRUST_PROXY=true` isn't working, we might need to configure it explicitly in code.

**Check if Medusa is reading the env var correctly.**

---

## 🧪 Test if TRUST_PROXY is Working

### Test 1: Check Cookie Security

After login attempt, check browser DevTools → Application → Cookies:

**If TRUST_PROXY is working:**
- ✅ Cookie has `Secure` flag checked
- ✅ Cookie domain matches Railway domain

**If TRUST_PROXY is NOT working:**
- ❌ Cookie has `Secure` flag unchecked (or missing)
- ❌ Cookie might not be set at all

### Test 2: Check Response Headers

In browser DevTools → Network tab → Login request → Headers:

**Look for:**
- `Set-Cookie` header should include `Secure`
- Response should be 200 (not 401) if password is correct

---

## 🔧 Alternative: Configure Trust Proxy in Code

If environment variable isn't working, we might need to set it in code. But first, let's verify the current setup.

---

## 📋 Action Items

1. ✅ Verify `TRUST_PROXY=true` is set correctly (no quotes, no spaces)
2. ✅ Redeploy after setting (wait for completion)
3. ✅ Check Railway logs for X-Forwarded headers
4. ✅ Test cookie security in browser DevTools
5. ✅ Check if cookies are being set at all

---

**The X-Forwarded headers fix is critical - let's make sure it's actually working!** 🔍

