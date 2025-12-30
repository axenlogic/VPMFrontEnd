# Fix: Production Build Using Localhost Instead of Production API

## Problem

The production build is using `http://localhost:8000` (or the retired Cloud Run hostname) instead of the live backend endpoint exposed via `/api`.

## Root Cause

Vite replaces environment variables **at build time**. If `.env.production` is not present or not read correctly when running `npm run build`, it will use the fallback value or undefined.

## Solution

### Step 1: Verify and Set .env.production on VPS

SSH into your VPS and run:

```bash
cd /root/medicalCareFrontend

# Create/update .env.production (FORCE overwrite)
cat > .env.production << 'EOF'
VITE_API_BASE_URL=/api
VITE_ENV=production
EOF

# Verify it was created correctly
cat .env.production
```

### Step 2: Clean Build (Important!)

Remove old build artifacts:

```bash
# Remove old build
rm -rf dist node_modules/.vite

# Optional: Full clean (if issues persist)
# rm -rf dist node_modules package-lock.json
# npm install
```

### Step 3: Build with Explicit Production Mode

```bash
# Build explicitly in production mode
npm run build -- --mode production

# OR set NODE_ENV explicitly
NODE_ENV=production npm run build
```

### Step 4: Verify the Build

Check that the built files contain the production URL:

```bash
# Search for localhost in built files (should NOT find it)
grep -r "localhost:8000" dist/ || echo "✅ No localhost found - Good!"

# Search for production URL (should find it)
grep -r "/api" dist/ && echo "✅ Production URL found - Good!"
```

### Step 5: Deploy

```bash
cp -r dist/* /var/www/medicalcare-frontend/
chown -R nginx:nginx /var/www/medicalcare-frontend
chmod -R 755 /var/www/medicalcare-frontend
nginx -t && systemctl reload nginx
```

## Complete Fix Script (Run on VPS)

```bash
#!/bin/bash
cd /root/medicalCareFrontend

echo "🔧 Fixing production environment variables..."

# 1. Force create .env.production
cat > .env.production << 'EOF'
VITE_API_BASE_URL=/api
VITE_ENV=production
EOF

echo "✅ .env.production created:"
cat .env.production

# 2. Clean old build
echo "🧹 Cleaning old build..."
rm -rf dist node_modules/.vite

# 3. Build in production mode
echo "🔨 Building with production mode..."
npm run build -- --mode production

# 4. Verify build
echo "🔍 Verifying build..."
if grep -r "localhost:8000" dist/ 2>/dev/null; then
    echo "❌ ERROR: Build still contains localhost!"
    exit 1
fi

if grep -r "/api" dist/ > /dev/null 2>&1; then
    echo "✅ Production URL found in build!"
else
    echo "⚠️  WARNING: Production URL not found in build"
fi

# 5. Deploy
echo "📤 Deploying..."
cp -r dist/* /var/www/medicalcare-frontend/
chown -R nginx:nginx /var/www/medicalcare-frontend
chmod -R 755 /var/www/medicalcare-frontend

# 6. Reload Nginx
echo "🔄 Reloading Nginx..."
nginx -t && systemctl reload nginx

echo "✅ Fix complete! Clear browser cache and test."
```

## Quick One-Liner Fix (On VPS)

```bash
cd /root/medicalCareFrontend && echo "VITE_API_BASE_URL=/api" > .env.production && echo "VITE_ENV=production" >> .env.production && rm -rf dist node_modules/.vite && npm run build -- --mode production && grep -r "localhost:8000" dist/ || (cp -r dist/* /var/www/medicalcare-frontend/ && chown -R nginx:nginx /var/www/medicalcare-frontend && chmod -R 755 /var/www/medicalcare-frontend && nginx -t && systemctl reload nginx && echo "✅ Fixed and deployed!")
```

## Verification After Fix

1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Open DevTools → Network tab**
3. **Try to login**
4. **Check the API request URL** - should be `/api/auth/login` (Nginx will proxy this to the live Cloud Run service)

## Common Issues

### Issue: Still showing localhost after fix

**Solution:**

- Clear browser cache completely
- Try incognito/private window
- Check if you're viewing cached files: `ls -la /var/www/medicalcare-frontend/assets/`

### Issue: .env.production keeps getting deleted

**Solution:**

- Add `.env.production` to `.gitignore` BUT make sure it's NOT in the ignore list
- Or create it manually on VPS and don't commit it
- Use the deployment script that creates it automatically

### Issue: Build works but browser shows old files

**Solution:**

- Check file timestamps: `ls -lt /var/www/medicalcare-frontend/assets/`
- Clear Nginx cache (if enabled)
- Check browser Network tab - look for 304 Not Modified responses

## Prevention

Always ensure:

1. `.env.production` exists before building
2. Use `npm run build -- --mode production` explicitly
3. Clean `dist` folder before rebuilding
4. Verify build contains production URL before deploying
