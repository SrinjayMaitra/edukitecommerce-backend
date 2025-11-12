# How to Create Admin User for Medusa Backend

## Method 1: Using Railway Console

1. **In Railway → Your App Service → Settings**
2. **Open the Console/Terminal**
3. **Run:**
   ```bash
   npx medusa user -e admin@yourdomain.com -p YourSecurePassword123
   ```

## Method 2: Using Railway CLI

If you have Railway CLI installed locally:

```bash
railway run npx medusa user -e admin@yourdomain.com -p YourSecurePassword123
```

## Method 3: Add to Deployment Script

You can add this to your deployment process, but it will create a new user each time (not recommended for production).

## Default Credentials (if seed was run)

If you ran the seed command, try:
- **Email:** `admin@medusa-test.com`
- **Password:** `supersecret`

However, the seed script in this project doesn't create an admin user, so you'll need to create one manually.

## After Creating User

1. Go to: `https://edukitecommerce-backend-production.up.railway.app/app`
2. Log in with the credentials you created


