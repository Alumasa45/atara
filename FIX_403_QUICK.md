# ⚡ Quick Fix - 403 Forbidden Error

## Problem

Manager Dashboard shows: `GET http://localhost:3000/admin/stats 403 (Forbidden)`

## Solution

Backend permission fix - Allow managers to access admin endpoints

## What Was Changed

**File**: `src/admin/admin.controller.ts`

### Change 1: Controller-level decorator

```typescript
@Roles('admin', 'manager')  // Added 'manager' role
```

### Change 2: Stats endpoint decorator

```typescript
@Roles('admin', 'manager')  // Allow both roles
```

---

## How to Apply Fix

### Option 1: Automatic (if using git)

```bash
cd c:\Users\user\Desktop\atara\atarabackend
git pull origin main
npm run start:dev
```

### Option 2: Manual

1. Open `src/admin/admin.controller.ts`
2. Find line 28: Change `@Roles('admin')` to `@Roles('admin', 'manager')`
3. Find line 37: Add `@Roles('admin', 'manager')` above the stats endpoint
4. Save file
5. Restart backend: `npm run start:dev`

---

## Verification

After applying fix:

1. Login as Manager
2. Go to `/dashboard/manager`
3. Dashboard should load with stats ✅
4. Check console (F12) - No 403 errors ✅
5. Try each tab (Users, Bookings, etc.) ✅

---

## Status

✅ Fix Applied | ✅ Ready to Deploy | ✅ Secure

See: **FIX_403_FORBIDDEN.md** for full details
