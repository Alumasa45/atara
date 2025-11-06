# ⚡ Quick Fix - /dashboard/trainer 403 Error

## Problem

Manager gets `403 Forbidden` when clicking "All Bookings" in sidebar.

## Root Cause

Manager sidebar link pointed to `/bookings` which is trainer-only. Changed to `/admin/bookings`.

## Solution Applied

**File**: `frontend/src/components/Sidebar.tsx` (line 43)

```typescript
// BEFORE
{ label: 'All Bookings', path: '/bookings', icon: '📋' }

// AFTER
{ label: 'All Bookings', path: '/admin/bookings', icon: '📋' }
```

---

## Result

✅ Manager can click "All Bookings"  
✅ Routes to `/admin/bookings` (manager-accessible)  
✅ No more 403 errors  
✅ Front-end only change

---

## How to Apply

1. Browser refresh (automatic with hot-reload)
2. Test: Click "All Bookings" in manager sidebar
3. Should show bookings page without errors ✅

---

## Status

✅ Fixed | ✅ No backend restart needed | ✅ Immediate effect

See: **FIX_DASHBOARD_TRAINER_403.md** for full details
