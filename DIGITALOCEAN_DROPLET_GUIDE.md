# 🚀 Deploy Medusa to DigitalOcean Droplet

**Complete guide to deploy Medusa backend on a DigitalOcean VPS.**

---

## 💰 Cost Comparison

| Platform | Cost | Setup Time | Maintenance |
|----------|------|------------|-------------|
| **Railway** | $5/month credit | ⭐⭐ 10 min | ⭐⭐ Low |
| **DigitalOcean Droplet** | $6/month | ⭐⭐⭐⭐ 1-2 hours | ⭐⭐⭐ Medium |
| **Render** | Free/$7/month | ⭐⭐ 15 min | ⭐⭐ Low |
| **Fly.io** | Free tier | ⭐⭐⭐ 30 min | ⭐⭐ Low |

---

## ✅ Pros of DigitalOcean Droplet

1. **💰 Cost-Effective** - $6/month for basic droplet (vs $15+/month for managed services)
2. **🔧 Full Control** - Complete server access, install anything you need
3. **📈 Scalable** - Easy to upgrade resources (CPU, RAM, storage)
4. **🌍 Global** - Choose data center location
5. **🔒 Security** - Full control over firewall, SSL, backups
6. **💾 Persistent** - Data stays on your server (no cold starts)
7. **🐳 Docker Support** - Can use Docker Compose for easy setup
8. **📊 Monitoring** - Built-in monitoring and alerts

---

## ❌ Cons of DigitalOcean Droplet

1. **⏱️ Setup Time** - Takes 1-2 hours to set up properly
2. **🛠️ Maintenance** - You're responsible for:
   - Server updates
   - Security patches
   - Database backups
   - SSL certificate renewal
   - Monitoring
