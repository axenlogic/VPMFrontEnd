# VPS Deployment Guide

Quick deployment guide for updating the frontend on your VPS.

---

## Quick Deploy (One Command)

**For CentOS/RHEL** (as root):

```bash
cd /root/medicalCareFrontend && echo "VITE_API_BASE_URL=/api" > .env.production && echo "VITE_ENV=production" >> .env.production && git pull origin main && npm install && rm -rf dist node_modules/.vite && npm run build -- --mode production && cp -r dist/* /var/www/medicalcare-frontend/ && chown -R nginx:nginx /var/www/medicalcare-frontend && chmod -R 755 /var/www/medicalcare-frontend && nginx -t && systemctl reload nginx
```

**For Debian/Ubuntu**:

```bash
cd /root/medicalCareFrontend && git pull origin main && npm install && npm run build && sudo cp -r dist/* /var/www/medicalcare-frontend/ && sudo chown -R www-data:www-data /var/www/medicalcare-frontend && sudo nginx -t && sudo systemctl reload nginx
```

---

## Step-by-Step Deployment

### 1. SSH into VPS

```bash
ssh root@your-vps-ip
```

### 2. Navigate to Project Directory

```bash
cd /root/medicalCareFrontend
```

### 3. Pull Latest Changes

```bash
git pull origin main
```

### 4. Ensure Production Environment File

```bash
# Check if .env.production exists
cat .env.production

# If not exists or needs update:
echo "VITE_API_BASE_URL=/api" > .env.production
echo "VITE_ENV=production" >> .env.production
```

### 5. Install Dependencies (if needed)

```bash
npm install
```

### 6. Build Production Bundle

**IMPORTANT:** Build with explicit production mode to ensure `.env.production` is used:

```bash
# Clean old build first
rm -rf dist node_modules/.vite

# Build in production mode
npm run build -- --mode production
```

**Verify the build contains production URL:**

```bash
# Should NOT find localhost
grep -r "localhost:8000" dist/ || echo "✅ No localhost found"

# Should find production URL
grep -r "/api" dist/ && echo "✅ Production URL found"
```

This creates optimized files in `dist/` directory.

### 7. Copy to Web Directory

```bash
# Ensure web directory exists
sudo mkdir -p /var/www/medicalcare-frontend

# Copy built files
sudo cp -r dist/* /var/www/medicalcare-frontend/
```

### 8. Set Permissions

**For CentOS/RHEL:**

```bash
sudo chown -R nginx:nginx /var/www/medicalcare-frontend
sudo chmod -R 755 /var/www/medicalcare-frontend
```

**For Debian/Ubuntu:**

```bash
sudo chown -R www-data:www-data /var/www/medicalcare-frontend
sudo chmod -R 755 /var/www/medicalcare-frontend
```

**Find your web server user:**

```bash
# Check Nginx user
ps aux | grep nginx | head -1

# Or check Nginx config
grep "^user" /etc/nginx/nginx.conf
```

### 9. Reload Nginx

```bash
# Test configuration first
sudo nginx -t

# Reload if test passes
sudo systemctl reload nginx
```

### 10. Verify Deployment

```bash
# Check if files are there
ls -la /var/www/medicalcare-frontend

# Test in browser
curl -I https://dashboard.vpmforschools.org
```

---

## Automated Deployment Script

### Option 1: Copy Script to VPS

1. Copy `deploy-vps.sh` to your VPS
2. Make it executable:
   ```bash
   chmod +x deploy-vps.sh
   ```
3. Run it:
   ```bash
   ./deploy-vps.sh
   ```

### Option 2: Create Script on VPS

On your VPS, create `deploy.sh`:

```bash
nano deploy.sh
```

Paste (for CentOS/RHEL):

```bash
#!/bin/bash
cd /root/medicalCareFrontend
git pull origin main
npm install
npm run build
cp -r dist/* /var/www/medicalcare-frontend/
chown -R nginx:nginx /var/www/medicalcare-frontend
chmod -R 755 /var/www/medicalcare-frontend
nginx -t && systemctl reload nginx
echo "✅ Deployment complete!"
```

