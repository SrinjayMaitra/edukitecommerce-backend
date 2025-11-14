# 🚀 Complete Fly.io Deployment Guide for Medusa

**Step-by-step guide to deploy Medusa to Fly.io with PostgreSQL, Redis, and all environment variables configured correctly.**

---

## 📋 Prerequisites

- ✅ GitHub account (your code should be pushed to GitHub)
- ✅ Fly.io account (sign up at https://fly.io - free, no credit card needed)
- ✅ Docker Desktop installed (for local testing, optional)

---

## Step 1: Install Fly CLI

**Windows PowerShell (Run as Administrator):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Verify installation:**
```powershell
fly version
```

**If you get an error**, download manually from: https://fly.io/docs/hands-on/install-flyctl/

---

## Step 2: Login to Fly.io

```powershell
fly auth login
```

This will open your browser. Sign in with GitHub or email.

**Verify login:**
```powershell
fly auth whoami
```

---

## Step 3: Navigate to Project Directory

```powershell
cd medusa-starter-default
```

---

## Step 4: Create Fly.io App

```powershell
fly launch
```

**Follow the prompts:**

1. **App name:** 
   - Press Enter for auto-generated name, OR
   - Enter custom name: `your-medusa-backend` (lowercase, hyphens only)

2. **Region:** 
   - Choose closest to you (e.g., `iad` for US East, `lhr` for London, `sin` for Singapore)

3. **PostgreSQL:** 
   - **Type:** `y` (Yes)
   - **App name:** Press Enter (auto-generated)

4. **Redis:** 
   - **Type:** `y` (Yes) - Recommended for Medusa
   - **App name:** Press Enter (auto-generated)

5. **Deploy now?** 
   - **Type:** `n` (No) - We'll configure environment variables first

---

## Step 5: Get Database and Redis URLs

After `fly launch`, Fly.io creates PostgreSQL and Redis apps. Get their connection URLs:

### Get PostgreSQL URL:
```powershell
fly postgres connect -a your-postgres-app-name
```

**OR** get the connection string:
```powershell
fly postgres connect -a your-postgres-app-name --command "echo \$DATABASE_URL"
```

**Better method - Get from Fly.io dashboard:**
1. Go to https://fly.io/dashboard
2. Click on your PostgreSQL app
3. Go to "Secrets" tab
4. Copy the `DATABASE_URL` value

### Get Redis URL:
```powershell
fly redis connect -a your-redis-app-name
```

**OR** get from dashboard:
1. Go to https://fly.io/dashboard
2. Click on your Redis app
3. Go to "Secrets" tab
4. Copy the `REDIS_URL` value

**Format:** `redis://default:password@hostname:port`

---

## Step 6: Generate Secrets

**Generate JWT_SECRET:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Generate COOKIE_SECRET (different from JWT_SECRET):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Save both secrets** - you'll need them in the next step!

---

## Step 7: Set All Environment Variables

**Replace these values:**
- `your-postgres-url` → Your PostgreSQL DATABASE_URL from Step 5
- `your-redis-url` → Your Redis REDIS_URL from Step 5
- `your-jwt-secret` → JWT_SECRET from Step 6
- `your-cookie-secret` → COOKIE_SECRET from Step 6
- `your-app-name` → Your Fly.io app name from Step 4

```powershell
# Database & Cache
fly secrets set DATABASE_URL="your-postgres-url" -a your-app-name
fly secrets set REDIS_URL="your-redis-url" -a your-app-name

# Security Secrets
fly secrets set JWT_SECRET="your-jwt-secret" -a your-app-name
fly secrets set COOKIE_SECRET="your-cookie-secret" -a your-app-name

# CORS Configuration (IMPORTANT: Include your Fly.io URL!)
fly secrets set STORE_CORS="http://localhost:8000,http://localhost:3000" -a your-app-name
fly secrets set ADMIN_CORS="http://localhost:5173,http://localhost:9000,https://your-app-name.fly.dev" -a your-app-name
fly secrets set AUTH_CORS="http://localhost:5173,http://localhost:9000,https://your-app-name.fly.dev" -a your-app-name

# Admin User (for auto-creation)
fly secrets set ADMIN_EMAIL="admin@medusa.com" -a your-app-name
fly secrets set ADMIN_PASSWORD="test123" -a your-app-name

# CRITICAL: Trust Proxy (fixes 401 errors)
fly secrets set TRUST_PROXY="true" -a your-app-name

# Node Environment
fly secrets set NODE_ENV="production" -a your-app-name
```

**⚠️ IMPORTANT:** Replace `your-app-name.fly.dev` with your actual app name!

---

## Step 8: Create fly.toml (If Not Created)

If `fly launch` didn't create `fly.toml`, create it:

```powershell
New-Item -Path "fly.toml" -ItemType File -Force
```

Then add this content (replace `your-app-name`):

```toml
app = "your-app-name"
primary_region = "iad"

[build]

[env]
  NODE_ENV = "production"
  PORT = "9000"

[http_service]
  internal_port = 9000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[services]]
  protocol = "tcp"
  internal_port = 9000

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

---

## Step 9: Create Dockerfile (If Not Exists)

Check if Dockerfile exists:
```powershell
Test-Path Dockerfile
```

If it doesn't exist, create it:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 9000

# Start the application
CMD ["npm", "start"]
```

---

## Step 10: Deploy to Fly.io

```powershell
fly deploy -a your-app-name
```

**This will:**
1. Build your Docker image
2. Push to Fly.io registry
3. Deploy your app
4. Start the app

**Wait 2-3 minutes** for deployment to complete.

---

## Step 11: Verify Deployment

**Check app status:**
```powershell
fly status -a your-app-name
```

**Check logs:**
```powershell
fly logs -a your-app-name
```

**Open your app:**
```
https://your-app-name.fly.dev
```

**Admin panel:**
```
https://your-app-name.fly.dev/app
```

---

## Step 12: Create Admin User

**Option 1: Via Shell (Recommended)**
```powershell
fly ssh console -a your-app-name -C "npx medusa user --email admin@medusa.com --password test123"
```

**Option 2: Via Custom Endpoint**
If you have the `/custom/create-first-admin` endpoint:
```powershell
$body = @{
    email = "admin@medusa.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-app-name.fly.dev/custom/create-first-admin" -Method POST -Body $body -ContentType "application/json" -Headers @{"x-admin-setup-secret"="your-secret-if-set"}
```

---

## Step 13: Test Login

1. Go to: `https://your-app-name.fly.dev/app`
2. Login with:
   - Email: `admin@medusa.com`
   - Password: `test123`
3. Check DevTools → Application → Cookies
   - Should see `_medusa_jwt` cookie

---

## 🔧 Troubleshooting

### Error: "No Dockerfile found"
**Solution:** Create Dockerfile (see Step 9)

### Error: "DATABASE_URL not set"
**Solution:** Run Step 7 again, make sure you're using `-a your-app-name`

### Error: "401 Unauthorized" on login
**Solutions:**
1. Verify `TRUST_PROXY=true` is set: `fly secrets list -a your-app-name`
2. Check CORS includes your Fly.io URL: `fly secrets list -a your-app-name`
3. Check logs: `fly logs -a your-app-name`

### Error: "Cannot connect to database"
**Solutions:**
1. Verify PostgreSQL app is running: `fly status -a your-postgres-app-name`
2. Check DATABASE_URL format: `postgresql://user:pass@host:port/db`
3. Make sure PostgreSQL and app are in same organization

### Error: "Port 9000 already in use" (local)
**Solution:** This is fine - Fly.io uses port 9000 internally

### App won't start
**Check logs:**
```powershell
fly logs -a your-app-name
```

**Common issues:**
- Missing environment variables
- Database connection failed
- Build errors

---

## 📝 Quick Reference Commands

```powershell
# List all secrets
fly secrets list -a your-app-name

# View app status
fly status -a your-app-name

# View logs
fly logs -a your-app-name

# SSH into app
fly ssh console -a your-app-name

# Open app in browser
fly open -a your-app-name

# Scale app (if needed)
fly scale count 1 -a your-app-name

# Restart app
fly apps restart your-app-name
```

---

## ✅ Success Checklist

- [ ] Fly CLI installed
- [ ] Logged into Fly.io
- [ ] App created with `fly launch`
- [ ] PostgreSQL created and URL obtained
- [ ] Redis created and URL obtained
- [ ] All environment variables set
- [ ] `fly.toml` configured
- [ ] Dockerfile created
- [ ] App deployed successfully
- [ ] Admin user created
- [ ] Login works at `/app`
- [ ] Cookies are set in browser

---

## 🎉 You're Done!

Your Medusa backend is now running on Fly.io at:
```
https://your-app-name.fly.dev
```

Admin panel:
```
https://your-app-name.fly.dev/app
```

---

## 💡 Pro Tips

1. **Free Tier Limits:**
   - 3 shared-cpu VMs
   - 3GB persistent storage
   - 160GB outbound data/month

2. **Scaling:**
   - Apps auto-sleep after inactivity
   - Auto-wake on first request (may take 10-30 seconds)

3. **Custom Domain:**
   - Go to Fly.io dashboard → Your app → Settings → Domains
   - Add your custom domain
   - Update CORS to include custom domain

4. **Monitoring:**
   - View metrics: `fly metrics -a your-app-name`
   - View logs: `fly logs -a your-app-name`

---

## 🆘 Need Help?

- Fly.io Docs: https://fly.io/docs
- Fly.io Discord: https://fly.io/discord
- Medusa Docs: https://docs.medusajs.com