3. **📚 Learning Curve** - Need to know:
   - Linux commands
   - Docker/Docker Compose
   - Nginx configuration
   - SSL certificates (Let's Encrypt)
   - Systemd services
4. **🔧 Troubleshooting** - You fix everything yourself
5. **💳 Payment Required** - No free tier (but $6/month is cheap)

---

## 🎯 When to Use DigitalOcean Droplet

**Good for:**
- ✅ Production apps with steady traffic
- ✅ You want full control
- ✅ You're comfortable with Linux/server management
- ✅ Cost is a priority ($6/month is cheaper than managed services)
- ✅ You need custom configurations
- ✅ You want predictable performance (no cold starts)

**Not good for:**
- ❌ Quick prototypes/MVPs
- ❌ You want zero maintenance
- ❌ You're not comfortable with server management
- ❌ You need auto-scaling (use App Platform instead)

---

## 📋 Quick Setup Overview

### Step 1: Create Droplet
1. Sign up at https://digitalocean.com
2. Create Droplet:
   - **OS:** Ubuntu 22.04 LTS
   - **Plan:** Basic ($6/month - 1GB RAM, 1 vCPU)
   - **Region:** Choose closest to your users
   - **Authentication:** SSH keys (recommended) or password

### Step 2: Initial Server Setup
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Create non-root user
adduser medusa
usermod -aG sudo medusa
```

### Step 3: Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Add user to docker group
usermod -aG docker medusa
```

### Step 4: Set Up PostgreSQL & Redis
```bash
# Create docker-compose.yml for databases
cat > docker-compose.db.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: medusa
      POSTGRES_PASSWORD: your-secure-password
      POSTGRES_DB: medusa_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
EOF

# Start databases
docker compose -f docker-compose.db.yml up -d
```

### Step 5: Deploy Medusa Backend
```bash
# Clone your repo
git clone https://github.com/your-username/your-repo.git
cd your-repo/medusa-starter-default

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://medusa:your-secure-password@localhost:5432/medusa_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-64-char-secret-here
COOKIE_SECRET=your-64-char-secret-here
STORE_CORS=https://your-store.vercel.app,http://localhost:8000
ADMIN_CORS=https://your-domain.com,http://localhost:5173
AUTH_CORS=https://your-domain.com,http://localhost:5173
ADMIN_EMAIL=admin@medusa.com
ADMIN_PASSWORD=your-secure-password
TRUST_PROXY=true
NODE_ENV=production
EOF

# Build and start
npm install
npm run build
npm start
```

### Step 6: Set Up Nginx (Reverse Proxy)
```bash
# Install Nginx
apt install nginx -y

# Create Nginx config
cat > /etc/nginx/sites-available/medusa << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/medusa /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 7: Set Up SSL (Let's Encrypt)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your-domain.com

# Auto-renewal (already set up by certbot)
```

### Step 8: Set Up PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start Medusa with PM2
pm2 start npm --name "medusa" -- start
pm2 save
pm2 startup  # Set up auto-start on reboot
```

---

## 🐳 Docker Compose Setup (Recommended)

**Easier approach - use Docker Compose for everything:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: medusa
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: medusa_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  medusa:
    build: .
    ports:
      - "9000:9000"
    environment:
      DATABASE_URL: postgresql://medusa:${POSTGRES_PASSWORD}@postgres:5432/medusa_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      COOKIE_SECRET: ${COOKIE_SECRET}
      STORE_CORS: ${STORE_CORS}
      ADMIN_CORS: ${ADMIN_CORS}
      AUTH_CORS: ${AUTH_CORS}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      TRUST_PROXY: "true"
      NODE_ENV: production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

**Start everything:**
```bash
docker compose up -d
```

---

## 🔒 Security Checklist

- [ ] Set up firewall (UFW)
- [ ] Disable root SSH login
- [ ] Use SSH keys (not passwords)
- [ ] Set up fail2ban
- [ ] Regular system updates
- [ ] SSL certificate (Let's Encrypt)
- [ ] Database backups
- [ ] Strong passwords for all services

---

## 💾 Backup Strategy

**Set up automated backups:**

```bash
# Create backup script
cat > /usr/local/bin/backup-medusa.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/medusa"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec postgres pg_dump -U medusa medusa_db > $BACKUP_DIR/db_$DATE.sql

# Backup Redis (if needed)
docker exec redis redis-cli SAVE
docker cp redis:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-medusa.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-medusa.sh
```

---

## 📊 Monitoring

**Set up monitoring:**

1. **DigitalOcean Monitoring** (built-in)
   - CPU, RAM, Disk usage
   - Network traffic
   - Alerts

2. **PM2 Monitoring** (for Node.js)
   ```bash
   pm2 monit
   pm2 logs
   ```

3. **Application Monitoring**
   - Use Medusa's built-in health endpoint: `/health`
   - Set up UptimeRobot or similar

---

## 🆚 DigitalOcean Droplet vs App Platform

**DigitalOcean Droplet ($6/month):**
- ✅ Cheaper
- ✅ Full control
- ❌ Manual setup
- ❌ You manage everything

**DigitalOcean App Platform ($12+/month):**
- ✅ Managed (like Railway/Render)
- ✅ Auto-scaling
- ✅ Easy setup
- ❌ More expensive
- ❌ Less control

**Recommendation:** Use Droplet if you want control and cost savings. Use App Platform if you want managed service.

---

## 🎯 Recommendation

**For your situation:**

1. **If you want quick deployment:** Stick with Railway ($5/month credit)
2. **If you want cost savings:** Use DigitalOcean Droplet ($6/month)
3. **If you want zero maintenance:** Use Railway/Render
4. **If you want full control:** Use DigitalOcean Droplet

---

## 📚 Resources

- DigitalOcean Docs: https://docs.digitalocean.com
- Medusa Deployment: https://docs.medusajs.com/deployments/server
- Docker Compose: https://docs.docker.com/compose
- Let's Encrypt: https://letsencrypt.org

---

## ✅ Quick Start Script

I can create a complete setup script that:
1. Sets up the server
2. Installs Docker & Docker Compose
3. Deploys Medusa with databases
4. Configures Nginx
5. Sets up SSL
6. Configures PM2

**Would you like me to create this?**

---

**Bottom line:** DigitalOcean Droplet is great if you want control and cost savings, but requires more setup and maintenance than Railway/Render.

