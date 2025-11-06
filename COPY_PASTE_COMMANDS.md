# 🎯 Copy-Paste Commands To Fix Trainers Issue

Use these exact commands to diagnose and fix the problem.

---

## DIAGNOSIS COMMANDS

### 1. Get Your Token (From Browser Console)

```javascript
// Open browser DevTools (F12), go to Console tab, paste:
localStorage.getItem('token');
// This will print your token. Copy it.
```

### 2. Test Authorization - PowerShell

Replace `YOUR_TOKEN_HERE` with the token from step 1:

```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}

# Test if you have admin role
$response = curl -X GET "http://localhost:3000/admin/debug/whoami" `
    -Headers $headers

Write-Host "Response:"
$response | ConvertFrom-Json | ConvertTo-Json
```

**What to look for**:

```
"role": "admin"
"isAdmin": true
```

If `"role"` shows something else (like "trainer" or "client") → **Go to FIX #1 below**

### 3. Check Database Trainers - SQL

```sql
SELECT COUNT(*) as trainer_count FROM trainers;
```

If result is `0` → **Go to FIX #2 below**

If result is `3` or more → Database is fine, issue is authorization

### 4. Get Your User ID - SQL

First, find your user ID:

```sql
SELECT user_id, email, role FROM users WHERE email = 'YOUR_LOGIN_EMAIL@domain.com';
```

Note your `user_id` (you'll need it for Fix #1)

---

## FIX COMMANDS

### FIX #1: Set User to Admin Role

Replace `YOUR_USER_ID` with the number from step 4 above:

```sql
-- Update your user to admin
UPDATE users
SET role = 'admin'
WHERE user_id = YOUR_USER_ID;

