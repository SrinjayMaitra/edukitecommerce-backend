# 🚀 Quick Migration: Render.com → Railway

Since Render.com blocks cookies (`.onrender.com` is on public suffix list), switching to Railway will fix your login issue immediately.

## Why Railway?

✅ **Cookies work** - `.railway.app` is not on public suffix list  
✅ **Easy migration** - Just copy environment variables  
✅ **Free tier available** - $5 credit/month (requires payment method)  
✅ **Same setup** - PostgreSQL, Redis, environment variables  

---

## Step 1: Create Railway Account

1. Go to: https://railway.app
2. Sign up with GitHub
3. Add payment method (required for free tier, but you get $5/month free)

---

## Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository
4. Railway will auto-detect it's a Node.js app

---

## Step 3: Add PostgreSQL

1. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway creates the database automatically
3. Note: `DATABASE_URL` is auto-set

---

## Step 4: Add Redis (Optional but Recommended)

1. Click **"+ New"** → **"Database"** → **"Add Redis"**
2. Railway creates Redis automatically
3. Note: `REDIS_URL` is auto-set

---

## Step 5: Copy Environment Variables

Go to your service → **Variables** tab → Add these (copy from Render):

```env
# Database (auto-set by Railway, but verify)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (auto-set by Railway, but verify)
REDIS_URL=${{Redis.REDIS_URL}}

# Security (copy from Render)
JWT_SECRET=your-64-character-random-string-here
COOKIE_SECRET=your-different-64-character-random-string-here

# CORS (update with Railway URL after deployment)
ADMIN_CORS=https://your-app.railway.app,http://localhost:5173,http://localhost:9000
AUTH_CORS=https://your-app.railway.app,http://localhost:5173,http://localhost:9000
STORE_CORS=http://localhost:8000,http://localhost:3000

# Admin User
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=password1234

# Trust Proxy (CRITICAL!)
TRUST_PROXY=true
```

---

## Step 6: Deploy

1. Railway will auto-deploy when you push to GitHub
2. Or click **"Deploy"** button
3. Wait for deployment (2-3 minutes)

---

## Step 7: Get Your Railway URL

After deployment:
1. Go to your service → **Settings** → **Domains**
2. Copy your Railway URL (e.g., `https://edukitecommerce-backend-production.up.railway.app`)

---

## Step 8: Update CORS URLs

1. Go to **Variables** tab
2. Update `ADMIN_CORS` and `AUTH_CORS` with your Railway URL:
   ```
   ADMIN_CORS=https://your-app.railway.app,http://localhost:5173,http://localhost:9000
   AUTH_CORS=https://your-app.railway.app,http://localhost:5173,http://localhost:9000
   ```
3. Railway will auto-redeploy

---

## Step 9: Create Admin User

After deployment completes:

```powershell
$railwayUrl = "https://your-app.railway.app"  # Replace with your Railway URL

Invoke-RestMethod -Uri "$railwayUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"password1234"}'
```

---

## Step 10: Login!

1. Go to: `https://your-app.railway.app/app`
2. Email: `admin@medusa.com`
3. Password: `password1234`
4. **Login should work!** 🎉

---

## Why This Will Work

- ✅ Railway's `.railway.app` domain **doesn't block cookies**
- ✅ All your environment variables are the same
- ✅ Same code, same database structure
- ✅ `TRUST_PROXY=true` is already set
- ✅ Cookies will be set and stored properly

---

## Migration Checklist

- [ ] Create Railway account
- [ ] Create new project from GitHub
- [ ] Add PostgreSQL database
- [ ] Add Redis (optional)
- [ ] Copy all environment variables
- [ ] Deploy
- [ ] Get Railway URL
- [ ] Update CORS URLs with Railway domain
- [ ] Wait for redeploy
- [ ] Create admin user
- [ ] Test login
- [ ] Update admin frontend `MEDUSA_ADMIN_BACKEND_URL` (if you have one)

---

## Time Estimate

- Setup: 5 minutes
- Deployment: 2-3 minutes
- Testing: 2 minutes
- **Total: ~10 minutes**

This should fix your login issue immediately!



