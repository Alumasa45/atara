# Multi-Session Per Schedule Implementation - Complete Guide

## Overview

Successfully implemented the ability to add **multiple sessions to ONE schedule**. This allows the business model where ~3 different sessions (Yoga, Pilates, Strength Training) can be offered in the same time slot (e.g., 08:00-09:00 AM), and clients can choose which one to book.

## Architecture Changes

### Database Schema

**Changed from:** ManyToOne relationship (1 schedule → 1 session)
**Changed to:** ManyToMany relationship (1 schedule → many sessions)

**New Junction Table:** `schedule_sessions`

- `schedule_id` (FK) → schedules.schedule_id
- `session_id` (FK) → sessions.session_id
- Primary key: (schedule_id, session_id)

### Entity Changes

**File:** `src/schedule/entities/schedule.entity.ts`

- **Removed:** `@ManyToOne() session: Session; session_id: number;`
- **Added:** `@ManyToMany(() => Session) @JoinTable() sessions: Session[]; @RelationId() session_ids: number[];`
- **Impact:** Schedule can now hold multiple session references

### Data Transfer Object Changes

**File:** `src/schedule/dto/create-schedule.dto.ts`

- **Changed:** `session_id: number` → `session_ids: number[]`
- **Added Validators:** `@IsArray()` and `@IsInt({ each: true })`
- **Impact:** API now accepts array of session IDs with proper validation

### Backend Service Changes

**File:** `src/admin/admin.service.ts`

**createSchedule method:**

```typescript
// OLD: const session = await this.sessionRepository.findOne(sessionId);
// NEW: const sessions = await this.sessionRepository.findByIds(sessionIds);

// Validates all session IDs exist
// Creates schedule with sessions array
// const schedule = this.scheduleRepository.create({
//   sessions: sessions,
//   start_time, end_time
// });
```

**updateSchedule method:**

- Updated to handle `session_ids` array parameter
- Changed relations from `['session']` to `['sessions']`
- Validates all provided session IDs exist
- Updates: `schedule.sessions = sessions`

### Dashboard Service Changes

**File:** `src/dashboards/dashboard.service.ts`

- Updated 6 database queries from `.leftJoinAndSelect('s.session', 'ses')` to `.leftJoinAndSelect('s.sessions', 'ses')`
- Locations:
  1. Client dashboard - upcomingBookings query
  2. Client dashboard - pastBookings query
  3. Client dashboard - upcomingSchedules query
  4. Trainer dashboard - upcomingSchedules query
  5. Trainer dashboard - bookings query
  6. Trainer dashboard - cancellations query + stats query
- **Impact:** Dashboard now loads all sessions per schedule correctly

### Frontend Admin Form Changes

**File:** `frontend/src/pages/AdminSchedulesPage.tsx`

**Interface Updates:**

```typescript
// OLD: session?: Session; session_id?: number;
// NEW: sessions?: Session[]; session_ids?: number[];

// CreateScheduleForm
// OLD: session_id: string;
// NEW: session_ids: number[];
```

**Form State Updates:**

- Initial state: `session_ids: []` (instead of `session_id: ''`)
- handleDateClick: Sets `session_ids: []` for new schedules
- Form reset after submit: `session_ids: []`

**Form Submission Logic:**

```typescript
// OLD: Validation: !formData.session_id
// NEW: Validation: formData.session_ids.length === 0

// OLD: Payload: { session_id: formData.session_id }
// NEW: Payload: { session_ids: formData.session_ids }
```

**Form UI - Multi-Checkbox Interface:**
Completely replaced single dropdown with checkbox interface:

- Displays all available sessions
- Multiple checkboxes allow selecting multiple sessions
- Each checkbox toggles session ID in array
- Shows validation error if no sessions selected
- Displays for each session: title, category, duration
- Styled: Border box with light gray background

### Client Dashboard Display Changes

**File:** `frontend/src/pages/ClientDashboard.tsx`

**Key Changes:**

1. **Session Count:** Changed from counting schedules to counting total sessions

   ```typescript
   // OLD: upcomingSchedules?.length || 0
   // NEW: upcomingSchedules?.reduce((total, s) => total + (s.sessions?.length || 0), 0)
   ```

2. **Nested Loop:** Added inner loop to display each session per schedule

   ```typescript
   upcomingSchedules.map(schedule =>
     schedule.sessions.map(session =>
       // Display individual session card
     )
   )
   ```

3. **Session Display:** Each session now has:
   - Session title
   - Category
   - Duration in minutes
   - Trainer name
   - Schedule date and time (shared across sessions in slot)
   - Individual "Book Now" button linking to session ID (not schedule ID)

4. **Fallback:** Shows message if schedule has no sessions

## Database Migration

**File:** `src/migrations/1763500000000-CreateScheduleSessionsJunctionTable.ts`

