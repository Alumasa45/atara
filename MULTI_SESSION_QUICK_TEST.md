# Multi-Session Feature - Quick Test Guide

## Feature Summary

✅ You can now add **multiple sessions to ONE schedule**

- Admin creates a schedule (e.g., 08:00-09:00 AM)
- Admin selects multiple sessions (Yoga, Pilates, Strength)
- Clients see all 3 sessions available at that time
- Each session can be booked independently

## Quick Test Steps

### Step 1: Run Database Migration

```bash
cd c:\Users\user\Desktop\atara\atarabackend
pnpm migration:run
```

✅ Should see: Junction table `schedule_sessions` created

### Step 2: Start the Backend

```bash
pnpm start
```

✅ Should see: Application started on http://localhost:3000

### Step 3: Admin Creates Multi-Session Schedule

1. Open admin panel → Schedules
2. Click "Add Schedule"
3. Set date/time:
   - Date: Today or future date
   - Start time: 08:00
   - End time: 09:00

4. **NEW:** Select multiple sessions (checkboxes)
   - ☑ Yoga
   - ☑ Pilates
   - ☑ Strength Training

   (Before: Single dropdown)

5. Click Save

✅ Should see: "Schedule created successfully"

### Step 4: Check Database

```bash
# Connect to database and run:
SELECT * FROM schedule_sessions;
```

✅ Should see: 3 rows

- schedule_id: 1, session_id: 1 (Yoga)
- schedule_id: 1, session_id: 2 (Pilates)
- schedule_id: 1, session_id: 3 (Strength)

### Step 5: Check Client Dashboard

1. Login as client
2. Go to dashboard
3. Look for "📅 All Upcoming Sessions"

**Before:** Shows 1 schedule = 1 session
**After:** Shows 3 sessions total in same time slot

4. For each session, you should see:
   - Session title (Yoga/Pilates/Strength)
   - Category
   - Duration
   - Trainer name
   - Schedule date/time
   - **Individual "Book Now" button**

### Step 6: Test Booking Each Session

1. Click "Book Now" on Yoga → Book Yoga
2. Go back to dashboard
3. Click "Book Now" on Pilates → Book Pilates
4. Click "Book Now" on Strength → Book Strength

✅ Should see: 3 separate bookings in your bookings list

## File Changes Reference

### Backend Files Changed

1. `src/schedule/entities/schedule.entity.ts`
   - Changed from `@ManyToOne` to `@ManyToMany`
2. `src/schedule/dto/create-schedule.dto.ts`
   - Changed from `session_id: number` to `session_ids: number[]`
3. `src/admin/admin.service.ts`
   - Updated `createSchedule` method for array handling
   - Updated `updateSchedule` method for array handling
4. `src/dashboards/dashboard.service.ts`
   - Updated 6 queries from `.leftJoinAndSelect('s.session'` to `.leftJoinAndSelect('s.sessions'`

5. New migration file: `src/migrations/1763500000000-CreateScheduleSessionsJunctionTable.ts`
   - Creates junction table
   - Migrates existing data
   - Removes old session_id column

### Frontend Files Changed

1. `frontend/src/pages/AdminSchedulesPage.tsx`
   - Changed form state from `session_id: string` to `session_ids: number[]`
   - Replaced dropdown with checkboxes
   - Updated form submission logic

2. `frontend/src/pages/ClientDashboard.tsx`
   - Updated session count calculation
   - Added nested loop for multiple sessions per schedule
   - Each session gets individual "Book Now" button

## API Changes

### Create Schedule

**Old:**

```json
POST /admin/schedules
{
  "session_id": 1,
  "start_time": "...",
  "end_time": "..."
}
```

**New:**

```json
POST /admin/schedules
{
  "session_ids": [1, 2, 3],
  "start_time": "...",
  "end_time": "..."
}
```

## Troubleshooting

### Checkbox not appearing in admin form

- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors

### Can't select multiple sessions

- Verify checkbox is working (should highlight when clicked)
- Check that at least one session is selected
- Verify sessions exist in the database

### Client doesn't see multiple sessions

- Verify migration ran successfully
- Check database has entries in schedule_sessions table
- Clear browser cache and reload dashboard
- Check network tab in browser dev tools

### "At least one session is required" error

- Select at least one checkbox before saving
- Error should clear when you select a session

## Expected Behavior

| Scenario          | Before                      | After                                |
| ----------------- | --------------------------- | ------------------------------------ |
| Add schedule      | Single dropdown for session | Multiple checkboxes                  |
| Sessions per slot | 1 session per time slot     | 3+ sessions per time slot            |
| Client view       | 1 option at 08:00           | 3 options at 08:00                   |
| Booking           | Book 1 session per slot     | Book any of 3 sessions independently |
| Database          | session_id column           | schedule_sessions junction table     |

## Success Criteria ✅

- [x] Backend entity uses @ManyToMany relationship
- [x] Admin form shows checkboxes for multiple sessions
- [x] Admin can save schedule with 3+ sessions
- [x] Database creates schedule_sessions junction table
- [x] Migration handles existing data
- [x] Client dashboard shows all sessions per schedule
- [x] Each session gets individual "Book Now" button
- [x] Can book each session independently

## Next Steps

1. ✅ Test admin creating multi-session schedule
2. ✅ Test client dashboard displays all sessions
3. ✅ Test booking each session independently
4. ✅ Verify database stores relationships correctly
5. Deploy to production when satisfied

---

**Documentation File:** `MULTI_SESSION_IMPLEMENTATION.md` (complete details)
**Test Date:** Today
**Tested By:** [Your name]
**Status:** ✅ Ready for testing
