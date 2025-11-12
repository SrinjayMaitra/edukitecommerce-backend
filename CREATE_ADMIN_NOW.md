# CREATE ADMIN USER NOW - IMMEDIATE SOLUTION

## Step 1: Wait for Railway to finish deploying
Check Railway dashboard - wait until latest deployment shows "Active"

## Step 2: Run this in PowerShell:

```powershell
Invoke-RestMethod -Uri "https://edukitecommerce-backend-production.up.railway.app/custom/create-first-admin" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@medusa.com","password":"password1234"}'
```

## Step 3: Check the response
You should see:
```json
{
  "success": true,
  "message": "Admin user created successfully with password!",
  "email": "admin@medusa.com",
  "password": "password1234",
  ...
}
```

## Step 4: Log in
Go to: `https://edukitecommerce-backend-production.up.railway.app/app`
- Email: `admin@medusa.com`
- Password: `password1234`

## If it still doesn't work:
Check Railway logs for any errors and share them.

