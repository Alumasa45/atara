# Schedule Fetching Issue - ROOT CAUSE & FIX

## Problem

Schedules were not appearing in the booking flow because the frontend was calling the wrong API endpoint.

## Root Cause

**Endpoint Mismatch:**

- Frontend was calling: `GET /schedules` (plural)
- Backend endpoint is: `GET /schedule` (singular)

This caused a 404 error when fetching schedules, so the booking modal showed "No schedules available".

## Solution Applied

Updated `frontend/src/api.ts` line 60:

```typescript
// BEFORE (WRONG)
export async function fetchSchedules() {
  return getJson('/schedules'); // ❌ 404 Not Found
}

// AFTER (FIXED)
export async function fetchSchedules() {
  return getJson('/schedule'); // ✅ Correct endpoint
}
```

## Impact

This fixes the schedule fetching in:

1. **BookingFlow.tsx** - Main booking modal now fetches schedules correctly
2. **BookingForm.tsx** - Quick booking sidebar now fetches schedules correctly

## How It Works Now

1. Frontend calls `GET /schedule` (correct singular form)
2. Backend ScheduleController handles the request (line 34 of schedule.controller.ts)
3. Returns paginated response: `{ data: [...schedules], total, page, limit }`
4. Frontend extracts `response.data` and displays available dates/time slots
5. Schedules now appear in the booking modal! ✅

## Testing

After this fix, users should see:

1. Available dates appear when opening the booking modal
2. Selecting a date shows available time slots
3. Quick booking form shows available schedules in dropdown

---

**Status**: ✅ FIXED
**Date**: November 5, 2025
**Impact**: High - This was blocking the entire booking flow
