# 🌐 Using Custom Domain on Railway - Free HTTPS Included!

## ✅ Good News!

**Railway provides FREE HTTPS certificates automatically!** You don't need to buy or configure SSL certificates - Railway handles it for you via Let's Encrypt.

---

## 🎯 Why Use Custom Domain?

### Benefits:
1. ✅ **Avoids Public Suffix List issues** (like `.onrender.com` blocking cookies)
2. ✅ **Professional appearance** (your own domain)
3. ✅ **Better SEO** (if needed)
4. ✅ **Free HTTPS** (Railway provides automatically)
5. ✅ **No cookie blocking** (custom domains work better)

### Current Issue:
- Railway's `.railway.app` domain should work, but custom domain is more reliable
- We still need to fix the password storage issue first

---

## 📋 Step-by-Step: Add Custom Domain to Railway

### Step 1: Get a Domain

If you don't have one:
- **Namecheap** - ~$10/year
- **Google Domains** - ~$12/year
- **Cloudflare** - ~$8/year (includes free privacy)
- **GoDaddy** - ~$12/year

**Or use a subdomain of a domain you already own:**
- `api.yourdomain.com`
- `backend.yourdomain.com`
- `medusa.yourdomain.com`

---

### Step 2: Add Domain in Railway

1. **Go to Railway → Your Service → Settings → Networking**
2. **Click "Custom Domain"** or "Add Domain"
3. **Enter your domain:** `api.yourdomain.com` (or whatever you want)
4. **Railway will show DNS records to add**

---

### Step 3: Configure DNS

Railway will show you DNS records like:

```
Type: CNAME
Name: api (or @ for root domain)
Value: cname.railway.app
```

**Add this DNS record in your domain registrar:**
- **Namecheap:** Advanced DNS → Add New Record
- **Cloudflare:** DNS → Add Record
- **GoDaddy:** DNS Management → Add Record

**Wait 5-15 minutes** for DNS to propagate.

---

### Step 4: Railway Auto-Configures HTTPS

✅ **Railway automatically:**
- Detects your domain
- Requests Let's Encrypt certificate
- Configures HTTPS
- Sets up automatic renewal

**No manual configuration needed!**

---

### Step 5: Update Environment Variables

After domain is active, update CORS:

**In Railway Variables:**
```env
ADMIN_CORS=https://api.yourdomain.com,http://localhost:5173,http://localhost:9000
AUTH_CORS=https://api.yourdomain.com,http://localhost:5173,http://localhost:9000
STORE_CORS=https://your-store-frontend.vercel.app,http://localhost:8000
```

**Replace `api.yourdomain.com` with your actual domain!**

---

## ⚠️ Important Notes

### DNS Propagation Time:
- **Usually:** 5-15 minutes
- **Sometimes:** Up to 24 hours (rare)
- **Check:** Use `nslookup api.yourdomain.com` to verify

### HTTPS Certificate:
- **Automatic:** Railway requests certificate automatically
- **Wait time:** Usually 1-5 minutes after DNS propagates
- **Renewal:** Automatic (no action needed)

### Domain Verification:
Railway might ask you to verify domain ownership by adding a TXT record. Follow Railway's instructions.

---

## 🚨 But First: Fix Password Issue!

**Before setting up custom domain, we need to fix the password storage issue!**

The custom domain will help with cookies, but we still need to:
1. ✅ Fix password storage (check Railway logs after deploying updated code)
2. ✅ Verify auth_identity is created correctly
3. ✅ Then set up custom domain for better reliability

---

## 📋 Quick Setup Checklist

- [ ] Get domain (if you don't have one)
- [ ] Add domain in Railway → Settings → Networking
- [ ] Add CNAME DNS record in domain registrar
- [ ] Wait for DNS propagation (5-15 min)
- [ ] Wait for Railway to issue HTTPS certificate (1-5 min)
- [ ] Update CORS environment variables with new domain
- [ ] Redeploy (Railway auto-redeploys when you update variables)
- [ ] Test login at `https://api.yourdomain.com/app`

---

## 💡 Recommendation

**Do this AFTER fixing the password issue:**
1. First: Fix password storage (deploy updated code, check logs)
2. Then: Set up custom domain for better reliability
3. Finally: Test login with custom domain

**But if you want to set it up now:**
- It won't hurt - Railway's free HTTPS makes it easy
- It might help with cookie issues
- But we still need to fix password storage first

---

## 🎯 Summary

✅ **Railway provides FREE HTTPS** - no need to buy certificates!
✅ **Custom domain helps** - avoids Public Suffix List issues
✅ **Easy setup** - just add DNS record
✅ **But fix password first** - domain won't fix the password storage issue

**Want to set it up now, or fix password issue first?** 🤔

