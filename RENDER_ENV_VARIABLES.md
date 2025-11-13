# Environment Variables for Render.com Deployment

## Required Environment Variables

Copy these into your Render.com Web Service → Environment section:

### Database & Cache
```
DATABASE_URL=postgresql://user:password@host:port/database
```
**How to get:** After creating Postgres database on Render, copy the "Internal Database URL" from the database service.

```
REDIS_URL=redis://default:password@host:port
```
**How to get:** After creating Key Value (Redis) instance on Render, copy the "Internal Redis URL" from the Redis service.

---

### Security Secrets
```
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
```
**Generate:** Use a long random string (at least 32 characters). You can use: https://randomkeygen.com/

```
COOKIE_SECRET=your-super-secret-cookie-key-change-this-to-random-string
```
**Generate:** Use a different long random string (at least 32 characters).

---

### CORS Configuration

**⚠️ CRITICAL:** These must match your actual frontend URLs exactly!

```
STORE_CORS=http://localhost:8000,http://localhost:3000,https://yourdomain.com
```
**Replace with:** Your store frontend URLs (comma-separated). Add your production domain when ready.

```
ADMIN_CORS=http://localhost:5173,http://localhost:9000,https://admin.yourdomain.com
```
**Replace with:** Your admin panel URLs (comma-separated). **MUST include your production admin frontend URL!**

**Example if admin is on Vercel:**
```
ADMIN_CORS=https://edukitecommerce-admin.vercel.app,http://localhost:5173,http://localhost:9000
```

```
AUTH_CORS=http://localhost:5173,http://localhost:9000,https://admin.yourdomain.com
```
**Same as ADMIN_CORS** - URLs where authentication requests can come from. **Must match ADMIN_CORS exactly!**

**⚠️ Common Mistakes:**
- Forgetting to add production URL to ADMIN_CORS
- Using `http://` instead of `https://` in production
- Typos in URLs (extra spaces, wrong domain)
- AUTH_CORS not matching ADMIN_CORS

---

### Admin User Auto-Setup (Optional but Recommended)
```
ADMIN_EMAIL=admin@medusa.com
```
**Change to:** Your preferred admin email.

```
ADMIN_PASSWORD=your-secure-password-here
```
**Change to:** A strong password (at least 12 characters, mix of letters, numbers, symbols).

---

### Optional: Admin Setup Secret (For Security)
```
ADMIN_SETUP_SECRET=supersecret
```
**Optional:** If set, the `/custom/create-first-admin` endpoint will require this secret. Leave empty if you want it fully public (not recommended for production).

---

### ⚠️ CRITICAL: Trust Proxy Headers (Production Fix)

**Required for production deployments behind reverse proxy (Railway, Render, Fly.io):**

```
TRUST_PROXY=true
```

**Why this is needed:**
- Medusa v2.6.0+ requires this to properly handle X-Forwarded headers
- Without it, cookies won't be set correctly in production
- Causes 401 Unauthorized errors on `/admin/users/me`
- See [GitHub Issue #11769](https://github.com/medusajs/medusa/issues/11769) for details

**When to set:**
- ✅ Always set to `true` in production
- ✅ Required when using Railway, Render, Fly.io, or any reverse proxy
- ❌ Not needed for local development

---

### ⚠️ CRITICAL: Admin Frontend Configuration

**If you're using a separate admin frontend (e.g., Vercel/Next.js), you MUST set this in your frontend environment:**

```
MEDUSA_ADMIN_BACKEND_URL=https://your-backend.onrender.com
```

**⚠️ IMPORTANT:** 
- This must point to your **BACKEND API URL** (e.g., `https://your-backend.onrender.com`)
- **NOT** your admin frontend URL (e.g., `https://admin.vercel.app`)
- This is a common mistake that causes login failures!

**Where to set:**
- In your **admin frontend** (Vercel/Next.js) environment variables
- NOT in your backend environment variables

**Example:**
- Backend URL: `https://medusa-backend.onrender.com`
- Admin Frontend URL: `https://admin.vercel.app`
- Set in **Vercel** (admin frontend): `MEDUSA_ADMIN_BACKEND_URL=https://medusa-backend.onrender.com`

---

## Complete Example (Copy-Paste Ready)

Replace the placeholders with your actual values:

```bash
# Database (from Render Postgres service)
DATABASE_URL=postgresql://render_user:password@dpg-xxxxx-a.oregon-postgres.render.com/medusa_db

# Redis (from Render Key Value service)
REDIS_URL=redis://red-xxxxx:6379

# Security Secrets (GENERATE NEW RANDOM STRINGS!)
JWT_SECRET=your-random-jwt-secret-minimum-32-characters-long
COOKIE_SECRET=your-random-cookie-secret-minimum-32-characters-long

# CORS (adjust URLs to match your frontend)
STORE_CORS=http://localhost:8000,http://localhost:3000
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:5173,http://localhost:9000

# Admin User (change these!)
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=ChangeThisToSecurePassword123!

# Optional: Setup Secret
ADMIN_SETUP_SECRET=supersecret
```

---

## How to Set in Render.com

1. Go to your **Web Service** on Render
2. Click on **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add each variable one by one:
   - **Key:** `DATABASE_URL`
   - **Value:** (paste from Postgres service)
5. Repeat for all variables

---

## Quick Setup Steps

### Step 1: Create Postgres Database
1. Click "New +" → "Postgres"
2. Name: `medusa-db`
3. Plan: **Free**
4. Copy **"Internal Database URL"**

### Step 2: Create Redis (Key Value)
1. Click "New +" → "Key Value Instance"
2. Name: `medusa-redis`
3. Plan: **Free**
4. Copy **"Internal Redis URL"**

### Step 3: Set Environment Variables
In your Web Service → Environment, add all the variables above.

### Step 4: Deploy
Render will automatically deploy with your new environment variables.

---

## Generate Secure Secrets

You can generate secure random strings using:

**Option 1: Online Generator**
- https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" - copy one for JWT_SECRET, another for COOKIE_SECRET

**Option 2: PowerShell (Windows)**
```powershell
# Generate JWT_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Generate COOKIE_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Option 3: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Important Notes

1. **Never commit secrets to Git** - Render environment variables are secure
2. **Use different secrets** for JWT_SECRET and COOKIE_SECRET
3. **Update CORS URLs** when you deploy your frontend
4. **Change ADMIN_PASSWORD** to something secure
5. **DATABASE_URL and REDIS_URL** are automatically provided by Render - just copy them from the service dashboards

---

## After Setting Variables

1. **Save** all environment variables
2. **Redeploy** your service (Render will do this automatically)
3. **Wait** for deployment to complete
4. **Create admin user** using:
   ```powershell
   Invoke-RestMethod -Uri "https://your-service.onrender.com/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"your-password"}'
   ```
5. **Login** at: `https://your-service.onrender.com/app`


