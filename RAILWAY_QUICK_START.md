# 🚀 Railway Quick Start - 5 Minute Setup

**Fastest way to deploy Medusa to Railway with working admin login.**

---

## ⚡ Quick Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push
```

### 2. Create Railway Project
1. Go to https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Select your repo → Select `medusa-starter-default` folder

### 3. Add Database
1. Click **"+ New"** → **Database** → **Add PostgreSQL**
2. ✅ `DATABASE_URL` auto-added!

### 4. Add Environment Variables
Go to **Variables** tab, add these:

```env
JWT_SECRET=generate-32-char-random-string-here
COOKIE_SECRET=generate-32-char-random-string-here
ADMIN_CORS=https://YOUR_RAILWAY_URL.railway.app,http://localhost:5173
AUTH_CORS=https://YOUR_RAILWAY_URL.railway.app,http://localhost:5173
STORE_CORS=https://your-store.vercel.app,http://localhost:8000
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=your-secure-password-here
TRUST_PROXY=true
```

**⚠️ Replace `YOUR_RAILWAY_URL` with your actual Railway URL after deployment!**

### 5. Wait for Deployment
- Railway auto-deploys
- Wait for "Live" status
- Get your URL from **Settings** → **Networking**

### 6. Update CORS URLs
After getting your Railway URL, update:
- `ADMIN_CORS` with your Railway URL
- `AUTH_CORS` with your Railway URL
- Railway auto-redeploys

### 7. Test Login
1. Open `https://your-app.railway.app/app`
2. Login with `ADMIN_EMAIL` and `ADMIN_PASSWORD`
3. ✅ Should work!

---

## 🧪 Test with PowerShell

```powershell
.\deploy-railway.ps1 -RailwayUrl "https://your-app.railway.app" -AdminPassword "your-password"
```

---

## ✅ What's Already Configured

- ✅ Database migrations run automatically (`npm run migrate`)
- ✅ Admin user created automatically on startup
- ✅ Password stored correctly (plain text, Medusa hashes it)
- ✅ Trust proxy configured (`TRUST_PROXY=true`)
- ✅ Build configuration ready (`nixpacks.toml`)

---

## 📚 Full Guide

See `RAILWAY_DEPLOYMENT.md` for detailed instructions.

---

**That's it! Your admin login should work immediately after deployment.** 🎉

