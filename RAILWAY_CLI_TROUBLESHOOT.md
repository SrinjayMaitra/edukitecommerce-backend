# 🔧 Railway CLI Troubleshooting - `railway run` Not Working

## Common Issues with `railway run npx medusa user`

---

## Issue 1: Railway CLI Not Installed

**Check if Railway CLI is installed:**
```powershell
railway --version
```

**If not installed:**
```powershell
# Windows PowerShell
iwr https://railway.app/install.ps1 -useb | iex

# Or via npm
npm install -g @railway/cli
```

---

## Issue 2: Not Linked to Railway Project

**Check if you're linked:**
```powershell
railway status
```

**If not linked:**
```powershell
# Link to your project
railway link

# Or link to specific project
railway link <project-id>
```

**Find your project ID:**
```powershell
railway list
```

---

## Issue 3: Wrong Directory

**Make sure you're in the project directory:**
```powershell
cd medusa-starter-default
railway status
```

**Should show your Railway project info.**

---

## Issue 4: Medusa CLI Not Available in Railway Environment

`railway run` runs commands locally with Railway's environment variables, but **Medusa CLI might not be installed locally** or might not work the same way.

**Check if Medusa CLI works locally:**
```powershell
npx medusa user --help
```

**If it doesn't work locally, install it:**
```powershell
npm install -g @medusajs/cli
# Or
npm install -g medusa
```

---

## Issue 5: Database Connection Issues

`railway run` injects environment variables, but the database might not be accessible from your local machine.

**Check if DATABASE_URL is accessible:**
```powershell
railway variables | Select-String DATABASE_URL
```

**Railway's DATABASE_URL might be internal-only** (not accessible from your local machine).

---

## ✅ Better Solutions

### Solution 1: Use Railway SSH (Recommended)

**SSH into Railway and run commands there:**

```powershell
# Link to project
railway link

# SSH into the service
railway ssh

# Once inside Railway, run:
npx medusa user --email admin@medusa.com --password test123
```

**Or run command directly:**
```powershell
railway ssh -c "npx medusa user --email admin@medusa.com --password test123"
```

---

### Solution 2: Use Custom Endpoint (Easiest)

**Use the `/custom/create-first-admin` endpoint:**

```powershell
$railwayUrl = "https://your-railway-url.railway.app"
$body = @{
    email = "admin@medusa.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$railwayUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

**This works from anywhere** and doesn't require Railway CLI!

---

### Solution 3: Set Environment Variables and Let Auto-Creation Work

**Set ADMIN_EMAIL and ADMIN_PASSWORD:**

```powershell
railway link
railway variables --set ADMIN_EMAIL=admin@medusa.com
railway variables --set ADMIN_PASSWORD=test123
```

**Your middleware will auto-create the admin user on startup!**

---

## 🔍 Debugging Steps

### Step 1: Check Railway CLI Connection

```powershell
railway whoami
railway status
```

**Should show:**
- Your Railway username
- Your project info

---

### Step 2: Check Environment Variables

```powershell
railway variables
```

**Should show:**
- `DATABASE_URL`
- `JWT_SECRET`
- `COOKIE_SECRET`
- etc.

---

### Step 3: Test Railway Run with Simple Command

```powershell
railway run echo "Hello from Railway"
```

**If this works, Railway CLI is working.**

---

### Step 4: Check if Medusa CLI is Available

```powershell
railway run npx medusa --version
```

**If this fails**, Medusa CLI might not be available in the Railway environment.

---

## 🎯 Recommended Approach

**For Railway, use one of these:**

### Option A: Custom Endpoint (Easiest)
```powershell
$railwayUrl = "https://your-railway-url.railway.app"
Invoke-RestMethod -Uri "$railwayUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"test123"}'
```

### Option B: Railway SSH
```powershell
railway ssh -c "npx medusa user --email admin@medusa.com --password test123"
```

### Option C: Environment Variables (Auto-Creation)
```powershell
railway variables --set ADMIN_EMAIL=admin@medusa.com
railway variables --set ADMIN_PASSWORD=test123
# Wait for Railway to redeploy
```

---

## ❓ Why `railway run` Might Not Work

1. **Medusa CLI not installed** in Railway's build environment
2. **Database not accessible** from your local machine (Railway uses internal URLs)
3. **Command runs locally** with Railway env vars, but can't connect to Railway's database
4. **Medusa CLI might need** the actual Railway environment, not just env vars

---

## ✅ Quick Fix

**Just use the custom endpoint:**

```powershell
# Replace with your Railway URL
$railwayUrl = "https://edukitecommerce-backend-production.up.railway.app"

# Create admin user
Invoke-RestMethod -Uri "$railwayUrl/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"test123"}'
```

**This is the most reliable method!** 🎉

