# Test Trainer API Endpoint

## Issue

Frontend shows "No trainers found" (0 trainers) but backend should have 3 trainers in the database.

## Steps to Debug

### Step 1: Check Backend Console

After starting the backend (`npm run start:dev`), look for these log messages when you visit the trainers page:

```
🚀 [AdminController] GET /admin/trainers called
📋 Query params: { page: 1, limit: 100 }
📝 Query keys: [ 'page', 'limit' ]
🔍 getAllTrainers called with query: { page: 1, limit: 100 }
📄 Pagination - page: 1, limit: 100, skip: 0
🔎 WHERE conditions: {}
✅ Found X trainers (total in DB: X)
📊 Trainers data: [...]
📤 Response being sent: {...}
✅ [AdminController] Returning trainers result
```

### Step 2: Check Frontend Console

Open DevTools (F12) → Console tab

You should see:

```
Trainers response: {data: Array(3), total: 3, page: 1, limit: 100, pages: 1}
```

If you see an error instead, it will show what went wrong.

### Step 3: Check Network Tab

1. Open DevTools (F12) → Network tab
2. Reload the trainers page
3. Look for the request to `admin/trainers?page=1&limit=100`
4. Check:
   - **Status**: Should be 200 (not 403, 401, 500, etc.)
   - **Response**: Should contain the trainers array

### Step 4: Manual API Test (Using curl)

First, get your token:

```powershell
# Login as admin
$response = curl -X POST "http://localhost:3000/auth/login" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'

$token = ($response | ConvertFrom-Json).access_token
echo $token
```

Then test the endpoint:

```powershell
$token = "your_token_here"
curl -X GET "http://localhost:3000/admin/trainers?page=1&limit=100" `
  -H "Authorization: Bearer $token"
```

### Step 5: Possible Errors

| Error                         | Cause                                | Fix                                               |
| ----------------------------- | ------------------------------------ | ------------------------------------------------- |
| **401 Unauthorized**          | Token missing or invalid             | Check localStorage token, ensure you're logged in |
| **403 Forbidden**             | User role is not 'admin'             | Ensure logged-in user has admin role              |
| **400 Bad Request**           | Query params not parsing             | Check if page/limit are numbers                   |
| **500 Internal Server Error** | Backend error                        | Check backend console logs                        |
| **Empty data array**          | Query filters excluding all trainers | Check WHERE conditions in logs                    |

---

## Expected Behavior

### Request

```
GET /admin/trainers?page=1&limit=100
Authorization: Bearer <token>
```

### Response

```json
{
  "data": [
    {
      "trainer_id": 1,
      "user_id": 10,
      "name": "Trainer 1",
      "specialty": "yoga",
      "phone": "123456",
      "email": "trainer1@test.com",
      "bio": "Bio",
      "status": "active",
      "user": {...}
    },
    ...
  ],
  "total": 3,
  "page": 1,
  "limit": 100,
  "pages": 1
}
```

---

## Debug Checklist

- [ ] Backend is running (`npm run start:dev`)
- [ ] Frontend is accessing `/admin/trainers` (not `/trainers`)
- [ ] Query params include `page` and `limit`
- [ ] User is logged in as admin
- [ ] Token is being sent in Authorization header
- [ ] No CORS errors in console
- [ ] Backend logs show endpoint being called
- [ ] Backend logs show trainers being found
- [ ] Frontend console shows trainers data

---

## Next Steps

1. Check backend and frontend console logs
2. Look at network response status code
3. If still not working, check:
   - User role in database (should be 'admin')
   - Token validity (decode JWT)
   - Database connection
   - Query builder execution
