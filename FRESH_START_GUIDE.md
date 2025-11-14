# 🔄 Fresh Start Guide - Test with Clean Medusa Template

**Starting fresh with a clean Medusa template can help identify if the issue is with custom code or Medusa v2 itself.**

---

## 🎯 Why Start Fresh?

**Benefits:**
- ✅ Isolate the issue (custom code vs. Medusa v2)
- ✅ See if it's a configuration problem
- ✅ Compare with working examples
- ✅ Learn from a clean setup

**Risks:**
- ⚠️ You'll lose custom code (but you can add it back)
- ⚠️ Need to reconfigure everything
- ⚠️ Might find the same issue (then we know it's Medusa v2)

---

## 📋 Step-by-Step: Fresh Medusa Template

### Step 1: Create New Medusa Project

```powershell
# Create new directory
cd ..
mkdir medusa-fresh-test
cd medusa-fresh-test

# Create new Medusa project
npx create-medusa-app@latest .

# Follow prompts:
# - Project name: medusa-fresh-test
# - Database: PostgreSQL
# - Redis: Yes
# - Database URL: (leave empty for now, we'll use Railway's)
# - JWT Secret: (generate one)
# - Cookie Secret: (generate different one)
```

---

### Step 2: Push to GitHub

```powershell
cd medusa-fresh-test

# Initialize git
git init
git add .
git commit -m "Initial commit - Fresh Medusa template"

# Create new GitHub repo and push
# (Do this manually on GitHub, then:)
git remote add origin https://github.com/your-username/medusa-fresh-test.git
git branch -M main
git push -u origin main
```

---

### Step 3: Deploy to Railway

1. **Go to Railway:** https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **Select:** `medusa-fresh-test`
4. **Add PostgreSQL:**
   - Click **"+ New"** → **Database** → **Add PostgreSQL**
   - ✅ `DATABASE_URL` auto-added

5. **Add Redis (optional):**
   - Click **"+ New"** → **Database** → **Add Redis**
   - ✅ `REDIS_URL` auto-added

6. **Set Environment Variables:**
   Go to **Variables** tab, add:

```env
# Database (auto-added, but verify)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Security (generate new ones!)
JWT_SECRET=your-64-char-secret-here
COOKIE_SECRET=your-64-char-secret-here

# CORS (update after getting Railway URL)
STORE_CORS=http://localhost:8000,http://localhost:3000
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:5173,http://localhost:9000

# Admin User
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=test123

# CRITICAL: Trust Proxy
TRUST_PROXY=true

# Node Environment
NODE_ENV=production
```

7. **Wait for deployment** (2-3 minutes)

8. **Get Railway URL:**
   - Settings → Networking → Copy your URL
   - Example: `https://medusa-fresh-test-production.up.railway.app`

9. **Update CORS:**
   - Go back to Variables
   - Update `ADMIN_CORS` and `AUTH_CORS` to include Railway URL:
   ```
   ADMIN_CORS=https://medusa-fresh-test-production.up.railway.app,http://localhost:5173,http://localhost:9000
   AUTH_CORS=https://medusa-fresh-test-production.up.railway.app,http://localhost:5173,http://localhost:9000
   ```
   - Railway will auto-redeploy

---

### Step 4: Create Admin User

**Option 1: Use Medusa CLI via Railway SSH**
```powershell
# Install Railway CLI if not installed
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# SSH and create user
railway ssh -c "npx medusa user -e admin@medusa.com -p test123"
```

**Option 2: Use Seed Script (if template includes it)**
```powershell
railway ssh -c "npm run seed"
```

**Option 3: Check if template has admin creation**
Some templates auto-create admin on first deploy.

---

### Step 5: Test Login

1. **Open:** `https://your-railway-url.railway.app/app`
2. **Login:**
   - Email: `admin@medusa.com`
   - Password: `test123`

3. **Check DevTools:**
   - Network tab → `POST /auth/user/emailpass` → Should be 200 OK
   - Response Headers → Should have `Set-Cookie: _medusa_jwt`
   - Application → Cookies → Should see `_medusa_jwt` cookie

---

## 🔍 What to Check

### If Login Works ✅
**Great!** This means:
- Medusa v2 works fine on Railway
- The issue is with your custom code
- You can gradually add back custom features

**Next steps:**
1. Compare your custom code with the fresh template
2. Add back features one by one
3. Test after each addition

---

### If Login Still Fails ❌
**This means:**
- It's a Medusa v2 + Railway issue (not your code)
- Or a configuration problem

**Check:**
1. **Environment Variables:**
   - `TRUST_PROXY=true` ✅
   - CORS includes Railway URL ✅
   - `DATABASE_URL` is set ✅

2. **Railway Logs:**
   - Go to Railway → Deployments → Latest → View Logs
   - Look for errors about:
     - Database connection
     - Authentication
     - Cookie setting

3. **Network Tab:**
   - Check `POST /auth/user/emailpass` response
   - Check if `Set-Cookie` header is present
   - Check CORS errors

---

## 🎬 YouTube Tutorials to Follow

**Popular Railway + Medusa tutorials:**

1. **Search:** "Medusa v2 Railway deployment"
2. **Look for:**
   - Recent videos (2024-2025)
   - Medusa v2 (not v1)
   - Railway deployment

**Common steps in tutorials:**
- Create Railway project
- Add PostgreSQL
- Set environment variables
- Deploy
- Create admin user
- Test login

**Compare their setup with yours:**
- Environment variables
- CORS configuration
- Admin user creation method

---

## 🔄 Migration Strategy

**If fresh template works:**

### Phase 1: Test Fresh Template
- Deploy clean template
- Test login
- Verify it works

### Phase 2: Add Custom Features Gradually
1. **Add custom modules** (one at a time)
2. **Add custom endpoints** (test after each)
3. **Add custom middleware** (test carefully)
4. **Add custom admin pages** (test UI)

### Phase 3: Compare Configurations
- Compare `medusa-config.ts`
- Compare environment variables
- Compare package.json dependencies

---

## 🐛 Common Issues in Fresh Templates

### Issue 1: Admin User Not Created
**Fix:**
```powershell
railway ssh -c "npx medusa user -e admin@medusa.com -p test123"
```

### Issue 2: CORS Errors
**Fix:**
- Make sure `ADMIN_CORS` and `AUTH_CORS` include Railway URL
- No spaces in CORS values
- Exact match between `ADMIN_CORS` and `AUTH_CORS`

### Issue 3: 401 Unauthorized
**Fix:**
- Verify `TRUST_PROXY=true`
- Check Railway logs for errors
- Verify admin user exists

### Issue 4: Cookies Not Set
**Fix:**
- Check `TRUST_PROXY=true`
- Check CORS includes Railway URL
- Check browser console for errors

---

## ✅ Success Checklist

- [ ] Fresh template deployed to Railway
- [ ] PostgreSQL added and connected
- [ ] All environment variables set
- [ ] CORS includes Railway URL
- [ ] `TRUST_PROXY=true` set
- [ ] Admin user created
- [ ] Login works at `/app`
- [ ] Cookie is set in browser
- [ ] Can access admin panel

---

## 🎯 Recommendation

**Yes, start fresh!** Here's why:

1. **Quick test** - 30 minutes to deploy fresh template
2. **Isolate issue** - Know if it's your code or Medusa v2
3. **Learn** - See how clean Medusa v2 works
4. **Compare** - Compare with YouTube tutorials

**Then:**
- If it works → Gradually add back your custom code
- If it doesn't → It's a Medusa v2 + Railway issue (we'll fix it)

---

## 📚 Resources

- **Medusa Docs:** https://docs.medusajs.com
- **Railway Docs:** https://docs.railway.app
- **Medusa GitHub:** https://github.com/medusajs/medusa
- **Railway Discord:** https://discord.gg/railway

---

**Starting fresh is a good debugging strategy!** It will help us identify if the issue is with your custom code or Medusa v2 itself. 🚀

