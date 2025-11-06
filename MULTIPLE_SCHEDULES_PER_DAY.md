# 📅 Multiple Schedules Per Day - Feature Documentation

## Overview

The Atara Backend system **fully supports creating multiple schedules on the same day**. There are **NO restrictions** on scheduling multiple sessions, multiple trainers, or multiple session types on the same calendar day.

---

## How It Works

### Architecture

```
Schedule Entity (Database)
├─ schedule_id (Primary Key)
├─ session_id (Foreign Key) → Session
├─ start_time (DateTime)
├─ end_time (DateTime)
├─ capacity_override (Optional)
├─ room (Optional)
└─ status (active/cancelled)

✅ NO UNIQUE CONSTRAINTS on date combinations
✅ NO UNIQUE CONSTRAINTS on session_id per day
✅ Multiple schedules per day fully allowed
```

### Backend Support

**File: `src/admin/admin.service.ts`**

```typescript
async createSchedule(createScheduleDto: any, userId: number) {
  // Only validates:
  // 1. Session exists
  // 2. start_time < end_time
  // ✅ NO check for duplicate dates or times

  const schedule = this.scheduleRepository.create({
    session: session,
    start_time: startTime,
    end_time: endTime,
    capacity_override: createScheduleDto.capacity_override,
    room: createScheduleDto.room,
  });

  return await this.scheduleRepository.save(schedule);
}
```

### Frontend Support

**File: `frontend/src/pages/AdminSchedulesPage.tsx`**

```typescript
const handleCreateSubmit = async (e: React.FormEvent) => {
  // Form allows creation without checking for:
  // - Date conflicts
  // - Time overlaps
  // - Number of schedules per day

  // Only validates:
  // - session_id is selected
  // - start_time is provided
  // - end_time is provided

  const payload = {
    session_id: parseInt(formData.session_id),
    start_time: new Date(formData.start_time).toISOString(),
    end_time: new Date(formData.end_time).toISOString(),
    // ... sends to backend
  };
};
```

---

## Use Cases

### 1️⃣ Multiple Time Slots, Same Session Type

```
2024-11-05 (Monday)
├─ 08:00 AM - 09:00 AM: Yoga Basics (Session #1, Trainer: Jane)
├─ 09:30 AM - 10:30 AM: Yoga Basics (Session #1, Trainer: Jane)
├─ 11:00 AM - 12:00 PM: Yoga Basics (Session #1, Trainer: Jane)
└─ 05:00 PM - 06:00 PM: Yoga Basics (Session #1, Trainer: Jane)

✅ All on same day, same session, different times
✅ Capacity: 4 × (max capacity) = 4× the revenue
```

### 2️⃣ Different Session Types, Same Day

```
2024-11-05 (Monday)
├─ 08:00 AM - 09:00 AM: Yoga Flow (Session #1, Trainer: Jane)
├─ 09:30 AM - 10:30 AM: Pilates Core (Session #2, Trainer: John)
├─ 11:00 AM - 12:00 PM: Strength Training (Session #3, Trainer: Sarah)
└─ 05:00 PM - 06:00 PM: Yoga Evening (Session #1, Trainer: Jane)

✅ All on same day, different sessions, different trainers
✅ Maximum flexibility for diverse offerings
```

### 3️⃣ Different Trainers, Same Session Type

```
2024-11-05 (Monday)
├─ 08:00 AM - 09:00 AM: Yoga Basics (Session #1, Trainer: Jane Doe)
├─ 09:30 AM - 10:30 AM: Yoga Basics (Session #1, Trainer: John Smith)
├─ 11:00 AM - 12:00 PM: Yoga Basics (Session #1, Trainer: Sarah Johnson)
└─ 05:00 PM - 06:00 PM: Yoga Basics (Session #1, Trainer: Jane Doe)

✅ Clients can choose their preferred trainer
✅ Session material same, different instructor styles
```

### 4️⃣ Premium & Regular Tiers, Same Session

```
2024-11-05 (Monday)
├─ 08:00 AM - 09:00 AM: Yoga Basics - REGULAR (Session #1, Price: KES 2000)
├─ 08:00 AM - 09:00 AM: Yoga Basics - PREMIUM (Session #2, Price: KES 5000)
├─ 09:30 AM - 10:30 AM: Yoga Basics - REGULAR (Session #1, Price: KES 2000)
└─ 09:30 AM - 10:30 AM: Yoga Basics - PREMIUM (Session #2, Price: KES 5000)

✅ Create session variations with different prices
✅ Time overlap is allowed (same physical slot, different price tier)
```

---

## Creating Multiple Schedules

### Using API (curl)

