# Deploy Medusa to Fly.io (Free + Shell Access)

Fly.io offers a truly free tier with shell access, perfect for running Medusa CLI commands.

## Why Fly.io?

✅ **Truly Free** - No payment method required  
✅ **Shell Access** - Run `npx medusa user` directly  
✅ **3 Free VMs** - Enough for backend + database  
✅ **PostgreSQL Available** - Free tier included  
✅ **Global Edge Network** - Fast worldwide  

## Quick Setup

### Step 1: Install Fly CLI

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Or download from:** https://fly.io/docs/hands-on/install-flyctl/

### Step 2: Login to Fly.io

```powershell
fly auth login
```

This will open a browser for authentication.

### Step 3: Create Fly.io App

```powershell
cd medusa-starter-default
fly launch
```

Follow the prompts:
- **App name:** (auto-generated or choose one)
- **Region:** Choose closest to you
- **PostgreSQL:** Yes (creates free database)
- **Redis:** Optional (can add later)

### Step 4: Configure Environment Variables

```powershell
fly secrets set DATABASE_URL="your-postgres-url"
fly secrets set REDIS_URL="your-redis-url"  # if you added Redis
fly secrets set JWT_SECRET="your-random-secret"
fly secrets set COOKIE_SECRET="your-random-secret"
fly secrets set STORE_CORS="http://localhost:8000"
fly secrets set ADMIN_CORS="http://localhost:5173"
fly secrets set AUTH_CORS="http://localhost:5173"
fly secrets set ADMIN_EMAIL="admin@medusa.com"
fly secrets set ADMIN_PASSWORD="password1234"
fly secrets set TRUST_PROXY="true"  # CRITICAL: Fixes 401 errors in production
```

### Step 5: Deploy

```powershell
fly deploy
```

### Step 6: Create Admin User via Shell

Once deployed, SSH into your app:

```powershell
fly ssh console -a your-app-name
```

Then run:

```bash
cd medusa-starter-default
npx medusa user --email admin@medusa.com --password password1234
```

**OR** run it directly from your local machine:

```powershell
fly ssh console -a your-app-name -C "cd medusa-starter-default && npx medusa user --email admin@medusa.com --password password1234"
```

## Alternative: One-Line Command

Run this from your local PowerShell (replace `your-app-name`):

```powershell
fly ssh console -a your-app-name -C "npx medusa user --email admin@medusa.com --password password1234"
```

## Access Your Backend

After deployment, your backend will be at:
```
https://your-app-name.fly.dev
```

Admin panel:
```
https://your-app-name.fly.dev/app
```

## Benefits of Fly.io

1. **Shell Access** - Run any command you need
2. **Free Tier** - No credit card required
3. **PostgreSQL Included** - Free database
4. **Fast Deployments** - Usually 2-3 minutes
5. **Global Network** - Fast worldwide

## Troubleshooting

### If `fly launch` fails:
- Make sure you're in the `medusa-starter-default` directory
- Check that Docker is installed (Fly uses Docker)

### If shell access doesn't work:
- Make sure app is deployed: `fly status`
- Try: `fly ssh console -a your-app-name`

### If Medusa CLI command fails:
- Make sure you're in the right directory in the shell
- Check that DATABASE_URL is set correctly

### If login fails with 401 Unauthorized:
- **CRITICAL:** Make sure `TRUST_PROXY=true` is set (see Step 4)
- This is required for Medusa v2.6.0+ in production
- See [X_FORWARDED_HEADERS_FIX.md](./X_FORWARDED_HEADERS_FIX.md) for details

## Next Steps

1. Install Fly CLI
2. Run `fly launch`
3. Set environment variables
4. Deploy
5. Run `npx medusa user` via shell
6. Login at `/app`

This should work! Fly.io gives you the shell access you need to run Medusa CLI commands directly.