**Up Migration:**

1. Creates `schedule_sessions` junction table
2. Adds foreign key constraints to schedules and sessions
3. Migrates existing data from `session_id` column to junction table
4. Removes old `session_id` column and foreign key

**Down Migration:**

- Recreates `session_id` column
- Restores foreign key constraint
- Drops junction table

## Testing Checklist

### Admin Functionality

- [ ] Admin can create schedule with 08:00-09:00 time slot
- [ ] Admin form shows all available sessions as checkboxes
- [ ] Admin can select multiple sessions (Yoga, Pilates, Strength)
- [ ] Admin can save schedule with multiple sessions
- [ ] Form validation prevents saving without selecting sessions

### Database

- [ ] Migration runs successfully: `pnpm migration:run`
- [ ] `schedule_sessions` junction table created
- [ ] Existing schedules migrated to junction table
- [ ] Old `session_id` column removed from schedules

### Client Dashboard

- [ ] Dashboard loads schedule with 3 sessions
- [ ] Session count shows 3 (not 1 schedule count)
- [ ] Each session displays as separate card
- [ ] Each session has own "Book Now" button
- [ ] Clicking "Book Now" directs to correct session

### Booking Flow

- [ ] Can book Session 1 (Yoga) from same schedule
- [ ] Can book Session 2 (Pilates) from same schedule
- [ ] Can book Session 3 (Strength) from same schedule
- [ ] Each booking is independent
- [ ] Booking capacity works per session (not shared)

## API Changes

### Create Schedule

**Endpoint:** `POST /admin/schedules`

**Old Request:**

```json
{
  "session_id": 1,
  "start_time": "2025-01-15T08:00:00Z",
  "end_time": "2025-01-15T09:00:00Z"
}
```

**New Request:**

```json
{
  "session_ids": [1, 2, 3],
  "start_time": "2025-01-15T08:00:00Z",
  "end_time": "2025-01-15T09:00:00Z"
}
```

### Get Dashboard

**Endpoint:** `GET /dashboard/client`

**Old Response - Upcoming Schedules:**

```json
{
  "schedule_id": 1,
  "session": { "session_id": 1, "title": "Yoga" },
  "start_time": "2025-01-15T08:00:00Z"
}
```

**New Response - Upcoming Schedules:**

```json
{
  "schedule_id": 1,
  "sessions": [
    { "session_id": 1, "title": "Yoga", "trainer": { "name": "John" } },
    { "session_id": 2, "title": "Pilates", "trainer": { "name": "Jane" } },
    { "session_id": 3, "title": "Strength", "trainer": { "name": "Mike" } }
  ],
  "start_time": "2025-01-15T08:00:00Z"
}
```

## Backward Compatibility

⚠️ **Breaking Changes:**

- Any API consumers expecting `session_id` need to update to `session_ids`
- Any frontend expecting `schedule.session` needs to update to `schedule.sessions`
- Database migration is required before deploying

## Deployment Steps

1. **Database Migration**

   ```bash
   pnpm migration:run
   ```

2. **Backend Rebuild**

   ```bash
   pnpm build
   ```

3. **Frontend Rebuild**

   ```bash
   cd frontend
   npm run build
   ```

4. **Restart Application**
   - Stop backend: `Ctrl+C`
   - Start backend: `pnpm start`

## Files Modified

### Backend

- `src/schedule/entities/schedule.entity.ts` - Entity relationship change
- `src/schedule/dto/create-schedule.dto.ts` - DTO update for array
- `src/admin/admin.service.ts` - Service logic for multiple sessions
- `src/dashboards/dashboard.service.ts` - Dashboard queries updated
- `src/migrations/1763500000000-CreateScheduleSessionsJunctionTable.ts` - Database migration

### Frontend

- `frontend/src/pages/AdminSchedulesPage.tsx` - Admin form for multi-select
- `frontend/src/pages/ClientDashboard.tsx` - Client display for multiple sessions

## Business Benefit

**Before:**

- One schedule = one session type
- Can't offer Yoga, Pilates, and Strength at same time
- Clients limited to one option per time slot

**After:**

- One schedule = multiple session types
- Can offer Yoga, Pilates, and Strength at 08:00-09:00 AM
- Clients can choose which session to book
- Support ~3 sessions per day as required

## Support & Troubleshooting

### Issue: "At least one session is required" on form submission

**Solution:** Ensure at least one checkbox is selected before saving

### Issue: Client doesn't see new sessions

**Solution:**

1. Verify migration ran: `pnpm migration:run`
2. Clear browser cache
3. Reload client dashboard

### Issue: Session duplication in database

**Solution:** This shouldn't happen with TypeORM @ManyToMany. If it does, check migration ran successfully

### Issue: Booking capacity showing wrong count

**Solution:** Booking capacity is per session, not shared. Each session has independent capacity.
