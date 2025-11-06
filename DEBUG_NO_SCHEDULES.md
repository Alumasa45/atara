# 🔧 Debugging: "No Schedules Available" Issue

**Problem**: Booking modal shows "No schedules available" even though admin created schedules

**Root Cause Analysis**:

The issue is likely one of these:

1. **Paginated response format**: API returns `{ data: [...], total, page, limit }` but component expects array
2. **Missing timeSlots**: Schedules exist but don't have `timeSlots` relationship loaded
3. **Missing session data**: Time slots don't have session info populated
4. **Date format issue**: Schedule date field is null or not in expected format

---

## 🔍 What We Fixed

### Fix 1: BookingFlow.tsx - Handle Paginated Response

**File**: `frontend/src/components/BookingFlow.tsx` (lines 35-52)

**Before**:

```tsx
.then((list: any) => {
  const arr = Array.isArray(list) ? list : [];  // ❌ Doesn't handle { data: [...] }
  setSchedules(arr);
```

**After**:

```tsx
.then((response: any) => {
  let arr: any[] = [];
  if (Array.isArray(response)) {
    arr = response;
  } else if (response?.data && Array.isArray(response.data)) {
    arr = response.data;  // ✅ Extracts from paginated response
  } else {
    arr = [];
  }
  setSchedules(arr);
```

### Fix 2: BookingFlow.tsx - Added Debug Logging

**File**: `frontend/src/components/BookingFlow.tsx` (lines 48, 61, 63)

```tsx
console.log('Fetched schedules:', arr);
console.log('Available dates:', keys);
```

And in display (lines 245-257):

```tsx
{dates.length === 0 && (
  <div>
    <div style={{ color: '#999', marginBottom: 12 }}>
      No schedules available
    </div>
    {schedules.length > 0 && (
      <div>Debug: Found {schedules.length} schedules</div>
      <div>First schedule date: {schedules[0]?.date}</div>
    )}
  </div>
)}
```

### Fix 3: BookingForm.tsx - Show All Schedules

**File**: `frontend/src/components/BookingForm.tsx` (lines 23-27)

**Before**: Filtered to only future schedules  
**After**: Shows ALL schedules (no future date filter)

```tsx
// For quick booking, show ALL schedules
setSchedules(scheduleList);
```

---

## 📊 Testing What's Actually Returned

### Step 1: Open Browser Console

Press `F12` → Console tab

### Step 2: Go to Home and Open Booking Modal

Click "Book Now" button → Modal opens

### Step 3: Check Console Output

Look for these logs:

```
Fetched schedules: [...]
Available dates: [...]
BookingForm fetched schedules: ...
```

### Step 4: What Each Log Means

| Log                                                      | What It Shows                                            |
| -------------------------------------------------------- | -------------------------------------------------------- |
| `Fetched schedules: []`                                  | No schedules returned from API                           |
| `Fetched schedules: [...]` with `Available dates: []`    | Schedules returned but `date` field is null or malformed |
| `Fetched schedules: [...]` with `Available dates: [...]` | ✅ Working correctly!                                    |
| `First schedule date: null`                              | Schedule has no date field                               |
| `First schedule date: [value]`                           | Shows actual date value (check if it's correct)          |

---

## 🐛 If Still Showing "No Schedules Available"

### Check Backend API Response

1. **Open Network tab** in browser dev tools
2. **Look for request**: `GET /schedule`
3. **Check Response**:

```json
// Paginated format
{
  "data": [
    {
      "schedule_id": 1,
      "date": "2025-11-10",
      "timeSlots": [
        {
          "slot_id": 1,
          "start_time": "08:00:00",
          "end_time": "09:00:00",
          "session": { "session_id": 1, "title": "Yoga" }
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

### What to Look For

✅ **Good Signs**:

- Response status: 200
- `data` array is not empty
- Each schedule has `date` field (not null)
- Each schedule has `timeSlots` array with data
- Each `timeSlot` has `session` object with title

❌ **Bad Signs**:

- Response status: 500 (server error)
- `data` is empty array
- `date` field is missing or null
- `timeSlots` array is empty or missing
- `timeSlots.session` is null

---

## 🔧 If API Response is Malformed

### Check Backend Relations in schedule.service.ts

The `findAll` method should load relations:

```typescript
// Line ~75
const [items, total] = await this.scheduleRepository.findAndCount({
  skip,
  take: limit,
  order: { schedule_id: 'ASC' },
  relations: ['timeSlots', 'timeSlots.session', 'createdBy'], // ✅ Must include these
});
```

### If `timeSlots` is Empty

Check **schedule.controller.ts** - make sure the relation is eager loaded when returning schedules.

---

## 🚀 Next Steps

1. **Open browser dev tools** (`F12`)
2. **Go to booking page** and check console logs
3. **Take a screenshot** of what appears
4. **Check Network tab** to see API response
5. **Tell me what you see** - then I can pinpoint the exact issue!

---

## 📝 Summary

We've added:

1. ✅ Better response format handling (pagination)
2. ✅ Console logging to see what data is coming
3. ✅ Debug display to show schedule count
4. ✅ All schedules shown (not just future)

**Next action**: Refresh browser and check console logs to see what data is being returned from the API!
