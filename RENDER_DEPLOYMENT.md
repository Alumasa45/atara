# Atara Movement Backend - Render Deployment Guide

## Prerequisites

1. GitHub account
2. Render account (free tier available at https://render.com)
3. Your code pushed to a GitHub repository

## Deployment Steps

### 1. Push Your Code to GitHub

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for Render deployment"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/atara-backend.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy on Render

#### Option A: Using Blueprint (render.yaml) - RECOMMENDED

1. Go to https://render.com and sign in
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create:
   - PostgreSQL database (atara-db)
   - Web Service (atara-backend)

#### Option B: Manual Setup

**Step 1: Create PostgreSQL Database**

1. Dashboard → **"New +"** → **"PostgreSQL"**
2. Name: `atara-db`
3. Database: `atara`
4. User: `atara_user`
5. Region: Oregon (or closest to you)
6. Plan: **Free**
7. Click **"Create Database"**

**Step 2: Create Web Service**

1. Dashboard → **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `atara-backend`
   - **Region**: Oregon
   - **Branch**: `main`
   - **Runtime**: Docker
   - **Plan**: Free

**Step 3: Add Environment Variables**

Click **"Environment"** and add these variables:

**Database (copy from your PostgreSQL database internal connection)**

```
DB_TYPE=postgres
DB_HOST=<from-render-postgres-internal-host>
DB_PORT=5432
DB_NAME=atara
DB_USERNAME=atara_user
DB_PASSWORD=<from-render-postgres-password>
DB_SYNC=false
DB_LOGGING=false
```

**Application**

```
PORT=3000
NODE_ENV=production
JWT_SECRET=<generate-random-string-32-chars>
JWT_EXPIRES_IN=3600s
```

**Email (use your existing SMTP)**

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ataradesk25@gmail.com
SMTP_PASS=zygvestdxeouqyhc
SMTP_FROM=Atara Movement Studio <ataradesk25@gmail.com>
```

**Google OAuth**

```
GOOGLE_CLIENT_ID=567628815213-0vjg04n40juo7a8vmn5cbdg56nj3v9dq.apps.googleusercontent.com
```

**ReCAPTCHA**

```
RECAPTCHA_SECRET=6LfEgQAsAAAAAHN0vSwlQpMQ5bnvXCjOMqqF3Cjf
```

**Frontend URL (update after deploying frontend)**

```
APP_BASE_URL=https://your-frontend.vercel.app
```

**Redis (Optional - Render doesn't have free Redis)**

```
REDIS_HOST=<external-redis-service-or-skip>
REDIS_PORT=6379
REDIS_PASSWORD=<password>
```

### 3. Run Migrations

After first deploy, you need to run migrations:

1. Go to your Render web service dashboard
2. Click **"Shell"** tab
3. Run:

```bash
pnpm run migration:run
```

Or add a build command in Render:

- Build Command: `pnpm install && pnpm build && pnpm run migration:run`

### 4. Verify Deployment

1. Check logs in Render dashboard
2. Your API will be available at: `https://atara-backend.onrender.com`
3. Test endpoints:
   - Health check: `https://atara-backend.onrender.com/`
   - API: `https://atara-backend.onrender.com/api`

## Important Notes

### Free Tier Limitations

- ⚠️ **Free services spin down after 15 minutes of inactivity**
- First request after spin-down takes ~30-60 seconds
- Database has 90-day expiration on free tier
- Consider upgrading for production use

### Redis Alternative

Since Render doesn't offer free Redis:

- Use **Upstash** (free tier): https://upstash.com
- Or remove Redis features temporarily
- Or upgrade Render plan ($7/month for Redis)

### Security

- Never commit `.env` file
- Rotate JWT_SECRET regularly
- Use strong database passwords
- Update CORS settings in production

## Troubleshooting

### Build Fails

```bash
# Check package.json scripts
# Ensure all dependencies are in package.json
# Check Dockerfile syntax
```

### Database Connection Issues

```bash
# Verify DB_HOST is internal hostname from Render
# Check DB credentials match
# Ensure database is created
```

### Migration Issues

```bash
# Run migrations manually from Shell tab
pnpm run migration:run
```

## Updating Your App

```powershell
# Make changes locally
git add .
git commit -m "Your changes"
git push

# Render will auto-deploy on push
```

## Cost Estimate

**Free Tier (Current Setup):**

- Web Service: $0
- PostgreSQL: $0 (90 days)
- Total: **$0/month**

**Recommended Production:**

- Web Service: $7/month
- PostgreSQL: $7/month
- Redis: $7/month
- Total: **$21/month**

## Next Steps

1. Deploy frontend (Vercel/Netlify)
2. Update `APP_BASE_URL` with frontend URL
3. Configure CORS for production domain
4. Set up custom domain (optional)
5. Monitor logs and performance

---

**Support**: Check Render docs at https://render.com/docs