Or for Debian/Ubuntu:

```bash
#!/bin/bash
cd /root/medicalCareFrontend
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/medicalcare-frontend/
sudo chown -R www-data:www-data /var/www/medicalcare-frontend
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Deployment complete!"
```

Make executable and run:

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Nginx API Proxy (Cloud Run)

The frontend now calls the backend via the relative path `/api`. Ensure your HTTPS server block contains this proxy so requests reach the new Cloud Run instance (`https://medicalcare-api-52493984131.us-central1.run.app`):

```nginx
location /api/ {
    proxy_pass https://medicalcare-api-52493984131.us-central1.run.app/;
    proxy_http_version 1.1;
    proxy_set_header Host medicalcare-api-52493984131.us-central1.run.app;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_ssl_server_name on;
}
```

Keep the existing static file handlers and SSL configuration; just add this `location` block inside the `server { ... }` definition.

---

## Troubleshooting

### Build Fails

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Files Not Updating

```bash
# Clear browser cache (hard refresh: Ctrl+Shift+R)
# Or check file timestamps
ls -la /var/www/medicalcare-frontend

# Force copy
sudo rm -rf /var/www/medicalcare-frontend/*
sudo cp -r dist/* /var/www/medicalcare-frontend/
```

### Nginx Errors

```bash
# Check Nginx status
sudo systemctl status nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Test config
sudo nginx -t
```

### Permission Issues

**CentOS/RHEL:**

```bash
# Fix ownership
chown -R nginx:nginx /var/www/medicalcare-frontend
chmod -R 755 /var/www/medicalcare-frontend
```

**Debian/Ubuntu:**

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/medicalcare-frontend
sudo chmod -R 755 /var/www/medicalcare-frontend
```

---

## Quick Reference Commands

| Task                     | Command                                                         |
| ------------------------ | --------------------------------------------------------------- |
| Pull changes             | `git pull origin main`                                          |
| Install deps             | `npm install`                                                   |
| Build                    | `npm run build`                                                 |
| Deploy                   | `cp -r dist/* /var/www/medicalcare-frontend/`                   |
| Set permissions (CentOS) | `chown -R nginx:nginx /var/www/medicalcare-frontend`            |
| Set permissions (Debian) | `sudo chown -R www-data:www-data /var/www/medicalcare-frontend` |
| Reload Nginx             | `systemctl reload nginx`                                        |

---

## Your Current Setup

Based on your setup:

- **Repo location:** `/root/medicalCareFrontend`
- **Web directory:** `/var/www/medicalcare-frontend`
- **Domain:** `dashboard.vpmforschools.org`
- **API URL:** proxied via `/api` (Nginx forwards to the live Cloud Run service)

---

## One-Liner for Regular Updates

**For CentOS/RHEL** - Add this alias to your `~/.bashrc`:

```bash
alias deploy-frontend='cd /root/medicalCareFrontend && echo "VITE_API_BASE_URL=/api" > .env.production && echo "VITE_ENV=production" >> .env.production && git pull origin main && npm install && rm -rf dist node_modules/.vite && npm run build -- --mode production && cp -r dist/* /var/www/medicalcare-frontend/ && chown -R nginx:nginx /var/www/medicalcare-frontend && chmod -R 755 /var/www/medicalcare-frontend && nginx -t && systemctl reload nginx && echo "✅ Deployed!"'
```

**For Debian/Ubuntu** - Add this alias:

```bash
alias deploy-frontend='cd /root/medicalCareFrontend && git pull origin main && npm install && npm run build && sudo cp -r dist/* /var/www/medicalcare-frontend/ && sudo chown -R www-data:www-data /var/www/medicalcare-frontend && sudo nginx -t && sudo systemctl reload nginx && echo "✅ Deployed!"'
```

Then run:

```bash
source ~/.bashrc
deploy-frontend
```

---

**🎉 That's it! Your deployment workflow is ready!**
