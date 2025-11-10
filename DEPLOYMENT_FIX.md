# 🚀 Deployment Fix for 404 Errors

## Problem Identified
Your frontend was trying to call `https://atara-1.onrender.com` (the frontend URL) instead of the backend URL for API requests.

## Changes Made

### 1. Frontend API Configuration
- **File**: `frontend/src/api.ts`
- **Change**: Updated BASE URL to use environment variable or fallback to correct backend URL
- **Before**: `const BASE = window.location.origin;`
- **After**: `const BASE = import.meta.env.VITE_API_BASE_URL || 'https://atara-backend.onrender.com';`

### 2. Environment Files Updated
- `frontend/.env`: Updated VITE_API_BASE_URL to `https://atara-backend.onrender.com`
- `frontend/.env.production`: Updated VITE_API_BASE_URL to `https://atara-backend.onrender.com`

### 3. Deployment Configuration
- **File**: `render.yaml`
- **Change**: Updated VITE_API_BASE_URL environment variable
- **File**: `Dockerfile`
- **Change**: Updated build command to use correct backend URL

## Next Steps

### Option 1: Redeploy Both Services
1. Commit and push these changes to your repository
2. Redeploy both `atara-backend` and `atara-1` services on Render
3. The backend should be available at `https://atara-backend.onrender.com`
4. The frontend should be available at `https://atara-1.onrender.com`

### Option 2: Test Locally First
1. Run the backend locally:
   ```bash
   pnpm run start:dev
   ```
2. Test endpoints:
   ```bash
   node test-endpoints.js
   ```
3. Build and test frontend:
   ```bash
   cd frontend
   pnpm build
   pnpm preview
   ```

## Expected URLs After Fix
- **Frontend**: https://atara-1.onrender.com
- **Backend**: https://atara-backend.onrender.com
- **API Calls**: Frontend will call backend at https://atara-backend.onrender.com

## Verification
After deployment, these endpoints should work:
- ✅ `https://atara-backend.onrender.com/health`
- ✅ `https://atara-backend.onrender.com/schedule`
- ✅ `https://atara-backend.onrender.com/trainers`
- ✅ `https://atara-backend.onrender.com/sessions`

The frontend at `https://atara-1.onrender.com` should now successfully call these backend endpoints.