# Debug Admin Login - Step by Step

## Step 1: Check if Admin User Was Created

### Option A: Check Railway/Render Logs

Look for these log messages:
- `[Middleware] Admin user ready!`
- `✅ Admin user created with password!`
- `Creating auth identity with plain text password`

If you see these, the user was created. If not, continue to Step 2.

### Option B: Call the API Endpoint Directly

Run this in PowerShell (replace with your actual URL):

```powershell
Invoke-RestMethod -Uri "https://your-backend-url/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"password1234"}'
```

**Check the response:**
- If you see `"success": true` → User was created
- If you see an error → Share the error message

---

## Step 2: Verify Environment Variables

Make sure these are set in your backend service:

```
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=password1234
```

**Check:** Go to your service → Variables tab → Verify both are set

---

## Step 3: Check Database Connection

Make sure `DATABASE_URL` is set correctly:
- Should be the **Internal Database URL** from your Postgres service
- Format: `postgresql://user:password@host/database`

---

## Step 4: Try Creating Admin User Again

If the user exists but login fails, delete and recreate:

**Call the endpoint again** - it will delete the existing user and create a new one:

```powershell
Invoke-RestMethod -Uri "https://your-backend-url/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"password1234"}'
```

---

## Step 5: Check What's Actually in the Database

If you have database access, check:

```sql
-- Check if user exists
SELECT id, email FROM "user" WHERE email = 'admin@medusa.com';

-- Check auth identity
SELECT ai.id, pi.provider, pi.provider_metadata 
FROM auth_identity ai 
JOIN provider_identity pi ON pi.auth_identity_id = ai.id 
JOIN "user" u ON u.id = pi.entity_id 
WHERE u.email = 'admin@medusa.com';
```

---

## Common Issues

### Issue 1: Middleware Didn't Run
**Solution:** Make a request to any endpoint first, then try login

### Issue 2: Password Stored Incorrectly
**Solution:** Call the API endpoint to recreate with correct password

### Issue 3: User Exists But No Auth Identity
**Solution:** Call the API endpoint - it will create the auth identity

### Issue 4: Wrong Environment Variables
**Solution:** Double-check ADMIN_EMAIL and ADMIN_PASSWORD match what you're using to login

---

## Quick Fix Command

Run this to force-create the admin user:

```powershell
Invoke-RestMethod -Uri "https://your-backend-url/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"password1234"}'
```

Then immediately try logging in again.




