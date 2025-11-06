# 🚀 Quick Start - Create Trainers & Sessions

## TL;DR - Just Get It Working

### Step 1: Create Multiple Test Trainers

```bash
# Trainer 1: Jane Doe (Yoga)
POST http://localhost:3000/admin/trainers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjMyNjAxNiwiZXhwIjoxNzYyMzI5NjE2fQ.yAmpU_ZTowxkgcG2sx4oJ52RwFrARg5mbSMQC1wsy7M
Content-Type: application/json

{
    "user_id": 8,
    "name": "Jane Doe",
    "specialty": "yoga",
    "phone": "+1234567890",
    "email": "jane@trainer.com",
    "bio": "Experienced yoga instructor",
    "status": "active"
}

---

# Trainer 2: John Smith (Pilates)
POST http://localhost:3000/admin/trainers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjMyNjAxNiwiZXhwIjoxNzYyMzI5NjE2fQ.yAmpU_ZTowxkgcG2sx4oJ52RwFrARg5mbSMQC1wsy7M
Content-Type: application/json

{
    "user_id": 9,
    "name": "John Smith",
    "specialty": "pilates",
    "phone": "+0987654321",
    "email": "john@trainer.com",
    "bio": "Certified pilates instructor",
    "status": "active"
}

---

# Trainer 3: Sarah Johnson (Strength Training)
POST http://localhost:3000/admin/trainers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjMyNjAxNiwiZXhwIjoxNzYyMzI5NjE2fQ.yAmpU_ZTowxkgcG2sx4oJ52RwFrARg5mbSMQC1wsy7M
Content-Type: application/json

{
    "user_id": 10,
    "name": "Sarah Johnson",
    "specialty": "strength",
    "phone": "+1122334455",
    "email": "sarah@trainer.com",
    "bio": "Strength training specialist",
    "status": "active"
}
```

### Step 2: Verify Trainers Created

```bash
GET http://localhost:3000/admin/trainers?page=1&limit=100
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjMyNjAxNiwiZXhwIjoxNzYyMzI5NjE2fQ.yAmpU_ZTowxkgcG2sx4oJ52RwFrARg5mbSMQC1wsy7M
```

**Should return:**

```json
{
  "data": [
    { "trainer_id": 3, "name": "Jane Doe", "specialty": "yoga", ... },
    { "trainer_id": 4, "name": "John Smith", "specialty": "pilates", ... },
    { "trainer_id": 5, "name": "Sarah Johnson", "specialty": "strength", ... }
  ],
  "total": 3
}
```

### Step 3: Create Sessions

```bash
# Session 1: Yoga with Jane Doe
POST http://localhost:3000/sessions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjMyNjAxNiwiZXhwIjoxNzYyMzI5NjE2fQ.yAmpU_ZTowxkgcG2sx4oJ52RwFrARg5mbSMQC1wsy7M
Content-Type: application/json

{
    "category": "yoga",
    "description": "Morning calm & stretch",
    "duration_minutes": 60,
    "capacity": 15,
    "price": 2500,
    "trainer_id": 3
}

---

# Session 2: Pilates with John Smith
POST http://localhost:3000/sessions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjMyNjAxNiwiZXhwIjoxNzYyMzI5NjE2fQ.yAmpU_ZTowxkgcG2sx4oJ52RwFrARg5mbSMQC1wsy7M
Content-Type: application/json

{
    "category": "pilates",
    "description": "Core strengthening",
    "duration_minutes": 45,
    "capacity": 12,
    "price": 3000,
    "trainer_id": 4
}

---

# Session 3: Strength Training with Sarah
POST http://localhost:3000/sessions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjMyNjAxNiwiZXhwIjoxNzYyMzI5NjE2fQ.yAmpU_ZTowxkgcG2sx4oJ52RwFrARg5mbSMQC1wsy7M
Content-Type: application/json

{
    "category": "strength",
    "description": "Full body workout",
    "duration_minutes": 90,
    "capacity": 10,
    "price": 3500,
    "trainer_id": 5
}
```

### Step 4: Verify Sessions Created

```bash
GET http://localhost:3000/sessions?page=1&limit=50
```

**Should return:**

```json
{
  "data": [
    { "session_id": 1, "trainer_id": 3, "category": "yoga", ... },
    { "session_id": 2, "trainer_id": 4, "category": "pilates", ... },
    { "session_id": 3, "trainer_id": 5, "category": "strength", ... }
  ],
  "total": 3
}
```

### Step 5: Check Frontend

1. **Open Admin Dashboard** → `/admin/sessions`
2. **Should see:**
   - 3 sessions listed ✅
   - Each with trainer name ✅
   - Trainer dropdown shows 3 options ✅
3. **Refresh trainer dropdown** to verify populated
4. **Create new session** using form
   - Select trainer from dropdown ✅
   - Fill details ✅
   - Click "Create Session" ✅
   - ✅ SUCCESS!

---

## API Tokens Used

```
Admin Token (expires Nov 5, 2025):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjMyNjAxNiwiZXhwIjoxNzYyMzI5NjE2fQ.yAmpU_ZTowxkgcG2sx4oJ52RwFrARg5mbSMQC1wsy7M
```

**Note:** This token is expired. Use one from localStorage or get new one via login.

---

## Troubleshooting

| Issue               | Fix                                                     |
| ------------------- | ------------------------------------------------------- |
| 401 Unauthorized    | Token expired - login again in frontend                 |
| 403 Forbidden       | User not admin - login as admin                         |
| 404 Not Found       | Backend not running - start with `npm run start:dev`    |
| "Trainer not found" | Make sure trainer_id exists - check GET /admin/trainers |
| Empty dropdown      | Refresh page or check GET /admin/trainers returns data  |

---

## Done! 🎉

Once you complete these steps:

- ✅ Trainers page shows 3 trainers
- ✅ Sessions page has 3 sessions
- ✅ Can create new sessions with trainer selection
- ✅ Trainer dropdown populated in all forms
