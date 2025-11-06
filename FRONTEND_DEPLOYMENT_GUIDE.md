# 🚀 Frontend Deployment Guide - Render

## Overview

Your backend is deployed at: **https://atara-dajy.onrender.com**
Now let's deploy the frontend!

---

## ✅ Prerequisites Completed

1. ✅ Created `.env.production` with backend URL
2. ✅ Created `.env.local` for local development
3. ✅ Backend CORS already supports custom origins

---

## 📋 Step-by-Step Deployment

### Step 1: Update Backend CORS on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your **atara-dajy** web service
3. Go to **"Environment"** tab
4. Add/Update this environment variable:
   - **Key**: `CORS_ORIGIN`
   - **Value**: `https://atara-frontend.onrender.com,http://localhost:5173`

   ⚠️ **Note**: We'll update this with the actual frontend URL after deployment

5. Click **"Save Changes"** (backend will auto-redeploy)

---

### Step 2: Deploy Frontend on Render

#### Option A: Deploy via Render Dashboard (Recommended)

1. **Go to Render Dashboard** → Click **"New +"** → **"Static Site"**

2. **Connect Repository**:
   - Click **"Connect GitHub"**
   - Select your repository: `Alumasa45/atara`
   - Click **"Connect"**

3. **Configure Static Site**:

   ```
   Name: atara-frontend
   Branch: master
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: frontend/dist
   ```

4. **Environment Variables** (Click "Advanced"):
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://atara-dajy.onrender.com`

5. **Click "Create Static Site"**

6. **Wait for Deployment** (2-5 minutes)
   - Render will build and deploy
   - You'll get a URL like: `https://atara-frontend.onrender.com`

---

#### Option B: Deploy via Render Blueprint (YAML)

1. Create `render.yaml` in project root (if not exists)
2. Render will auto-detect and deploy both backend and frontend

---

### Step 3: Update Backend CORS with Frontend URL

After frontend deploys (e.g., `https://atara-frontend.onrender.com`):

1. **Go back to Backend Service** → **Environment**
2. **Update CORS_ORIGIN**:
   ```
   https://atara-frontend.onrender.com,http://localhost:5173
   ```
3. **Save** (backend will redeploy)

---

### Step 4: Update APP_BASE_URL in Backend

Your backend also needs to know the frontend URL for emails/redirects:

1. **Backend Service** → **Environment**
2. **Update or Add**:
   - **Key**: `APP_BASE_URL`
   - **Value**: `https://atara-frontend.onrender.com`
3. **Save**

---

## 🔧 Troubleshooting

### Issue: CORS Errors

**Solution**: Make sure `CORS_ORIGIN` includes your frontend URL

### Issue: API Calls Failing

**Solution**:

1. Check browser console for exact error
2. Verify `VITE_API_BASE_URL` in Render environment variables
3. Make sure backend is running: Visit `https://atara-dajy.onrender.com`

### Issue: Frontend Shows Old Data

**Solution**: Clear browser cache or open in incognito mode

### Issue: Build Fails on Render

**Common Fixes**:

- Ensure `package.json` has all dependencies
- Check build logs for specific errors
- Verify Node version compatibility

---

## 📦 Alternative: Deploy to Vercel (Faster & Free)

Vercel is optimized for React/Vite frontends:

### Vercel Deployment Steps:

1. **Install Vercel CLI** (optional):

   ```bash
   npm install -g vercel
   ```

2. **Go to [Vercel Dashboard](https://vercel.com/new)**

3. **Import Git Repository**:
   - Click "Add New Project"
   - Import `Alumasa45/atara`
   - Click "Continue"

4. **Configure Project**:

   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

5. **Environment Variables**:
   - `VITE_API_BASE_URL` = `https://atara-dajy.onrender.com`

6. **Deploy** → Get URL like `atara-frontend.vercel.app`

7. **Update Backend CORS**: Add Vercel URL to `CORS_ORIGIN`

---

## 🎯 Quick Command Reference

### Test Production Build Locally:

```bash
cd frontend
npm run build
npm run preview
```

### Check Environment Variables:

```bash
# Linux/Mac
echo $VITE_API_BASE_URL

# Windows PowerShell
$env:VITE_API_BASE_URL
```

---

## ✅ Deployment Checklist

- [ ] Created `.env.production` with backend URL
- [ ] Created `.env.local` for local development
- [ ] Backend CORS configured with frontend domain
- [ ] Frontend deployed on Render/Vercel
- [ ] Backend `APP_BASE_URL` updated
- [ ] Test login functionality
- [ ] Test membership creation (admin)
- [ ] Test booking flow (client)
- [ ] Verify all API calls work

---

## 🔗 Final URLs

After deployment, you'll have:

- **Backend API**: https://atara-dajy.onrender.com
- **Frontend**: https://atara-frontend.onrender.com (or your chosen name)

---

## 📝 Git Commands

Commit and push your changes:

```bash
git add .
git commit -m "Add frontend deployment configuration"
git push origin master
```

Render will auto-deploy on push!

---

**Need help?** Check Render logs or ask for assistance! 🚀
