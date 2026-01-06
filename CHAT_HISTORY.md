# Chat History & Project Context

This document contains important context, decisions, and configurations from the development and deployment of the Medical Care Frontend application.

---

## Project Overview

**Project Name**: Medical Care Frontend / Virtual Peace of Mind Frontend  
**Domain**: `dashboard.vpmforschools.org`  
**Tech Stack**: React 18.3, TypeScript, Vite 5.4, Tailwind CSS, shadcn/ui  
**Backend**: Google Cloud Run API

---

## Key Architecture Decisions

### 1. API Configuration Strategy

**Decision**: Use relative path `/api` for production builds instead of hardcoding the Cloud Run URL.

**Implementation** (`src/lib/api.ts`):
```typescript
const DEFAULT_BASE_URL = import.meta.env.DEV ? 'http://localhost:8000' : '/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;
```

**Reasoning**:
- Allows Nginx to proxy `/api/*` requests to the backend
- Backend URL can be changed in Nginx config without rebuilding frontend
- More flexible and maintainable

### 2. Authentication Flow

**JWT Token Storage**: `localStorage` (`authToken`, `authUser`)

**Auto Token Injection**: Axios request interceptor automatically adds `Authorization: Bearer <token>` header

**401 Handling**: Response interceptor clears tokens and redirects to `/login` on 401 errors

### 3. Environment Variables

**Development** (`.env.local`):
```
VITE_API_BASE_URL=http://localhost:8000
VITE_ENV=development
```

**Production** (`.env.production`):
```
VITE_API_BASE_URL=/api
VITE_ENV=production
```

**Important**: Vite reads environment variables at build time, not runtime. Must rebuild when changing `.env.production`.

---

## Deployment Configuration

### Server Details

- **VPS OS**: CentOS/RHEL
- **Web Server**: Nginx
- **Web User**: `nginx` (CentOS/RHEL) or `www-data` (Debian/Ubuntu)
- **Web Root**: `/var/www/dashboard/build`
- **Project Directory**: `/root/medicalCareFrontend`

### Deployment Script

**File**: `deploy-centos.sh`

**Key Steps**:
1. Pull latest code from Git
2. Set `.env.production` with `VITE_API_BASE_URL=/api`
3. Install dependencies
4. Build with `--mode production` flag
5. Clean web directory (`rm -rf "$WEB_DIR"/*`)
6. Copy `dist/*` to web root
7. Set permissions (`chown -R nginx:nginx`, `chmod -R 755`)
8. Reload Nginx

**Critical**: Always use `npm run build -- --mode production` to ensure `.env.production` is used.

### Nginx Configuration

**Location**: `/etc/nginx/conf.d/dashboard.conf`

**Key Features**:
- HTTP (port 80) redirects to HTTPS (port 443)
- SSL certificates from Let's Encrypt
- Static file serving from `/var/www/dashboard/build`
- API proxy: `/api/*` → `https://medicalcare-api-52493984131.us-central1.run.app/`
- Cache-busting headers for HTML files
- Aggressive caching for static assets (JS, CSS, images)

**Cache-Busting Headers for HTML**:
```nginx
add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0";
add_header Pragma "no-cache";
add_header Expires "0";
```

**API Proxy Configuration**:
```nginx
location /api/ {
    proxy_pass https://medicalcare-api-52493984131.us-central1.run.app/;
    proxy_http_version 1.1;
    proxy_set_header Host medicalcare-api-52493984131.us-central1.run.app;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_ssl_server_name on;
}
```

---

## Backend API Endpoints

**Base URL (Production)**: `https://medicalcare-api-52493984131.us-central1.run.app`

**Endpoints**:
- `POST /auth/signup` - User registration
- `POST /auth/verify-otp` - Email verification
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset
- `GET /auth/user/profile` - Get user profile (requires JWT)
- `PATCH /auth/user/profile` - Update user profile (requires JWT)

---

## Troubleshooting History

### Issue 1: Production Build Using Localhost

**Problem**: Production build was using `http://localhost:8000` instead of production API URL.

**Root Cause**: Vite wasn't picking up `.env.production` during build.

**Solution**:
1. Ensure `.env.production` exists before building
2. Use explicit `--mode production` flag: `npm run build -- --mode production`
3. Clear cache: `rm -rf dist node_modules/.vite`
4. Changed to relative path `/api` for better flexibility

### Issue 2: Changes Not Reflecting on Server

**Problem**: Deployed changes not visible on website.

**Root Causes**:
1. Browser cache
2. CDN/edge cache (GreenGeeks)
3. Old files not being removed before deployment

**Solutions**:
1. Added `rm -rf "$WEB_DIR"/*` to deployment script
2. Added cache-busting headers in Nginx config
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
4. Request CDN cache purge from hosting provider

