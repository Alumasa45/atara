# Phase 4 Testing Quick Start

## Preparation

### 1. Run Database Migrations

```bash
npm run typeorm migration:run
```

This will:

- Create the `schedule_time_slots` table
- Refactor the `schedules` table to use `date` field
- Add `time_slot_id` column to `bookings` table

### 2. Restart Backend

```bash
npm run start:dev
```

## Manual Testing Flow

### Test as Admin

1. **Navigate to Admin Schedules Page**
   - URL: `http://localhost:3000/admin/schedules`
   - Click "+ Create Schedule"

2. **Create Schedule with Multiple Time Slots**
   - Date: Pick any future date
   - Add Slots:
     - Slot 1: Session A, 10:00-11:00
     - Slot 2: Session B, 11:00-12:00
     - Slot 3: Session A, 14:00-15:00
   - Submit

3. **Verify in Admin Calendar**
   - Should show date with "3" (number of sessions)
   - Click to expand and see all time slots

### Test as Client

1. **Login as Client**
   - Navigate to `http://localhost:3000/client`
   - You should see "All Upcoming Sessions" section

2. **View Time Slots**
   - Each time slot should appear separately
   - Format: "Session Title | HH:MM | Category"
   - Should see 3 separate "Book Now" buttons for the 3 time slots

3. **Book First Time Slot**
   - Click "Book Now" on first slot
   - Should navigate to `/time-slot/{slot_id}/book`
   - Verify modal shows:
     - Correct session title
     - Correct time range (e.g., "10:00 - 11:00")
     - Correct date

4. **Complete Booking Flow**
   - Choose booking method (registered or guest)
   - Fill in details if guest
   - Add payment reference (optional)
   - Submit
   - Should see success message
   - Should see booking in "Upcoming Sessions"

5. **Book Second Time Slot**
   - Go back to dashboard
   - Click "Book Now" on second slot
   - Verify it shows correct session/time
   - Book it

6. **Verify Bookings**
   - Both bookings should appear in "Upcoming Sessions"
   - Each shows correct session and date
   - Status shows as "booked"

## API Testing (cURL/Postman)

### Create Booking with Time Slot ID

```bash
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "time_slot_id": 1,
    "user_id": 123,
    "payment_reference": "REF123"
  }'
```

### Expected Response

```json
{
  "booking_id": 456,
  "time_slot_id": 1,
  "schedule_id": 10,
  "user_id": 123,
  "status": "booked",
  "date_booked": "2024-01-15T10:30:00Z"
}
```

## Validation Checklist

### Frontend

- [ ] ClientDashboard displays time slots correctly
- [ ] Each time slot has correct session title, time, trainer
- [ ] "Book Now" button navigates to correct URL
- [ ] BookingFlow modal shows correct time slot details
- [ ] Can complete booking successfully
- [ ] Booked time slot appears in "Upcoming Sessions"

### Backend

- [ ] Migrations complete without errors
- [ ] Booking API accepts `time_slot_id`
- [ ] Time slot lookup works correctly
- [ ] Capacity calculations work per time slot
- [ ] Multiple bookings for same time slot are tracked
- [ ] Capacity limit prevents overbooking

### Database

- [ ] `schedule_time_slots` table created
- [ ] `schedules` table has `date` column
- [ ] `bookings` table has `time_slot_id` column
- [ ] Foreign keys are correct
- [ ] Existing bookings have `time_slot_id` populated

## Troubleshooting

### Issue: "No upcoming sessions available"

- Check that admin created schedules for future dates
- Check that schedules have time slots
- Check database: `SELECT * FROM schedules`
- Check: `SELECT * FROM schedule_time_slots`

### Issue: "Book Now" button not appearing

- Check browser console for errors
- Verify fetch is returning schedules with timeSlots
- Check API response in Network tab

### Issue: Booking creation fails

- Check that `time_slot_id` exists in database
- Check FK constraints
- Verify JWT token has proper user_id
- Check backend logs for errors

### Issue: Time slots not showing in booking modal

- Verify `schedule.date` field is populated
- Check that `schedule.timeSlots` array exists
- Verify time slot has `session` relationship loaded

## Rollback (if needed)

If migrations fail or need to rollback:

```bash
npm run typeorm migration:revert
```

This will:

- Drop `schedule_time_slots` table
- Restore `schedules` table to original schema
- Remove `time_slot_id` column from `bookings`
- Restore `start_time`/`end_time` to schedules

## Performance Notes

- Time slot queries are optimized with eager loading
- Each schedule query includes all time slots and sessions
- Capacity calculations are done per time slot
- Consider adding pagination if schedules grow large

## Next: Production Deployment

Once testing is complete:

1. Deploy migrations to staging
2. Test full workflow on staging
3. Deploy to production (migrations first)
4. Monitor for errors in production logs
5. Test booking flow with real users
