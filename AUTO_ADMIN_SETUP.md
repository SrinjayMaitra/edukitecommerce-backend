# Automatic Admin Setup on Deployment

The backend is now configured to automatically create an admin user when it starts.

## What Happens on Startup

1. The server checks if an admin user exists
2. If not, it creates one
3. Sets the password (hashed with bcrypt)
4. Marks the user as admin
5. Then starts the server

## Environment Variables

Set these in Railway (Service → Variables):

- `ADMIN_EMAIL` (optional, default: `admin@medusa.com`)
- `ADMIN_PASSWORD` (optional, default: `password1234`)

**Recommended:** Set `ADMIN_PASSWORD` to a secure password in Railway.

## Deployment Steps

1. **Delete everything in Railway** (if redeploying):
   - Delete the service
   - Delete PostgreSQL service (if you want a fresh database)
   - Delete Redis service (if you want a fresh cache)

2. **Redeploy:**
   - Connect your GitHub repo to Railway
   - Add PostgreSQL service
   - Add Redis service
   - Set environment variables:
     - `DATABASE_URL=${{Postgres.DATABASE_URL}}`
     - `REDIS_URL=${{Redis.REDIS_URL}}`
     - `ADMIN_EMAIL=admin@medusa.com` (or your preferred email)
     - `ADMIN_PASSWORD=your-secure-password` (use a strong password!)

3. **Wait for deployment to complete**

4. **Login:**
   - Go to: `https://your-railway-url.up.railway.app/app`
   - Email: `admin@medusa.com` (or your `ADMIN_EMAIL`)
   - Password: `your-secure-password` (or your `ADMIN_PASSWORD`)

## How It Works

The `npm start` command now runs:
1. `npm run ensure-admin` - Creates/updates admin user
2. `medusa start` - Starts the server

This happens automatically on every deployment/restart.




