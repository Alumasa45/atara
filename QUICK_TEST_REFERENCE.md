# Quick Testing Steps

## 1️⃣ Get Trainer Token

In `app.http`, find this section and click "Send Request":

```
### 1. Login as trainer (get token)
POST http://localhost:3000/auth/login
Content-Type: application/json

{
    "email": "ataratrainer@gmail.com",
    "password": "Trainer@1234"
}
```

## 2️⃣ Copy Token

From the response, copy the `access_token` value (entire JWT string)

## 3️⃣ Paste Token

In `app.http` at the top, replace:

```
@trainerToken=PASTE_TRAINER_TOKEN_HERE
```

with:

```
@trainerToken=eyJhbGciOi... (the full token you copied)
```

## 4️⃣ Test Main Endpoint

Click "Send Request" on this endpoint:

```
### 2. Test Trainer Dashboard Endpoint
GET http://localhost:3000/dashboard/trainer
Authorization: Bearer {{trainerToken}}
```

## Expected Results

| Endpoint               | Status | Should Return                      |
| ---------------------- | ------ | ---------------------------------- |
| GET /dashboard/trainer | 200    | trainer, sessions, bookings, stats |
| GET /trainers          | 200    | Array of trainers                  |
| GET /trainers/1        | 200    | Single trainer object              |
| GET /sessions          | 200    | Array of sessions                  |
| GET /bookings          | 200    | Array of bookings                  |
| GET /schedule          | 200    | Array of schedules                 |

## If You Get Errors

| Error              | Fix                               |
| ------------------ | --------------------------------- |
| 404 Not Found      | Restart backend server            |
| 403 Forbidden      | Token is not from trainer account |
| 401 Unauthorized   | Token expired, get new one        |
| 500 Server Error   | Check backend console for error   |
| Connection refused | Backend not running               |

## Success = Dashboard Works! ✅

Once GET /dashboard/trainer returns 200 with data, the frontend should load the trainer dashboard without errors.
