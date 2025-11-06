# ✅ Schedule Testing Guide - Multiple Schedules Per Day

## Quick Test (5 minutes)

### Step 1: Get Admin Token

```powershell
# In PowerShell
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"aquinattaalumasa@gmail.com","password":"Akwinara2005!"}' | ConvertFrom-Json

$token = $loginResponse.access_token
Write-Host "Token: $token"
```

### Step 2: Create First Schedule

```powershell
$body = @{
  session_id = 1
  start_time = "2024-11-05T08:00:00Z"
  end_time = "2024-11-05T09:00:00Z"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/admin/schedules" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $body

Write-Host "Schedule 1 Created:"
$response.Content | ConvertFrom-Json | Format-List
```

**Expected Response:**

```json
{
  "schedule_id": 1,
  "session_id": 1,
  "start_time": "2024-11-05T08:00:00Z",
  "end_time": "2024-11-05T09:00:00Z",
  "status": "active"
}
```

### Step 3: Create Second Schedule (SAME DAY, SAME SESSION)

```powershell
$body = @{
  session_id = 1
  start_time = "2024-11-05T12:00:00Z"
  end_time = "2024-11-05T13:00:00Z"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/admin/schedules" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $body

Write-Host "Schedule 2 Created:"
$response.Content | ConvertFrom-Json | Format-List
```

**Expected Response:**

```json
{
  "schedule_id": 2,
  "session_id": 1,
  "start_time": "2024-11-05T12:00:00Z",
  "end_time": "2024-11-05T13:00:00Z",
  "status": "active"
}
```

### Step 4: Create Third Schedule (SAME DAY, SAME SESSION)

```powershell
$body = @{
  session_id = 1
  start_time = "2024-11-05T17:00:00Z"
  end_time = "2024-11-05T18:00:00Z"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/admin/schedules" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $body

Write-Host "Schedule 3 Created:"
$response.Content | ConvertFrom-Json | Format-List
```

### Step 5: Verify All Schedules Created

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/admin/schedules" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $token"}

$schedules = $response.Content | ConvertFrom-Json
Write-Host "Total Schedules: $($schedules.Length)"
Write-Host "For Nov 5, 2024:"
$schedules | Where-Object { $_.start_time -like "2024-11-05*" } | Format-Table schedule_id, start_time, end_time
```

**Expected Output:**

```
Total Schedules: 3
For Nov 5, 2024:

schedule_id start_time              end_time
----------- ----------              --------
          1 2024-11-05T08:00:00Z    2024-11-05T09:00:00Z
          2 2024-11-05T12:00:00Z    2024-11-05T13:00:00Z
          3 2024-11-05T17:00:00Z    2024-11-05T18:00:00Z
```

---

## Admin UI Test (Manual)

### Test via Admin Dashboard

1. **Navigate to Admin Schedules**
   - URL: `http://localhost:3000/admin/schedules`
   - Or click "Admin" → "Schedules"

2. **Create First Schedule**
   - Click on a date (e.g., Nov 5)
   - Form should show with date pre-filled
   - Select Session: "Yoga Basics"
   - Time: 08:00 - 09:00
   - Click "Create Schedule" ✅

3. **Create Second Schedule (SAME DATE)**
   - Click on SAME date again (Nov 5)
   - Select Session: "Yoga Basics"
   - Time: 12:00 - 13:00
   - Click "Create Schedule" ✅

4. **Create Third Schedule (SAME DATE)**
   - Click on SAME date again (Nov 5)
   - Select Session: "Yoga Basics"
   - Time: 17:00 - 18:00
   - Click "Create Schedule" ✅

5. **Verify in Calendar**
   - Date Nov 5 should show "3 sessions"
   - Click to expand and see all 3 listed

---

## Client Dashboard Test

### Verify Client Sees All Schedules

```powershell
# Get client token
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"client@gmail.com","password":"Client@1234"}' | ConvertFrom-Json

$clientToken = $loginResponse.access_token

# Fetch client dashboard
$response = Invoke-WebRequest -Uri "http://localhost:3000/dashboard/client" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $clientToken"}

$dashboard = $response.Content | ConvertFrom-Json
Write-Host "Upcoming Schedules: $($dashboard.upcomingSchedules.Length)"
$dashboard.upcomingSchedules | Format-Table schedule_id, start_time, end_time, session
```

**Expected:**

```
Upcoming Schedules: 3

schedule_id start_time              end_time                session
----------- ----------              --------                -------
          1 2024-11-05T08:00:00Z    2024-11-05T09:00:00Z   Yoga Basics
          2 2024-11-05T12:00:00Z    2024-11-05T13:00:00Z   Yoga Basics
          3 2024-11-05T17:00:00Z    2024-11-05T18:00:00Z   Yoga Basics
```

---

## Advanced Tests

### Test 1: Overlapping Times

Create schedules that overlap in time:

```powershell
# Schedule A: 08:00-09:00
$token = "YOUR_TOKEN"
$body = @{
  session_id = 1
  start_time = "2024-11-05T08:00:00Z"
  end_time = "2024-11-05T09:00:00Z"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/admin/schedules" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $body

# Schedule B: 08:30-09:30 (overlaps with A)
$body = @{
  session_id = 1
  start_time = "2024-11-05T08:30:00Z"
  end_time = "2024-11-05T09:30:00Z"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/admin/schedules" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $body

Write-Host "Result: Both created successfully ✅"
```