-- Verify it worked
SELECT user_id, email, role FROM users WHERE user_id = YOUR_USER_ID;
```

**Then in frontend**:

1. Log out (click Logout button)
2. Refresh page
3. Log back in with same credentials
4. You should get new token with admin role

### FIX #2: Insert Test Trainers into Database

If database shows 0 trainers, create some:

```sql
-- Get a user_id to associate trainers with (use your user_id from step 4, or check:
SELECT user_id FROM users LIMIT 1;

-- Then insert trainers (replace 1 with an actual user_id if needed):
INSERT INTO trainers (user_id, name, specialty, phone, email, bio, status)
VALUES
  (1, 'Trainer One', 'yoga', '111-1111', 'trainer1@test.com', 'Yoga specialist', 'active'),
  (2, 'Trainer Two', 'pilates', '222-2222', 'trainer2@test.com', 'Pilates expert', 'active'),
  (3, 'Trainer Three', 'dance', '333-3333', 'trainer3@test.com', 'Dance instructor', 'inactive');

-- Verify they were created
SELECT COUNT(*) FROM trainers;
SELECT * FROM trainers;
```

---

## VERIFICATION COMMANDS

After applying fixes:

### 1. Browser Console - Check Trainers Load

```javascript
// Open browser DevTools (F12) → Console tab
// Reload the trainers page and look for:
// Should see:
// "Trainers response: {data: Array(3), total: 3, page: 1, limit: 100, pages: 1}"

// Or copy-paste this to manually test:
const token = localStorage.getItem('token');
fetch('http://localhost:3000/admin/trainers?page=1&limit=100', {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((r) => r.json())
  .then((data) => console.log('Trainers:', data))
  .catch((e) => console.error('Error:', e));

// Watch console for response
```

### 2. Database - Verify Trainers Exist

```sql
SELECT * FROM trainers;
```

Should show 3 rows with trainer data.

### 3. Database - Verify Your User is Admin

```sql
SELECT user_id, email, role FROM users WHERE email = 'YOUR_EMAIL@domain.com';
```

Should show `role = 'admin'`

### 4. Backend Logs - Monitor During Request

```powershell
# Terminal 1: Start backend
npm run start:dev

# Terminal 2: In browser, reload trainers page
# Watch Terminal 1 for logs:
# 🚀 [AdminController] GET /admin/trainers called
# ✅ Found 3 trainers (total in DB: 3)
# 📤 Response being sent: ...
```

---

## Complete Test Flow (PowerShell)

Run this complete diagnostic in one go:

```powershell
# 1. Set variables
$apiBase = "http://localhost:3000"

# 2. Login to get token
$loginBody = @{
    email = "YOUR_EMAIL@domain.com"
    password = "YOUR_PASSWORD"
} | ConvertTo-Json

$loginResponse = curl -X POST "$apiBase/auth/login" `
    -ContentType "application/json" `
    -Body $loginBody | ConvertFrom-Json

$token = $loginResponse.access_token
Write-Host "✅ Logged in, token obtained"

# 3. Check who you are
$headers = @{ Authorization = "Bearer $token" }

$whoami = curl -X GET "$apiBase/admin/debug/whoami" `
    -Headers $headers | ConvertFrom-Json

Write-Host "👤 Your role: $($whoami.role)"
Write-Host "🔒 Is admin: $($whoami.isAdmin)"

if ($whoami.role -ne "admin") {
    Write-Host "❌ ERROR: You don't have admin role!"
    Write-Host "   Run FIX #1 to set your role to admin"
    exit
}

Write-Host "✅ You have admin role"

# 4. Get trainers
$trainers = curl -X GET "$apiBase/admin/trainers?page=1&limit=100" `
    -Headers $headers | ConvertFrom-Json

Write-Host "📊 Total trainers in DB: $($trainers.total)"
Write-Host "📋 Trainers in response: $($trainers.data.Count)"

if ($trainers.data.Count -gt 0) {
    Write-Host "✅ SUCCESS! Trainers loading correctly"
    Write-Host "Trainers:"
    $trainers.data | ForEach-Object { Write-Host "  - $($_.name) ($($_.specialty))" }
} else {
    Write-Host "❌ No trainers returned"
    if ($trainers.total -eq 0) {
        Write-Host "   Run FIX #2 to create trainers"
    }
}
```

---

## SQL Scripts (For Database Client)

### Script 1: Check Current State

```sql
-- What's your current user?
SELECT user_id, email, role, status FROM users WHERE email = 'YOUR_EMAIL';

-- How many trainers in DB?
SELECT COUNT(*) as trainer_count FROM trainers;

-- Show trainers
SELECT trainer_id, user_id, name, specialty, email, status FROM trainers;
```

### Script 2: Complete Fix (If Needed)

```sql
-- 1. Make yourself admin
UPDATE users SET role = 'admin' WHERE email = 'YOUR_EMAIL';

-- 2. Create test trainers (if needed)
INSERT INTO trainers (user_id, name, specialty, phone, email, bio, status)
VALUES
  (1, 'Yoga Expert', 'yoga', '555-0001', 'yoga@test.com', 'Certified', 'active'),
  (1, 'Pilates Coach', 'pilates', '555-0002', 'pilates@test.com', 'Certified', 'active'),
  (1, 'Dance Pro', 'dance', '555-0003', 'dance@test.com', 'Professional', 'inactive');

-- 3. Verify
SELECT COUNT(*) FROM trainers;
SELECT user_id, role FROM users WHERE email = 'YOUR_EMAIL';
```

---

## Troubleshooting Commands

### If You Get 403 Error

```powershell
# Check if token is valid
$token = localStorage.getItem('token')  # From browser console

# Test the token
curl -X GET "http://localhost:3000/admin/debug/whoami" `
    -Headers @{ Authorization = "Bearer $token" }

# If 401: Token is invalid or expired
# Solution: Log out and log back in

# If 403: Token is valid but user doesn't have admin role
# Solution: Run FIX #1
```

### If You Get 500 Error

```powershell
# Check backend terminal for error stack trace
# Common causes:
# 1. Database connection issue
# 2. Query syntax error
# 3. Missing data in tables

# Test database connection:
# Open your SQL client and run: SELECT 1;
```

### If Response is Empty Array

```sql
-- Check if trainers table actually has data
SELECT * FROM trainers;

-- If empty, run:
INSERT INTO trainers (user_id, name, specialty, phone, email, bio, status)
VALUES (1, 'Test Trainer', 'yoga', '555-0000', 'test@test.com', 'Test', 'active');

-- Verify:
SELECT COUNT(*) FROM trainers;
```

---

## Quick Reference

| Issue              | Command to Check                            | Fix                       |
| ------------------ | ------------------------------------------- | ------------------------- |
| **Role check**     | `SELECT role FROM users WHERE user_id = 1;` | Should be 'admin'         |
| **Trainers count** | `SELECT COUNT(*) FROM trainers;`            | Should be > 0             |
| **Token valid**    | `/admin/debug/whoami`                       | Should return 200         |
| **API response**   | DevTools Network tab                        | Should be 200 with data   |
| **Data loading**   | Browser console                             | Should show trainer array |

---

## Done When

✅ `SELECT COUNT(*) FROM trainers;` returns 3+  
✅ `/admin/debug/whoami` returns role = "admin"  
✅ Browser shows "Trainers List (3)"  
✅ Trainers table displays 3 rows  
✅ Stats cards show: Total=3, Active=2, Inactive=1

---

**Status**: Ready to execute. Pick the command set that matches your situation above.
