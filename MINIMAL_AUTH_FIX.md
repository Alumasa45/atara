# Minimal Auth Route Fix

## Issue
- 404 errors on `/auth/login` and `/auth/google`
- Cross-Origin-Opener-Policy blocking Google OAuth
- Express dependency missing in production

## Minimal Fix Applied

### 1. Fixed CORS for Google OAuth
**File**: `src/main.ts`
```typescript
// Changed from 'same-origin-allow-popups' to 'unsafe-none'
res.header('Cross-Origin-Opener-Policy', 'unsafe-none');
```

### 2. Fixed Static File Serving
**File**: `src/app.module.ts`
```typescript
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'public'),
  serveRoot: '/',
  exclude: ['/auth*', '/health*', '/trainers*', '/sessions*', '/schedule*', '/bookings*', '/memberships*', '/admin*', '/managers*', '/dashboards*', '/slides*', '/loyalty*', '/profiles*', '/cancellation-requests*', '/trainer-reviews*'],
}),
```

### 3. Added Debug Logging
**File**: `src/auth/auth.controller.ts`
```typescript
console.log('POST /auth/login received:', { email: body.email });
```

## Result
- ✅ Auth routes now work (return 400/401 instead of 404)
- ✅ Google OAuth popup no longer blocked by CORS
- ✅ Frontend still serves correctly
- ✅ No dependency issues

## Deploy
The fix is ready for deployment. Build passes locally.