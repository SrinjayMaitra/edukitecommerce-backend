# Render.com Advanced Settings Configuration

## Pre-Deploy Command (IMPORTANT!)

**Add this in the "Pre-Deploy Command" field:**

```bash
npm run migrate
```

**OR if that doesn't work, use:**

```bash
npx medusa db:migrate
```

**Why:** This runs database migrations before your server starts, creating all the necessary tables (user, auth_identity, provider_identity, etc.). Without this, your app will fail to start because tables don't exist.

---

## Health Check Path

**Current:** `/healthz`

**Change to:** `/health`

**Why:** Medusa v2 uses `/health` as the default health check endpoint, not `/healthz`. This helps Render know your service is running properly.

**OR** leave it as `/healthz` if you want to create a custom health endpoint, but `/health` is simpler.

---

## Auto-Deploy

**Keep as:** "On Commit"

This is perfect - it will automatically deploy whenever you push to your main branch.

---

## Build Filters (Optional)

You can ignore these paths to speed up builds:

**Ignored Paths:**
- `README.md`
- `*.md` (all markdown files)
- `.git/`
- `node_modules/`

But this is optional - not necessary for basic setup.

---

## Summary - What to Set:

### ✅ Pre-Deploy Command:
```
npm run migrate
```

### ✅ Health Check Path:
```
/health
```

### ✅ Auto-Deploy:
```
On Commit (keep default)
```

---

## Why Pre-Deploy Command is Critical

Without running migrations:
- ❌ Database tables won't exist
- ❌ Server will crash on startup
- ❌ You'll see errors like "relation 'user' does not exist"
- ❌ Admin user creation will fail

With Pre-Deploy Command:
- ✅ Migrations run automatically
- ✅ All tables are created
- ✅ Server starts successfully
- ✅ Admin user can be created

---

## Complete Setup Checklist

- [ ] Set Pre-Deploy Command: `npm run migrate`
- [ ] Set Health Check Path: `/health`
- [ ] Set all Environment Variables
- [ ] Create Postgres database
- [ ] Create Redis (Key Value) instance
- [ ] Deploy!




