#!/bin/bash
# VPS Deployment Script for CentOS/RHEL
# Run this on your VPS: bash deploy-centos.sh

set -e

REPO_DIR="/root/medicalCareFrontend"
# Update to match your Nginx config root path
WEB_DIR="/var/www/dashboard/build"
WEB_USER="nginx"  # For CentOS/RHEL (use 'www-data' for Debian/Ubuntu)

echo "🚀 Starting deployment..."
cd "$REPO_DIR" || exit 1

echo "📥 Pulling latest changes..."
git pull origin main

# Ensure .env.production exists and is correct
echo "📝 Ensuring .env.production is configured..."
echo "VITE_API_BASE_URL=/api" > .env.production
echo "VITE_ENV=production" >> .env.production

# Verify .env.production
echo "✅ .env.production contents:"
cat .env.production

echo "📦 Installing dependencies..."
npm install --production=false

echo "🔨 Building production bundle (mode: production)..."
npm run build -- --mode production

echo "📤 Copying files to web directory..."
mkdir -p "$WEB_DIR"
# Remove old files to ensure clean deployment
rm -rf "$WEB_DIR"/*
# Copy new files with preserved timestamps
cp -rp dist/* "$WEB_DIR/"

echo "🔒 Setting permissions..."
chown -R $WEB_USER:$WEB_USER "$WEB_DIR"
chmod -R 755 "$WEB_DIR"

echo "🔄 Reloading Nginx..."
nginx -t && systemctl reload nginx

echo "✅ Deployment complete!"