### Issue 3: Nginx Service Not Starting

**Problem**: `systemctl reload nginx` failed with "service is not active".

**Solution**:
```bash
systemctl status nginx  # Check status
nginx -t                # Test configuration
systemctl start nginx    # Start service
systemctl enable nginx   # Enable on boot
```

### Issue 4: SSL Certificate Not Found

**Problem**: Nginx couldn't load SSL certificates.

**Solution**: Verify certificate paths and permissions:
```bash
ls -la /etc/letsencrypt/live/dashboard.vpmforschools.org/
# If missing, issue new certificates with Certbot
```

### Issue 5: File Permission Errors

**Problem**: `chown: invalid user: 'www-data:www-data'` on CentOS.

**Solution**: Use correct user for OS:
- CentOS/RHEL: `nginx:nginx`
- Debian/Ubuntu: `www-data:www-data`

---

## Development Setup

### Local Development

**Start Dev Server**:
```bash
npm run dev
# Server runs on http://localhost:8080
```

**If npm has permission issues**:
```bash
# Option 1: Run Vite directly
./node_modules/.bin/vite --host :: --port 8080

# Option 2: Use npx
npx vite --host :: --port 8080

# Option 3: Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### Node.js Version

**Required**: Node.js 18+ (Vite 5.4 requires Node 18+)  
**Current**: Node.js v20.19.5 (LTS)  
**Installation**: Using `nvm` (Node Version Manager)

---

## File Structure

```
medicalCareFrontend/
├── src/
│   ├── lib/
│   │   └── api.ts              # Axios instance, interceptors, API calls
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Authentication state management
│   │   └── UserContext.tsx     # User profile state management
│   ├── services/
│   │   ├── authService.ts      # Auth API calls
│   │   └── userService.ts      # User profile API calls
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Main.tsx            # Protected dashboard
│   │   └── ...
│   └── components/
│       ├── ProtectedRoute.tsx  # Route guard
│       └── RootRedirect.tsx    # Smart root redirect
├── deploy-centos.sh            # VPS deployment script
├── deploy-vps.sh               # Alternative deployment script
├── DEPLOYMENT.md               # Deployment documentation
└── .env.production             # Production environment variables (gitignored)
```

---

## Key Code Patterns

### Authentication Flow

1. User logs in → `AuthService.login()` → JWT stored in localStorage
2. `AuthContext` manages auth state globally
3. Axios interceptor adds token to all requests
4. On 401, tokens cleared and redirect to `/login`

### User Profile Management

1. `UserContext` auto-fetches profile on auth state change
2. Auto-refreshes every 5 minutes
3. `useUserProfile` hook provides convenient methods
4. Optimistic updates for better UX

### Protected Routes

- `ProtectedRoute` component checks `isAuthenticated`
- Shows loading spinner while checking
- Redirects to `/login` if not authenticated

---

## Important Notes

1. **Build Mode**: Always use `--mode production` for production builds
2. **Environment Variables**: Must be prefixed with `VITE_` for Vite to read them
3. **API Base URL**: Use `/api` in production, let Nginx handle proxying
4. **Cache Issues**: Clear browser cache and CDN cache when changes don't appear
5. **File Permissions**: Use correct web server user for your OS
6. **Nginx Config**: Located at `/etc/nginx/conf.d/dashboard.conf` (CentOS/RHEL)

---

## Deployment Checklist

- [ ] Pull latest code: `git pull origin main`
- [ ] Verify `.env.production` exists with `VITE_API_BASE_URL=/api`
- [ ] Clean old build: `rm -rf dist node_modules/.vite`
- [ ] Build production: `npm run build -- --mode production`
- [ ] Verify build doesn't contain `localhost:8000`
- [ ] Clean web directory: `rm -rf /var/www/dashboard/build/*`
- [ ] Copy files: `cp -rp dist/* /var/www/dashboard/build/`
- [ ] Set permissions: `chown -R nginx:nginx /var/www/dashboard/build`
- [ ] Test Nginx config: `nginx -t`
- [ ] Reload Nginx: `systemctl reload nginx`
- [ ] Clear browser cache and test

---

## Contact & Support

**Hosting Provider**: GreenGeeks  
**Domain**: dashboard.vpmforschools.org  
**Backend**: Google Cloud Run

---

## Version History

- **Initial Setup**: React + TypeScript + Vite + Tailwind CSS
- **Authentication**: JWT-based with localStorage
- **Deployment**: VPS with Nginx reverse proxy
- **API Integration**: Cloud Run backend with `/api` proxy path
- **Caching**: Cache-busting for HTML, aggressive caching for assets

---

*This document was generated from chat history to preserve context for future development.*

