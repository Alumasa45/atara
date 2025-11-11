# Frontend URL Configuration Fix

## Issue
The deployed frontend at `https://atara-1.onrender.com` is making API requests to two different backend URLs:
- ✅ `https://atara-dajy.onrender.com` (correct - working)
- ❌ `https://atara-backend.onrender.com` (incorrect - causing 500 errors)

## Root Cause
The deployed frontend is using an older version of the code that had hardcoded references to the wrong backend URL.

## Current Configuration (Correct)
The local frontend code is already properly configured:

### Environment Files
- `.env`: `VITE_API_BASE_URL=https://atara-dajy.onrender.com`
- `.env.production`: `VITE_API_BASE_URL=https://atara-dajy.onrender.com`
- `.env.local`: `VITE_API_BASE_URL=https://atara-dajy.onrender.com`

### API Configuration
- `src/api.ts`: `const BASE = 'https://atara-dajy.onrender.com';`

### Vite Configuration
- `vite.config.js`: Fallback to `https://atara-dajy.onrender.com`

## Solution
**Redeploy the frontend** at `https://atara-1.onrender.com` with the current code to ensure all API calls use the correct backend URL.

## Verification
After redeployment, all API calls should go to `https://atara-dajy.onrender.com` and the 500 errors should be resolved.

## Commands to Redeploy Frontend
```bash
cd frontend
npm run build
# Deploy the dist/ folder to https://atara-1.onrender.com
```

The backend code changes I made (error handling, payment reference validation) should also be deployed to `https://atara-dajy.onrender.com` for the complete fix.