# Deploying to Medusa Cloud

Medusa Cloud is the official hosting platform for Medusa backends. It's specifically designed for Medusa and handles all the infrastructure automatically.

## Why Medusa Cloud?

✅ **Zero Configuration** - Automatically sets up PostgreSQL, Redis, and S3 storage  
✅ **Auto-scaling** - Handles traffic spikes automatically  
✅ **Built-in Monitoring** - Advanced logging and monitoring tools  
✅ **Automatic Backups** - Database backups handled automatically  
✅ **GitHub Integration** - Auto-deploys on every push  
✅ **Multiple Environments** - Easy staging/production setup  
✅ **No Infrastructure Management** - Focus on building, not managing servers

## Getting Started

### Step 1: Sign Up
1. Go to: **https://cloud.medusajs.com/signup**
2. Create your account (you can use GitHub to sign up)

### Step 2: Connect Your GitHub Repository
1. In Medusa Cloud dashboard, click **"Connect Repository"**
2. Select your `edukitecommerce-backend` repository
3. Authorize Medusa Cloud to access your repo

### Step 3: Configure Your Project
Medusa Cloud will automatically detect your Medusa project and:
- Set up PostgreSQL database
- Set up Redis cache
- Set up S3-compatible storage
- Configure environment variables

### Step 4: Set Environment Variables
In Medusa Cloud dashboard, set these environment variables:

**Required:**
- `DATABASE_URL` - Automatically set by Medusa Cloud
- `REDIS_URL` - Automatically set by Medusa Cloud
- `JWT_SECRET` - Set to a secure random string
- `COOKIE_SECRET` - Set to a secure random string

**CORS Settings:**
- `STORE_CORS` - Your frontend URL (e.g., `http://localhost:8000,https://yourdomain.com`)
- `ADMIN_CORS` - Admin panel URLs (e.g., `http://localhost:5173,https://admin.yourdomain.com`)
- `AUTH_CORS` - Same as ADMIN_CORS

**Admin User (Optional - for auto-setup):**
- `ADMIN_EMAIL` - `admin@medusa.com` (or your email)
- `ADMIN_PASSWORD` - Your secure password

### Step 5: Deploy
1. Medusa Cloud will automatically deploy when you push to your main branch
2. Or click **"Deploy"** button in the dashboard
3. Wait for deployment to complete (usually 2-5 minutes)

### Step 6: Access Your Backend
Once deployed, Medusa Cloud will provide you with:
- **Backend URL**: `https://your-project.medusa-cloud.com`
- **Admin Panel**: `https://your-project.medusa-cloud.com/app`

### Step 7: Create Admin User
After first deployment, you can:

**Option A: Use the API endpoint** (if still available):
```powershell
Invoke-RestMethod -Uri "https://your-project.medusa-cloud.com/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"your-password"}'
```

**Option B: Use Medusa CLI** (if you have access):
```bash
npx medusa user -e admin@medusa.com -p your-password
```

**Option C: Use the middleware** (should run automatically on first request)

## Pricing

Medusa Cloud offers different plans:
- **Free Tier**: For testing and development
- **Starter**: For small projects
- **Professional**: For production apps
- **Enterprise**: For large-scale deployments

Check current pricing at: https://medusajs.com/cloud

## Benefits Over Railway

1. **Medusa-Specific Optimizations** - Built specifically for Medusa
2. **Better Admin User Setup** - Easier first-time setup
3. **Automatic Database Migrations** - Handles migrations automatically
4. **Better Documentation** - More Medusa-specific guides
5. **Support** - Medusa team support for Cloud users
6. **No Port Configuration** - Everything is pre-configured

## Migration from Railway

1. **Export Environment Variables** from Railway
2. **Set them in Medusa Cloud** dashboard
3. **Connect your GitHub repo** to Medusa Cloud
4. **Deploy** - Medusa Cloud will handle the rest
5. **Update your frontend** to point to the new Medusa Cloud URL

## Next Steps

1. Sign up at: https://cloud.medusajs.com/signup
2. Connect your repository
3. Configure environment variables
4. Deploy!

## Support

- **Documentation**: https://docs.medusajs.com/cloud
- **Medusa Discord**: For community support
- **Medusa Support**: For Cloud-specific issues




