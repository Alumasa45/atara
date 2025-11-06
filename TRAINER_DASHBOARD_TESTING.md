# Trainer Dashboard Endpoint Testing Guide

## How to Use the app.http File for Testing

The `app.http` file now contains all the endpoints you need to test the trainer dashboard. Follow these steps:

### Step 1: Get a Trainer Token

1. In VS Code, open `app.http` file
2. Look for the "### 1. Login as trainer (get token)" section
3. Click "Send Request" button above it (or use the REST Client extension)
4. You'll see the response with `access_token`
5. **Copy the entire `access_token` value** (it's a JWT string)
6. At the top of the file, find `@trainerToken=PASTE_TRAINER_TOKEN_HERE`
7. Replace `PASTE_TRAINER_TOKEN_HERE` with the token you copied

### Step 2: Get a Client Token (Optional, for comparison)

1. Find the "### 8. Test Client Dashboard" section
2. Click "Send Request" for the login endpoint
3. Copy the `access_token` from the response
4. Replace `@clientToken=PASTE_CLIENT_TOKEN_HERE` at the top with this token

### Step 3: Test Each Endpoint in Order

Once you have the tokens set, you can test these endpoints one by one:

#### **2. Test Trainer Dashboard Endpoint** ⭐ PRIMARY TEST

```
GET http://localhost:3000/dashboard/trainer
Authorization: Bearer {{trainerToken}}
```

**Expected response:**

```json
{
  "trainer": { trainer profile object },
  "sessions": [ array of sessions ],
  "upcomingSchedules": [ array of upcoming schedules ],
  "bookings": [ array of bookings ],
  "cancellations": [ array of cancellations ],
  "stats": {
    "totalSessions": 0,
    "totalBookings": 0,
    "cancelledBookings": 0,
    "upcomingCount": 0
  }
}
```

#### **3. Get Trainer Profile**

```
GET http://localhost:3000/trainers/1
Authorization: Bearer {{trainerToken}}
```

**Expected response:** Trainer object with name, specialty, bio, etc.

#### **4. Get All Trainers**

```
GET http://localhost:3000/trainers
Authorization: Bearer {{trainerToken}}
```

**Expected response:** Array of all trainer objects

#### **5. Get All Sessions**

```
GET http://localhost:3000/sessions
Authorization: Bearer {{trainerToken}}
```

**Expected response:** Array of all sessions

#### **6. Get All Bookings**

```
GET http://localhost:3000/bookings
Authorization: Bearer {{trainerToken}}
```

**Expected response:** Array of all bookings

#### **7. Get All Schedules**

```
GET http://localhost:3000/schedule
Authorization: Bearer {{trainerToken}}
```

**Expected response:** Array of all schedules

#### **9. Test Health Check**

```
GET http://localhost:3000/
```

**Expected response:** 200 OK (HTML page or JSON)

## Diagnostic Flowchart

```
┌─ Test GET /dashboard/trainer
│
├─ 404 Not Found?
│  ├─ YES → Backend serving static files (ServeStaticModule issue)
│  │        SOLUTION: Verify exclude patterns in app.module.ts
│  │                  Restart backend
│  └─ NO → Continue
│
├─ 403 Forbidden?
│  ├─ YES → User is not a trainer (role check failed)
│  │        SOLUTION: Login with correct trainer account
│  │                  Verify token has role: "trainer"
│  └─ NO → Continue
│
├─ 500 Server Error?
│  ├─ YES → Backend error (check server console)
│  │        SOLUTION: Check error logs in backend terminal
│  │                  Verify trainer profile exists in database
│  │                  Check database connection
│  └─ NO → Continue
│
└─ 200 OK with data?
   └─ SUCCESS! Dashboard endpoint is working correctly
```

## Testing Checklist

- [ ] Step 1: Get trainer token and paste in app.http
- [ ] Step 2: Get client token (optional)
- [ ] Test Endpoint 2: /dashboard/trainer
- [ ] Test Endpoint 3: /trainers/1
- [ ] Test Endpoint 4: /trainers (all)
- [ ] Test Endpoint 5: /sessions
- [ ] Test Endpoint 6: /bookings
- [ ] Test Endpoint 7: /schedule
- [ ] Test Endpoint 9: / (health check)

## Common Errors and Solutions

| Error              | Cause                                                     | Solution                                                       |
| ------------------ | --------------------------------------------------------- | -------------------------------------------------------------- |
| 404 Not Found      | Route not registered or static files serving all requests | Verify ServeStaticModule exclude patterns, restart backend     |
| 403 Forbidden      | User doesn't have trainer role                            | Login with trainer account, verify token has correct role      |
| 401 Unauthorized   | Missing or invalid token                                  | Copy correct trainer token and paste in @trainerToken variable |
| 500 Server Error   | Backend error (query, database, etc.)                     | Check backend console for error details                        |
| Connection refused | Backend not running                                       | Start backend with `npm run start:dev`                         |
| Token expired      | JWT expired                                               | Get new token by logging in again                              |

## Expected Responses

### New Trainer (No data yet)

```json
{
  "trainer": {
    "trainer_id": 1,
    "user_id": 8,
    "name": "John Doe",
    "specialty": "yoga",
    "phone": "+1234567890",
    "email": "trainer@example.com",
    "bio": "Experienced trainer",
    "status": "active"
  },
  "sessions": [],
  "upcomingSchedules": [],
  "bookings": [],
  "cancellations": [],
  "stats": {
    "totalSessions": 0,
    "totalBookings": 0,
    "cancelledBookings": 0,
    "upcomingCount": 0
  }
}
```

### Experienced Trainer (With data)

```json
{
  "trainer": { trainer object },
  "sessions": [ 5 sessions ],
  "upcomingSchedules": [ 3 upcoming sessions ],
  "bookings": [ 12 active bookings ],
  "cancellations": [ 1 cancellation request ],
  "stats": {
    "totalSessions": 5,
    "totalBookings": 12,
    "cancelledBookings": 2,
    "upcomingCount": 3
  }
}
```

## Using REST Client in VS Code

If you have the REST Client extension installed:

1. Open `app.http`
2. Look for blue "Send Request" button above each endpoint
3. Click to send
4. Response appears in the right panel
5. View status code, headers, and body

If you don't have it, install: [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

## Next Steps

Once all endpoints return 200 OK:

1. Frontend should load trainer dashboard
2. Data should display in TrainerSessionsPage and TrainerBookingsPage
3. No more 404 errors
4. User can see their trainer profile, sessions, and bookings

## Questions?

Check the error responses for specific error codes and messages that will indicate exactly which part of the system needs fixing.
