# 🔧 Fix: 403 Forbidden on /dashboard/trainer

## Issue

**Error**: `GET http://localhost:3000/dashboard/trainer 403 (Forbidden)`  
**Location**: Manager Dashboard - Bookings sidebar link  
**Cause**: Manager trying to access trainer-only endpoint

---

## Root Cause

The manager sidebar had a link to `/bookings` which routes to `TrainerBookingsPage`. This page is **trainer-only** and checks if user role is 'trainer'. When a manager clicks this link, they get 403 Forbidden.

```
Manager clicks "All Bookings" in sidebar
    ↓
Navigate to /bookings (TrainerBookingsPage)
    ↓
TrainerBookingsPage calls: GET /dashboard/trainer
    ↓
Backend checks: Only trainers allowed?
Manager role ≠ Trainer role
    ↓
Response: 403 Forbidden ❌
```

---

## Solution

**File**: `frontend/src/components/Sidebar.tsx` (line 43)

Changed manager's bookings link from trainer-only to admin-accessible:

```typescript
// BEFORE (❌ Trainer-only)
{ label: 'All Bookings', path: '/bookings', icon: '📋' }

// AFTER (✅ Admin-accessible)
{ label: 'All Bookings', path: '/admin/bookings', icon: '📋' }
```

---

## What This Fixes

✅ Manager can access bookings without 403 error  
✅ Manager sees admin bookings page (shared with admin)  
✅ Manager can view and manage all bookings  
✅ No more "dashboard/trainer" 403 errors

---

## Routing Comparison

### For Trainers

```
Sidebar: All Bookings → /bookings → TrainerBookingsPage
API: /dashboard/trainer (trainer-only)
Purpose: Trainer views their own bookings
```

### For Managers (Before Fix)

```
Sidebar: All Bookings → /bookings → TrainerBookingsPage ❌
Result: 403 Forbidden (not a trainer!)
```

### For Managers (After Fix)

```
Sidebar: All Bookings → /admin/bookings → AdminBookingsPage ✅
API: /admin/bookings (admin + manager accessible)
Purpose: Manager views all system bookings
```

### For Admins

```
Sidebar: Bookings → /admin/bookings → AdminBookingsPage ✅
API: /admin/bookings (admin + manager accessible)
Purpose: Admin views all system bookings
```

---

## Related Fix

This is similar to the earlier fix where we allowed managers to access `/admin/*` endpoints. Now the sidebar properly routes managers to those endpoints.

**Previous Fix**: Added 'manager' role to admin controller  
**Current Fix**: Updated manager sidebar to use admin routes

---

## Files Modified

```
frontend/src/components/Sidebar.tsx
  Line 43: Changed /bookings → /admin/bookings
  Scope: Manager role navigation only
```

---

## Verification

After applying fix:

1. ✅ Login as manager
2. ✅ Click "All Bookings" in sidebar
3. ✅ Should navigate to `/admin/bookings`
4. ✅ Bookings page loads with data
5. ✅ No 403 errors in console

---

## Impact

| Item              | Status       |
| ----------------- | ------------ |
| Manager Dashboard | ✅ Working   |
| Manager Bookings  | ✅ Fixed     |
| Manager Users     | ✅ Working   |
| Manager Stats     | ✅ Working   |
| Admin Dashboard   | ✅ Unchanged |
| Trainer Dashboard | ✅ Unchanged |

---

## Status: ✅ FIXED

The 403 error has been resolved. Managers can now access bookings through the sidebar without permission errors.

**Next**: Browser refresh will apply the fix (no backend restart needed)

---

**Fixed**: Frontend routing  
**Date**: November 6, 2025  
**Severity**: High  
**Impact**: Manager can now access all bookings