```bash
# First schedule - 08:00 AM
curl -X POST http://localhost:3000/admin/schedules \
  -H "Authorization: Bearer {{adminToken}}" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 1,
    "start_time": "2024-11-05T08:00:00Z",
    "end_time": "2024-11-05T09:00:00Z"
  }'

# Second schedule - 09:30 AM (SAME DAY, SAME SESSION)
curl -X POST http://localhost:3000/admin/schedules \
  -H "Authorization: Bearer {{adminToken}}" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 1,
    "start_time": "2024-11-05T09:30:00Z",
    "end_time": "2024-11-05T10:30:00Z"
  }'

# Third schedule - 05:00 PM (SAME DAY, SAME SESSION)
curl -X POST http://localhost:3000/admin/schedules \
  -H "Authorization: Bearer {{adminToken}}" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 1,
    "start_time": "2024-11-05T17:00:00Z",
    "end_time": "2024-11-05T18:00:00Z"
  }'
```

### Using Admin Dashboard

1. Navigate to **Admin > Schedules**
2. Click on a date (e.g., November 5)
3. Create first schedule:
   - Select Session
   - Set time: 08:00 - 09:00
   - Click **Create Schedule**
4. Click on **SAME DATE** again
5. Create second schedule:
   - Select Session (same or different)
   - Set time: 09:30 - 10:30
   - Click **Create Schedule**
6. Repeat as needed

### Using app.http Test File

```http
### Create First Schedule
POST http://localhost:3000/admin/schedules
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "session_id": 1,
  "start_time": "2024-11-05T08:00:00Z",
  "end_time": "2024-11-05T09:00:00Z"
}

### Create Second Schedule (SAME DAY)
POST http://localhost:3000/admin/schedules
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "session_id": 1,
  "start_time": "2024-11-05T12:00:00Z",
  "end_time": "2024-11-05T13:00:00Z"
}
```

---

## Validation Rules

### ✅ What IS Allowed

- ✅ Multiple schedules on same day
- ✅ Same session_id used multiple times per day
- ✅ Different session types on same day
- ✅ Overlapping time slots (e.g., 8-9 AM and 8:30-9:30 AM)
- ✅ Multiple trainers on same day
- ✅ Unlimited number of schedules per day

### ❌ What IS NOT Allowed

- ❌ start_time ≥ end_time (duration must be positive)
- ❌ Invalid session_id (session must exist)
- ❌ Missing required fields (session_id, start_time, end_time)

### Code Validation Location

**File: `src/admin/admin.service.ts` (lines 490-495)**

```typescript
// Validate that start_time is before end_time
const startTime = new Date(createScheduleDto.start_time);
const endTime = new Date(createScheduleDto.end_time);

if (startTime >= endTime) {
  throw new BadRequestException('start_time must be before end_time');
}
```

---

## Database Schema

```sql
CREATE TABLE schedules (
  schedule_id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  capacity_override INT,
  room VARCHAR(255),
  status ENUM('active', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- FOREIGN KEY ONLY - no unique constraints
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

-- ✅ NO unique constraints on:
-- - date combinations
-- - session_id + date
-- - time combinations
-- - Any other field
```

---

## Data Flow

### Admin Creates Multiple Schedules

```
Admin Dashboard
│
├─ Click Date (Nov 5)
├─ Fill Form:
│  ├─ Session: Yoga Basics
│  ├─ Time: 08:00 - 09:00
│  └─ Submit
│
├─ POST /admin/schedules
│  └─ Backend receives:
│     ├─ session_id: 1
│     ├─ start_time: 2024-11-05T08:00:00Z
│     └─ end_time: 2024-11-05T09:00:00Z
│
├─ Database Saves Schedule #1
│
├─ Click Date Again (Nov 5 - SAME DAY)
├─ Fill Form:
│  ├─ Session: Yoga Basics (SAME SESSION)
│  ├─ Time: 12:00 - 13:00
│  └─ Submit
│
├─ POST /admin/schedules
│  └─ Backend receives:
│     ├─ session_id: 1 (SAME SESSION)
│     ├─ start_time: 2024-11-05T12:00:00Z
│     └─ end_time: 2024-11-05T13:00:00Z
│
└─ Database Saves Schedule #2 ✅ NO CONFLICTS
```

### Client Views Multiple Schedules

```
Client Dashboard
│
└─ Fetch GET /dashboard/client
   │
   ├─ Backend Query:
   │  └─ SELECT schedules WHERE start_time > NOW()
   │
   └─ Response includes BOTH schedules:
      ├─ Schedule #1:
      │  ├─ session: Yoga Basics
      │  ├─ trainer: Jane Doe
      │  ├─ start_time: 2024-11-05T08:00:00Z
      │  ├─ end_time: 2024-11-05T09:00:00Z
      │  └─ [Book Now]
      │
      └─ Schedule #2:
         ├─ session: Yoga Basics
         ├─ trainer: Jane Doe
         ├─ start_time: 2024-11-05T12:00:00Z
         ├─ end_time: 2024-11-05T13:00:00Z
         └─ [Book Now]
```

---

## Testing

### Test Case 1: Create 3 Schedules on Same Day

