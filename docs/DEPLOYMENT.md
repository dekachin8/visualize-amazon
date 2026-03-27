# DEPLOYMENT.md - Production Deployment Guide

Complete guide to deploying VISUALIZE Amazon system to production.

## Deployment Platforms

### Recommended: Vercel (Easy)

Vercel is the easiest path to production. It's optimized for Next.js and handles most setup automatically.

**Advantages:**
- One-click deployment from GitHub
- Automatic HTTPS, CDN, backups
- Built-in cron job support for data sync
- Free tier available for low traffic
- Automatic preview deployments on PRs

### Alternative: Self-Hosted

Deploy to your own server if you need full control.

---

## Option 1: Vercel Deployment (Recommended)

### Prerequisites

- GitHub account with project repo
- Vercel account (free tier OK)
- All environment variables ready

### Step 1: Connect GitHub Repository

1. Push code to GitHub:
```bash
git push origin main
```

2. Visit [vercel.com](https://vercel.com)
3. Click **New Project**
4. Select your GitHub repo: `visualize-amazon`
5. Click **Import**

### Step 2: Configure Environment Variables

In Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add each variable from `.env.example`:
   - `AMAZON_SELLING_PARTNER_API_KEY`
   - `AMAZON_SELLING_PARTNER_API_SECRET`
   - `AMAZON_REFRESH_TOKEN`
   - `AMAZON_SELLER_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel domain)

3. Click **Save**

### Step 3: Configure Cron Jobs

Vercel will read `vercel.json` automatically:

```json
{
  "crons": [
    {
      "path": "/api/sync/amazon",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/backup/run",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

This configuration is already in your project. It will:
- Sync Amazon data daily at 2 AM UTC
- Run backups weekly on Sundays at 3 AM UTC

### Step 4: Deploy

Click **Deploy** button in Vercel dashboard.

Vercel will:
1. Clone your repo
2. Install dependencies
3. Build the project
4. Deploy to CDN
5. Provide a live URL

Your app is now live! 🎉

### Step 5: Set Production Domain (Optional)

To use a custom domain:

1. In Vercel → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Verify domain ownership

---

## Option 2: Self-Hosted Deployment

### Prerequisites

- Linux server (Ubuntu 20+ recommended)
- Node.js 18+
- PostgreSQL (for Supabase alternative)
- PM2 (process manager)
- Nginx (reverse proxy)

### Step 1: Set Up Server

```bash
# SSH into your server
ssh user@your-server.com

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Step 2: Clone and Configure

```bash
# Clone repo
git clone https://github.com/[username]/visualize-amazon.git
cd visualize-amazon

# Install dependencies
npm install

# Create production .env file
cp .env.example .env.production
nano .env.production
# Add all production credentials
```

### Step 3: Build Application

```bash
npm run build
```

### Step 4: Start with PM2

```bash
# Start app
pm2 start "npm run start" --name visualize-amazon

# Save PM2 config for restart on reboot
pm2 startup
pm2 save
```

### Step 5: Configure Nginx

Create `/etc/nginx/sites-available/visualize-amazon`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/visualize-amazon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Set Up SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Step 7: Configure Cron Jobs

For automatic data sync, add to crontab:

```bash
crontab -e
```

Add these lines:

```
# Sync Amazon data daily at 2 AM UTC
0 2 * * * curl -X POST https://your-domain.com/api/sync/amazon -H "Authorization: Bearer YOUR_CRON_SECRET"

# Backup weekly on Sundays at 3 AM UTC
0 3 * * 0 curl -X POST https://your-domain.com/api/backup/run -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Set `YOUR_CRON_SECRET` in `.env.production`:

```
CRON_SECRET=your-secure-random-string
```

### Step 8: Monitor Application

```bash
# View logs
pm2 logs visualize-amazon

# Monitor status
pm2 monit

# View all processes
pm2 status
```

---

## Database Setup (Supabase)

### Option A: Supabase Cloud (Easiest)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy URL and keys to environment variables
4. Run migrations: `npm run migrate`

### Option B: Self-Hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create database
sudo -u postgres createdb visualize_amazon

# Create user
sudo -u postgres createuser -P visualize_user
# Set password when prompted

# Grant permissions
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE visualize_amazon TO visualize_user;"

# Run migrations
npm run migrate
```

---

## Post-Deployment Checklist

- [ ] Environment variables set in production
- [ ] Database migrations completed
- [ ] SSL certificate installed
- [ ] Cron jobs configured and tested
- [ ] Backups configured and tested
- [ ] Monitoring set up (PM2, Vercel logs)
- [ ] Data sync test completed manually
- [ ] Application responding to requests
- [ ] Logs reviewed for errors
- [ ] Uptime monitoring configured (optional)

## Testing Production

```bash
# Test API connectivity
curl https://your-domain.com/api/health

# Manual sync test
curl -X POST https://your-domain.com/api/sync/amazon \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Check backup
curl -X POST https://your-domain.com/api/backup/run \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Monitoring & Maintenance

### View Logs

**Vercel:**
- Dashboard → **Deployments** → **Runtime logs**

**Self-hosted:**
```bash
pm2 logs visualize-amazon
tail -f /var/log/nginx/error.log
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild
npm run build

# Restart (Vercel auto-redeploys)
# or (Self-hosted)
pm2 restart visualize-amazon
```

### Backup & Recovery

Backups run automatically on Sundays at 3 AM UTC.

**Manual backup:**
```bash
npm run backup
```

**Restore from backup:**
```bash
node scripts/restore-backup.js path/to/backup.json
```

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs visualize-amazon

# Verify Node.js is installed
node --version

# Check port 3000 isn't in use
lsof -i :3000
```

### Cron Jobs Not Running
- Verify cron syntax: https://crontab.guru
- Check server time is correct: `date`
- Verify API endpoint is accessible: `curl https://your-domain.com/api/health`

### Database Connection Failed
- Test connection: `psql postgresql://user:password@host/dbname`
- Verify credentials in environment variables
- Check firewall allows database connections

### SSL Certificate Expired
```bash
sudo certbot renew
```

(This runs automatically, but can be forced with the command above)

---

## Scaling Considerations

For larger datasets or higher traffic:

1. **Database**: Upgrade Supabase plan or add replicas
2. **Caching**: Add Redis for frequently-accessed data
3. **CDN**: Vercel includes CDN; self-hosted can use Cloudflare
4. **Load Balancing**: Run multiple app instances behind load balancer (self-hosted only)

See `docs/PROJECT_STRUCTURE.md` for current architecture.

---

**Need help?** Check logs, review this guide, or ask for assistance.
