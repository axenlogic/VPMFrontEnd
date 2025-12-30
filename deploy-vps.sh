#!/bin/bash

# VPS Deployment Script - Update and Deploy Frontend
# Run this on your VPS: bash deploy-vps.sh

set -e

# Configuration
REPO_DIR="/root/medicalCareFrontend"  # Adjust if different
WEB_DIR="/var/www/medicalcare-frontend"
BRANCH="main"

echo "🚀 Starting deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Navigate to repo directory
cd "$REPO_DIR" || exit 1

# Step 1: Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin "$BRANCH"

# Step 2: Ensure .env.production is correct
echo "📝 Updating .env.production..."
cat > .env.production <<'EOF'
VITE_API_BASE_URL=/api
VITE_ENV=production
EOF

# Step 3: Install dependencies (if package.json changed)
echo "📦 Checking dependencies..."
npm install --production=false

# Step 4: Build for production
echo "🔨 Building production bundle (mode: production)..."
npm run build -- --mode production

# Step 5: Copy files to web directory
echo "📤 Copying files to web directory..."
sudo mkdir -p "$WEB_DIR"
sudo cp -r dist/* "$WEB_DIR/"

# Step 6: Set permissions
echo "🔒 Setting permissions..."
sudo chown -R www-data:www-data "$WEB_DIR"
sudo chmod -R 755 "$WEB_DIR"

# Step 7: Test and reload Nginx
echo "🔄 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "✅ Deployment complete!"
echo "🌐 Frontend deployed to: https://dashboard.vpmforschools.org"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