**Setup:**

```
Session: Yoga Basics (session_id: 1)
Date: 2024-11-05
```

**Steps:**

1. Create Schedule #1 at 08:00-09:00 ✅
2. Create Schedule #2 at 12:00-13:00 ✅
3. Create Schedule #3 at 17:00-18:00 ✅

**Expected Result:**

- All 3 schedules saved successfully
- No errors, no conflicts
- All visible in admin schedules list
- All visible on client dashboard

**API Test:**

```bash
# See app.http lines 207-257 for complete test suite
```

### Test Case 2: Create Overlapping Times

**Setup:**

```
Session: Yoga Basics (session_id: 1)
Date: 2024-11-05
```

**Steps:**

1. Create Schedule #1 at 08:00-09:00 ✅
2. Create Schedule #2 at 08:30-09:30 ✅ (overlaps with #1)

**Expected Result:**

- Both schedules saved successfully
- No validation error
- System allows time overlaps

### Test Case 3: Create Different Sessions Same Time

**Setup:**

```
Date: 2024-11-05
Time: 08:00-09:00
```

**Steps:**

1. Create Schedule #1: Yoga Basics (session_id: 1) ✅
2. Create Schedule #2: Pilates (session_id: 2) ✅

**Expected Result:**

- Both schedules saved successfully
- Different sessions can run at same time

---

## Performance Considerations

### Database Impact

```
Query: SELECT schedules WHERE start_time > NOW() ORDER BY start_time
│
├─ Time Complexity: O(log n) with proper indexing
├─ Should handle 1000+ schedules easily
└─ Recommendation: Add index on start_time field
```

### Suggested Index

```sql
CREATE INDEX idx_schedules_start_time ON schedules(start_time);
```

### Expected Load

- ✅ 100 schedules/day: Fast response
- ✅ 500 schedules/day: Fast response
- ✅ 1000+ schedules/month: Fast response
- ✅ No practical limit for typical gym use cases

---

## Benefits

| Benefit                     | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| 🎯 **Flexible Scheduling**  | Create as many sessions as needed per day                |
| 💰 **Revenue Optimization** | Multiple time slots = more bookings = more revenue       |
| 👥 **Trainer Flexibility**  | Different trainers can teach same session multiple times |
| 🎨 **Variety**              | Offer different session types throughout the day         |
| 👤 **Client Choice**        | Clients pick their preferred time and trainer            |
| 📈 **Scalability**          | No technical limits on number of schedules               |

---

## Common Use Cases by Business Type

### 🏋️ Gym/Fitness Center

```
Monday Schedule:
├─ 06:00-07:00: Morning Yoga (Jane)
├─ 07:30-08:30: Strength Training (John)
├─ 12:00-13:00: Pilates (Jane)
├─ 17:00-18:00: Evening Yoga (Sarah)
├─ 18:30-19:30: Zumba (John)
└─ 19:00-20:00: Strength Training (Mike)
```

### 🧘 Yoga Studio

```
Monday Schedule:
├─ 06:00-07:00: Sunrise Yoga (Premium)
├─ 06:00-07:00: Sunrise Yoga (Regular)
├─ 09:00-10:00: Vinyasa Flow
├─ 11:00-12:00: Power Yoga
├─ 17:00-18:00: Restorative Yoga
└─ 19:00-20:30: Deep Stretch Evening
```

### 💪 Personal Training

```
Monday Schedule:
├─ 06:00-07:00: PT Session (Client A)
├─ 07:00-08:00: PT Session (Client B)
├─ 08:00-09:00: PT Session (Client C)
├─ 10:00-11:00: Group Training
├─ 14:00-15:00: PT Session (Client D)
└─ 16:00-17:00: PT Session (Client E)
```

---

## Troubleshooting

### Issue: Getting 404 on `/admin/schedules`

**Solution:**

1. Verify admin token is valid
2. Check backend is running
3. Verify user has admin role

### Issue: Getting 400 "start_time must be before end_time"

**Solution:**

1. Check that start_time < end_time
2. Format times as ISO 8601: `2024-11-05T08:00:00Z`
3. Ensure both are valid dates

### Issue: Only seeing one schedule per day in admin UI

**Solution:**

1. Refresh page (F5)
2. Check admin console for errors
3. Verify all schedules exist in database: `GET /admin/schedules`

### Issue: Schedules not showing on client dashboard

**Solution:**

1. Verify schedules have start_time in the future
2. Check dashboard query: `GET /dashboard/client`
3. Verify client has valid token

---

## Summary

✅ **Multiple schedules per day are fully supported and unrestricted**

- No code changes needed
- No configuration changes needed
- Works with existing admin UI
- Works with existing client dashboard
- Production ready right now

**To use this feature:**

1. Open admin schedules page
2. Click a date
3. Create schedule #1
4. Click same date again
5. Create schedule #2
6. Repeat as many times as needed

**That's it!** 🎉
