# Quick Fix - Trainers Not Loading on Admin Page

## Problem

Admin trainers page shows "No trainers found" even though 3 trainers exist in database

## Root Cause

Frontend was calling `/admin/trainers` **WITHOUT** query parameters (page, limit)

## Solution

Added explicit query parameters to the API call

### What Changed

**File**: `frontend/src/pages/AdminTrainersPage.tsx` (Line 58)

```typescript
// BEFORE (Wrong):
const trainersData = await getJson('/admin/trainers');
// ❌ No parameters
// ❌ Data not loading

// AFTER (Fixed):
const params = new URLSearchParams({
  page: '1',
  limit: '100',
});
const trainersData = await getJson(`/admin/trainers?${params.toString()}`);
// ✅ With parameters: page=1&limit=100
// ✅ All trainers load
```

---

## How It Works

```
Before: GET /admin/trainers
After:  GET /admin/trainers?page=1&limit=100

Backend:
- page=1 → skip=0
- limit=100 → take=100
- Returns all trainers in database
```

---

## Result

| Before              | After                     |
| ------------------- | ------------------------- |
| "No trainers found" | Shows all 3 trainers      |
| Stats show 0        | Stats show correct counts |
| Trainers List (0)   | Trainers List (3)         |

---

## Testing

1. Open admin trainers page
2. **Expected**: 3 trainers displayed
3. Check console (F12) - debug log shows trainers

---

**Status**: ✅ FIXED  
**Date**: November 5, 2025
