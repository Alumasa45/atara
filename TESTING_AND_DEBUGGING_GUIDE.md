# Trainer Dashboard Testing & Debugging Guide

## Overview

You now have comprehensive test endpoints in `app.http` to identify exactly where any errors are occurring. This will help us isolate whether issues are in:

- ✅ Backend API endpoints
- ✅ Database queries
- ✅ Frontend API calls
- ✅ Static file serving

## Files Updated

### 1. `app.http` - Updated with comprehensive test endpoints

- ✅ Login as trainer (get token)
- ✅ Test all dashboard endpoints
- ✅ Test related endpoints (trainers, sessions, bookings, schedules)
- ✅ Test client dashboard for comparison
- ✅ Health check endpoint

### 2. `TRAINER_DASHBOARD_TESTING.md` - Detailed testing guide

- Step-by-step instructions
- Expected responses
- Diagnostic flowchart
- Common errors and solutions

### 3. `QUICK_TEST_REFERENCE.md` - Quick reference

- Fast reference for testing
- Status code guide
- Error troubleshooting

## How to Test

### Using REST Client in VS Code

1. Open `app.http` file in VS Code
2. Install REST Client extension if not already installed
3. You'll see blue "Send Request" links above each endpoint
4. Click "Send Request" to test an endpoint
5. Response appears on the right side

### Manual Testing

If you don't want to use REST Client:

1. Use Postman, cURL, or your browser's Network tab
2. Manually copy the endpoints from app.http
3. Replace `{{trainerToken}}` with actual token value

## Step-by-Step Testing Process

### Phase 1: Get Authentication Token

1. Find section "### 1. Login as trainer (get token)"
2. Click "Send Request"
3. Copy the `access_token` from response
4. Paste at top of file: `@trainerToken=YOUR_TOKEN_HERE`

### Phase 2: Test Individual Endpoints

Test these in order:

**Priority 1 (Most Important):**

- `GET /dashboard/trainer` - **Main endpoint we're fixing**
- `GET /` - Health check

**Priority 2 (Related):**

- `GET /trainers` - List all trainers
- `GET /trainers/1` - Single trainer
- `GET /sessions` - All sessions
- `GET /bookings` - All bookings
- `GET /schedule` - All schedules

### Phase 3: Analyze Results

Check status codes:

- **200 OK** → Endpoint working ✅
- **404 Not Found** → Route not registered or static files serving it
- **403 Forbidden** → Authorization failed (wrong role)
- **401 Unauthorized** → Invalid/missing token
- **500 Server Error** → Backend threw exception

## What Each Response Should Show

### Dashboard Endpoint Response

```json
{
  "trainer": {
    "trainer_id": 1,
    "user_id": 8,
    "name": "Trainer Name",
    "specialty": "yoga",
    "phone": "+1234567890",
    "email": "trainer@example.com",
    "bio": "Bio",
    "status": "active"
  },
  "sessions": [], // Empty for new trainer
  "upcomingSchedules": [], // Empty for new trainer
  "bookings": [], // Empty for new trainer
  "cancellations": [], // Empty for new trainer
  "stats": {
    "totalSessions": 0,
    "totalBookings": 0,
    "cancelledBookings": 0,
    "upcomingCount": 0
  }
}
```

Empty arrays are **EXPECTED** for a new trainer with no bookings!

## Troubleshooting Matrix

| Endpoint           | Status             | Meaning             | Action                                   |
| ------------------ | ------------------ | ------------------- | ---------------------------------------- |
| /dashboard/trainer | 200                | ✅ Working          | Continue to frontend                     |
| /dashboard/trainer | 404                | Route not found     | Restart backend, check ServeStaticModule |
| /dashboard/trainer | 403                | Wrong role          | Login as trainer account                 |
| /dashboard/trainer | 401                | Invalid token       | Get new token                            |
| /dashboard/trainer | 500                | Backend error       | Check backend console                    |
| / (health)         | 200                | Backend responding  | Good                                     |
| /                  | Connection refused | Backend not running | Start with `npm run start:dev`           |

## Next Steps Based on Results

### ✅ If all endpoints return 200

- Backend is working correctly
- Problem is likely in frontend
- Check browser console for frontend errors
- Verify frontend is using correct API base URL

### ❌ If /dashboard/trainer returns 404

- Static file serving is intercepting the request
- Restart backend after fixing ServeStaticModule
- Test again

### ❌ If /dashboard/trainer returns 403

- Check token is from trainer account
- Verify you logged in as trainer, not client
- Get new token and test again

### ❌ If /dashboard/trainer returns 500

- Backend has an error
- Check backend console for stack trace
- Could be database issue, query error, or missing profile

## Important Notes

1. **Token Expiration**: Tokens expire after 1 hour (3600s). Get a new one if testing takes long.

2. **Clean Slate**: New trainers have empty sessions, bookings, etc. This is correct!

3. **Database Data**: Results depend on what data exists in database.
   - New trainer = empty arrays (expected)
   - Trainer with sessions = sessions and bookings populated

4. **Restart After Code Changes**: If you made code changes, always restart backend.

5. **Check Backend Console**: Always look at the terminal where backend is running - errors there will help debug.

## Success Criteria

✅ You know the dashboard is working when:

- [ ] `/dashboard/trainer` returns 200 OK
- [ ] Response contains trainer object
- [ ] Response contains sessions, bookings, stats arrays
- [ ] Frontend loads dashboard without 404 errors
- [ ] Dashboard displays trainer data correctly

## Questions to Ask Yourself

1. **Is backend running?** Check by testing `GET /`
2. **Do I have correct token?** Is it from trainer account?
3. **Did backend start without errors?** Check backend console
4. **Did I restart after code changes?** Stop and start backend
5. **Did I paste the full token?** It should be a long JWT string

## Contact Points for Debugging

If still having issues, provide:

1. Response from `GET /dashboard/trainer` (full JSON)
2. HTTP status code
3. Error message if any
4. Backend console logs
5. Frontend browser console logs
6. Trainer account email/password you used
