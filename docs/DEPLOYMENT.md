# GHFarmer Deployment Guide

## Overview

This guide covers deploying GHFarmer to cPanel hosting with automatic CI/CD using GitHub Actions.

## Prerequisites

1. **GitHub Repository** - Your code must be on GitHub
2. **cPanel Hosting** with Node.js 18+ support
3. **Neon PostgreSQL Database** - [neon.tech](https://neon.tech)
4. **SSH Access** to your cPanel server

---

## Step 1: Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project (e.g., "ghfarmer-production")
3. Copy the connection string, it looks like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this - you'll need it for environment variables

---

## Step 2: Configure cPanel Node.js App

1. Log into cPanel
2. Go to **Setup Node.js App**
3. Click **CREATE APPLICATION**
4. Fill in:

| Field | Value |
|-------|-------|
| Node.js version | `20.x` (or latest 18+) |
| Application mode | `Production` |
| Application root | `/home/yourusername/ghfarmer` |
| Application URL | `ghfarmer360.com` |
| Application startup file | `server.js` |

5. Add Environment Variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Neon connection string |
| `NEXTAUTH_URL` | `https://ghfarmer360.com` |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth secret |

6. Click **CREATE**

---

## Step 3: Set Up GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

### Database
| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |

### cPanel/SSH Access
| Secret | Description |
|--------|-------------|
| `CPANEL_HOST` | Your server hostname (e.g., `server123.web-hosting.com`) |
| `CPANEL_USERNAME` | Your cPanel username |
| `CPANEL_PASSWORD` | Your cPanel password |
| `CPANEL_PORT` | SSH port (usually `22`) |
| `APP_PATH` | Full path to app (e.g., `/home/username/ghfarmer`) |

### FTP Access (Alternative)
| Secret | Description |
|--------|-------------|
| `FTP_HOST` | FTP server hostname |
| `FTP_USERNAME` | FTP username |
| `FTP_PASSWORD` | FTP password |
| `FTP_SERVER_DIR` | Server directory (e.g., `/ghfarmer/`) |

### Auth Secrets
| Secret | Description |
|--------|-------------|
| `NEXTAUTH_SECRET` | Random secret for NextAuth |

---

## Step 4: Initial Deployment

### Option A: Manual First Deploy

1. Build locally:
   ```bash
   npm run build
   ```

2. Create ZIP with these files:
   - `.next/`
   - `public/`
   - `prisma/`
   - `package.json`
   - `package-lock.json`
   - `server.js`
   - `next.config.ts`
   - `tsconfig.json`

3. Upload to cPanel via File Manager

4. In cPanel Terminal or SSH:
   ```bash
   cd /home/username/ghfarmer
   npm install --production
   npx prisma generate
   npx prisma db push
   ```

5. Create restart trigger folder:
   ```bash
   mkdir -p tmp
   ```

6. Restart the app in cPanel Node.js panel

### Option B: Push to GitHub (After Setup)

Once GitHub secrets are configured, just push to `main` branch:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

---

## Step 5: Verify Deployment

1. Visit your domain: `https://ghfarmer360.com`
2. Check the app loads correctly
3. Test login functionality
4. Verify database connection

---

## Automatic Deployments

After initial setup, every push to `main` branch will:

1. ✅ Build the Next.js app
2. ✅ Generate Prisma client
3. ✅ Upload files to server
4. ✅ Install dependencies
5. ✅ Run database migrations
6. ✅ Restart the app

---

## Troubleshooting

### App not starting
- Check Node.js version is 18+
- Verify `server.js` is set as startup file
- Check environment variables are set

### Database connection failed
- Verify `DATABASE_URL` is correct
- Ensure Neon database is active
- Check SSL mode is enabled (`?sslmode=require`)

### 502 Bad Gateway
- App might be starting up, wait 30 seconds
- Check cPanel error logs
- Restart the Node.js app

### Deployment failed
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Ensure SSH/FTP access is enabled

---

## Useful Commands

```bash
# SSH into server
ssh username@server.com

# Check app logs
cd /home/username/ghfarmer
cat logs/error.log

# Restart app manually
touch tmp/restart.txt

# Run Prisma commands
npx prisma db push
npx prisma studio
```

---

## Security Notes

1. Never commit `.env` files to GitHub
2. Use strong passwords for all secrets
3. Enable 2FA on GitHub and cPanel
4. Regularly rotate `NEXTAUTH_SECRET`
5. Keep Node.js and dependencies updated
