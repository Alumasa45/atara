# 🔑 Get Fresh Token & Test Trainers API

## Step 1: Login to Get Fresh Token

Open `app.http` and run this request:

```http
### Login - Admin User
POST http://localhost:3000/auth/login
Content-Type: application/json

{
    "email": "aquinattaalumasa@gmail.com",
    "password": "Akwinara2005!"
}
```

**Expected Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

---

## Step 2: Copy the Fresh Token

Copy the entire `access_token` value (without quotes).

---

## Step 3: Update app.http

Replace line 2 in `app.http`:

**OLD:**

```
@adminToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjI0NzQ1NSwiZXhwIjoxNzYyMjQ4MzU1fQ.-8l2T6--fQ0VSUZkBw4wgbnGo3aFjm7AvgAbTDdm0PU
```

**NEW:**

```
@adminToken=<PASTE_YOUR_NEW_TOKEN_HERE>
```

---

## Step 4: Test the Three Endpoints

### Test 4a: Debug Endpoint (Check Role)

```http
GET http://localhost:3000/admin/debug/whoami
Authorization: Bearer {{adminToken}}
```

**Should return:**

```json
{
  "message": "Current user info",
  "payload": {
    "userId": 7,
    "role": "admin"
  },
  "role": "admin",
  "isAdmin": true
}
```

✅ If `isAdmin: true` → Your token is correct!

---

### Test 4b: Get All Trainers (Admin Endpoint)

```http
GET http://localhost:3000/admin/trainers?page=1&limit=100
Authorization: Bearer {{adminToken}}
```

**Should return:**

```json
{
  "data": [
    {
      "trainer_id": 1,
      "name": "Trainer 1",
      "specialty": "yoga",
      "email": "trainer1@test.com",
      "phone": "111111",
      "status": "active"
    },
    ...
  ],
  "total": 3,
  "page": 1,
  "limit": 100,
  "pages": 1
}
```

✅ If you see trainers → Backend is working!

---

### Test 4c: Get All Trainers (Public Endpoint)

```http
GET http://localhost:3000/trainers
Authorization: Bearer {{trainerToken}}
```

**Should return array of trainers (no pagination wrapper)**

Note: This endpoint doesn't need admin role.

---

## Step 5: Backend Console Output

When all three tests work, you should see these logs on backend:

### From Test 4a (/admin/debug/whoami):

```
🔍 [AdminController /admin/debug/whoami] request received
📋 req.user payload: { userId: 7, role: 'admin', ... }
👤 User role: admin
🎯 Required roles: ["admin"]
```

### From Test 4b (/admin/trainers):

```
🚀 [AdminController] GET /admin/trainers called
📋 Query params: { page: '1', limit: '100' }
📝 Query keys: [ 'page', 'limit' ]
🔍 getAllTrainers called with query: { page: 1, limit: 100 }
📄 Pagination - page: 1, limit: 100, skip: 0
🔎 WHERE conditions: {}
✅ Found 3 trainers (total in DB: 3)
📤 Response being sent: { ... }
✅ [AdminController] Returning trainers result
```

---

## Why Old Token Didn't Work

```
OLD ADMIN TOKEN
{
  "userId": 7,
  "role": "admin",
  "iat": 1762247455,
  "exp": 1762248355      ← EXPIRED!
}

Token was only valid for 15 minutes:
1762248355 - 1762247455 = 900 seconds = 15 minutes
```

---

## Checklist

- [ ] Backend running on http://localhost:3000
- [ ] Login endpoint returns fresh token
- [ ] Copied token to `@adminToken` variable in app.http
- [ ] `/admin/debug/whoami` returns `isAdmin: true`
- [ ] `/admin/trainers?page=1&limit=100` returns trainer array
- [ ] Backend logs show all debug messages
- [ ] Frontend can now access `/admin/trainers` page

---

## If Tests Still Fail

### Error: 401 Unauthorized

**Cause:** Token is invalid or expired
**Fix:** Repeat Step 1-3 to get fresh token

### Error: 403 Forbidden

**Cause:** Using wrong token (e.g., trainer token instead of admin)
**Fix:** Make sure you're using `{{adminToken}}` not `{{trainerToken}}`

### Error: 404 Not Found

**Cause:** Backend not running
**Fix:** Run `npm run start:dev` in backend terminal

### Error: Empty trainers array

**Cause:** No trainers in database
**Fix:** Create test trainers:

```sql
INSERT INTO trainers (user_id, name, specialty, email, phone, status)
VALUES (1, 'Trainer 1', 'yoga', 'trainer1@test.com', '111', 'active');
INSERT INTO trainers (user_id, name, specialty, email, phone, status)
VALUES (1, 'Trainer 2', 'pilates', 'trainer2@test.com', '222', 'active');
INSERT INTO trainers (user_id, name, specialty, email, phone, status)
VALUES (1, 'Trainer 3', 'dance', 'trainer3@test.com', '333', 'active');
```

---

## Success Indicators

✅ All these should be true:

1. Backend console shows: `🚀 [AdminController] GET /admin/trainers called`
2. Response includes `"data": [...]` with trainer objects
3. Frontend `/admin/trainers` page shows trainers
4. Frontend `/admin/sessions` page trainer dropdown populated
5. No errors in browser console
6. Network tab shows 200 OK on `/admin/trainers` request
