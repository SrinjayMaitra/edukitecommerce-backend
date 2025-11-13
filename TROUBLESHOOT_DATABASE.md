# Troubleshooting Database Connection Issues

## Problem
`railway run` command can't connect to the database - getting "Pg connection failed" errors.

## Possible Causes

1. **DATABASE_URL not set correctly in Railway**
2. **Database service not running**
3. **Database connection timeout**
4. **Network/firewall issues**

## Solutions

### Solution 1: Check Database Service Status

1. **In Railway Dashboard → Your Project**
2. **Check if PostgreSQL service is running** (should show "Active" or "Online")
3. **If it's stopped, start it**

### Solution 2: Verify DATABASE_URL

1. **In Railway → Your App Service → Variables tab**
2. **Check `DATABASE_URL`:**
   - Should show actual connection string: `postgresql://postgres:password@host:port/database`
   - Should NOT show: `${{Postgres.DATABASE_URL}}` (literal text)
3. **If it shows literal text, the service isn't connected properly**

### Solution 3: Try Creating User via Railway Console

Instead of `railway run`, use Railway's web console:

1. **In Railway → Your App Service**
2. **Go to "Settings" or find "Console" option**
3. **Open the terminal/console**
4. **Run:**
   ```bash
   npx medusa user -e admin@yourdomain.com -p YourPassword123
   ```

### Solution 4: Check Database Connection from Railway

1. **In Railway → PostgreSQL Service**
2. **Check if it's running and accessible**
3. **Verify the connection string format**

### Solution 5: Wait and Retry

Sometimes the database needs a moment to be ready:
- Wait 30-60 seconds
- Try the command again