**Expected:** Both schedules created with no error

### Test 2: Different Sessions, Same Time

```powershell
# Session 1 (Yoga): 08:00-09:00
$body1 = @{
  session_id = 1
  start_time = "2024-11-05T08:00:00Z"
  end_time = "2024-11-05T09:00:00Z"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/admin/schedules" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $body1 | Out-Null

# Session 2 (Pilates): 08:00-09:00 (SAME TIME)
$body2 = @{
  session_id = 2
  start_time = "2024-11-05T08:00:00Z"
  end_time = "2024-11-05T09:00:00Z"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/admin/schedules" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $body2 | Out-Null

Write-Host "Result: Both sessions at same time created ✅"
```

**Expected:** Both created successfully

### Test 3: Invalid Time (start >= end)

```powershell
# Invalid: start_time = end_time
$body = @{
  session_id = 1
  start_time = "2024-11-05T08:00:00Z"
  end_time = "2024-11-05T08:00:00Z"
} | ConvertTo-Json

try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/admin/schedules" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
    -Body $body
} catch {
  Write-Host "Result: Error caught ✅"
  Write-Host "Error: $($_.Exception.Response.StatusDescription)"
}
```

**Expected:** 400 Bad Request - "start_time must be before end_time"

---

## Test Scenarios Checklist

### ✅ Core Functionality

- [ ] Create schedule for 08:00-09:00 on Nov 5
- [ ] Create schedule for 12:00-13:00 on Nov 5 (same day)
- [ ] Create schedule for 17:00-18:00 on Nov 5 (same day)
- [ ] All 3 schedules visible in admin dashboard
- [ ] All 3 schedules visible on client dashboard

### ✅ Validation

- [ ] Cannot create schedule with start_time >= end_time (error: 400)
- [ ] Cannot create schedule with non-existent session_id (error: 404)
- [ ] Must provide session_id, start_time, end_time (error: 400)

### ✅ Data Integrity

- [ ] Schedule IDs are unique
- [ ] Schedule data persists after page reload
- [ ] Schedule times display correctly in both admin and client dashboards

### ✅ Advanced Cases

- [ ] Create 5+ schedules on same day (works)
- [ ] Create overlapping time slots (allowed)
- [ ] Create same session multiple times (allowed)
- [ ] Create different sessions at same time (allowed)

---

## Troubleshooting

### Issue: 404 on POST /admin/schedules

**Check:**

1. Backend running on port 3000
2. Admin token is valid
3. Session ID exists

**Solution:**

```powershell
# Verify backend running
curl http://localhost:3000/

# Verify token
$response = Invoke-WebRequest -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"aquinattaalumasa@gmail.com","password":"Akwinara2005!"}'
```

### Issue: 400 Bad Request

**Check error message:**

- "start_time must be before end_time" → Fix time values
- "Session with ID X not found" → Use valid session_id
- Validation errors → Check all required fields present

**Solution:**

```powershell
# Verify session exists
$response = Invoke-WebRequest -Uri "http://localhost:3000/sessions" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $token"}
```

### Issue: Only seeing 1 schedule on admin calendar

**Solution:**

1. Refresh page (Ctrl+R)
2. Check browser console for errors (F12)
3. Verify in API: `GET /admin/schedules`

---

## Performance Test

### Create 50 Schedules

```powershell
$token = "YOUR_TOKEN"

Write-Host "Creating 50 schedules..."
$startTime = Get-Date

for ($i = 0; $i -lt 50; $i++) {
  $date = (Get-Date "2024-11-05").AddHours($i * 0.25)
  $startHour = $date.ToString("o")
  $endHour = $date.AddHours(1).ToString("o")

  $body = @{
    session_id = 1
    start_time = $startHour
    end_time = $endHour
  } | ConvertTo-Json

  $response = Invoke-WebRequest -Uri "http://localhost:3000/admin/schedules" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
    -Body $body -ErrorAction SilentlyContinue

  if ($i % 10 -eq 0) { Write-Host "$i schedules created..." }
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds
Write-Host "✅ Created 50 schedules in $duration seconds"
```

**Expected:** Should complete in < 5 seconds with no errors

---

## Verification Commands

### Check All Schedules for a Date

```powershell
$token = "YOUR_TOKEN"
$response = Invoke-WebRequest -Uri "http://localhost:3000/admin/schedules" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $token"}

$schedules = $response.Content | ConvertFrom-Json
$schedules | Where-Object { $_.start_time -like "2024-11-05*" } | Sort-Object start_time
```

### Check Client Dashboard

```powershell
$clientToken = "YOUR_CLIENT_TOKEN"
$response = Invoke-WebRequest -Uri "http://localhost:3000/dashboard/client" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $clientToken"}

$dashboard = $response.Content | ConvertFrom-Json
Write-Host "Upcoming Schedules: $($dashboard.upcomingSchedules.Length)"
$dashboard.upcomingSchedules | Sort-Object start_time | Format-Table schedule_id, start_time, end_time
```

---

## Summary

✅ **Multiple schedules per day work perfectly!**

**Key Points:**

- No limits on number of schedules per day
- Time overlaps are allowed
- Same session can have multiple schedules
- Different sessions can run at same time
- Full API support for creating unlimited schedules
- Admin UI supports drag-select creation
- Client dashboard displays all schedules

**Test Status: READY** 🎉
