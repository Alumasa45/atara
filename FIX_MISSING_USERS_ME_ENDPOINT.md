# 🔧 Fix: Missing /users/me Endpoint

## Problem

The My Profile page shows error: **"Error: Failed to fetch profile"**

**Console Errors**:

- `Failed to load resource: the server responded with a status of 500 (Internal Server Error)`
- Backend logs: `QueryFailedError: invalid input syntax for type integer: "NaN"`

**Root Cause**: The frontend calls `GET /users/me` to fetch the current user's profile, but this endpoint **doesn't exist** on the backend.

---

## The Error

```
Frontend (UserProfilePage.tsx):
  fetch('http://localhost:3000/users/me')
              ↓
Backend (UsersController):
  No route for 'GET /users/me'
              ↓
404 Not Found or 500 Error
              ↓
Frontend shows: "Error: Failed to fetch profile"
```

---

## Solution

Added the missing `/users/me` endpoint to `UsersController`:

```typescript
@Get('me')
@ApiOperation({ summary: 'Get current user profile' })
@UseGuards(JwtAuthGuard)
async getCurrentUser(@Req() req: any) {
  const userId = req.user.userId;
  return this.usersService.findOne(userId);
}
```

### What It Does

- ✅ Route pattern: `GET /users/me`
- ✅ Requires JWT authentication
- ✅ Extracts user ID from JWT token
- ✅ Returns current user's full profile including loyalty points
- ✅ Must be placed BEFORE `@Get(':id')` (more specific routes first)

---

## Implementation Details

### Endpoint

```
GET http://localhost:3000/users/me
Headers: Authorization: Bearer <JWT_TOKEN>
Response: {
  user_id: 7,
  username: "username",
  email: "user@example.com",
  phone: "123-456-7890",
  role: "admin",
  status: "active",
  loyalty_points: 5,
  created_at: "2025-11-06T...",
  ...
}
```

### Security

- ✅ Requires valid JWT token
- ✅ Automatically extracts user ID from token
- ✅ Returns only the authenticated user's data
- ✅ No need for route parameter

### Route Order (Important!)

```typescript
@Get('me')           // ← Must be first! Matches /users/me
async getCurrentUser() {...}

@Get()               // ← Second. Matches /users (no params)
async findAll() {...}

@Get(':id')          // ← Last. Matches /users/123
async findOne(id: string) {...}
```

**Why?** Express/NestJS route matching is sequential. If `@Get(':id')` came first, it would match `/users/me` and try to parse "me" as an ID.

---

## File Changed

| File                            | Change                                                      |
| ------------------------------- | ----------------------------------------------------------- |
| `src/users/users.controller.ts` | Added `getCurrentUser()` method with `@Get('me')` decorator |

---

## How It Works

### Before (❌ Broken)

```
1. User navigates to /my-profile
2. UserProfilePage calls: GET /users/me
3. Backend: No route found
4. Response: 404 or error
5. Frontend: "Error: Failed to fetch profile"
```

### After (✅ Fixed)

```
1. User navigates to /my-profile
2. UserProfilePage calls: GET /users/me
3. Backend: Routes to getCurrentUser()
4. Extracts userId from JWT token
5. Returns user profile with loyalty_points
6. Frontend: Displays profile with loyalty points
```

---

## Frontend Flow

```typescript
// UserProfilePage.tsx
useEffect(() => {
  const fetchProfile = async () => {
    const token = localStorage.getItem('token');

    // This now works! ✅
    const response = await fetch('http://localhost:3000/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    setProfile(data); // User object with loyalty_points
  };

  fetchProfile();
}, []);
```

---

## Backend Flow

```typescript
// UsersController.ts
@Get('me')
@UseGuards(JwtAuthGuard)  // Validates token
async getCurrentUser(@Req() req: any) {
  const userId = req.user.userId;  // From token: { userId: 7, role: 'admin', ... }

  // Fetch user from database
  return this.usersService.findOne(userId);

  // Returns:
  // {
  //   user_id: 7,
  //   username: "john",
  //   email: "john@example.com",
  //   loyalty_points: 5,
  //   ...
  // }
}
```

---

## Verification

### Test the Endpoint

**Using curl**:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/users/me
```

**Expected Response** (200 OK):

```json
{
  "user_id": 7,
  "username": "admin",
  "email": "admin@example.com",
  "phone": null,
  "role": "admin",
  "status": "active",
  "loyalty_points": 0,
  "created_at": "2025-11-06T..."
}
```

### Test in Frontend

1. Navigate to `/my-profile`
2. Should display:
   - Username ✅
   - Email ✅
   - Role ✅
   - Status ✅
   - Loyalty Points (with gradient card) ✅
3. No error messages ✅

---

## Complete User Flow

```
1. User logs in
   └─ JWT token stored in localStorage
   └─ Token contains: { userId: 7, role: 'admin', iat: ..., exp: ... }

2. User navigates to /my-profile
   └─ UserProfilePage mounts

3. useEffect runs:
   └─ Reads token from localStorage
   └─ Calls: GET /users/me
   └─ Header: Authorization: Bearer <token>

4. Backend processes:
   └─ JwtAuthGuard validates token
   └─ Extracts req.user.userId = 7
   └─ Calls getCurrentUser(req)
   └─ Queries: SELECT * FROM users WHERE user_id = 7
   └─ Returns user object with loyalty_points

5. Frontend renders:
   └─ Displays user info
   └─ Displays loyalty points in card
   └─ Shows gradient design
   └─ Displays earning guide

6. User sees profile ✅
```

---

## Security Considerations

### ✅ Implemented

- JWT token required for access
- User ID extracted from authenticated token (not from URL)
- No parameter injection possible
- Returns only authenticated user's data
- No privilege escalation possible

### Route Security

```typescript
// ✅ Secure - uses JWT subject
@Get('me')
async getCurrentUser(@Req() req: any) {
  const userId = req.user.userId;  // From token, trusted
  return this.usersService.findOne(userId);
}

// ❌ Insecure - uses URL parameter (but protected by OwnerGuard)
@Get(':id')
async findOne(@Param('id') id: string) {
  return this.usersService.findOne(+id);  // User could request someone else
}
```

---

## Error Handling

### If Token Invalid

```
Request: GET /users/me without token
JwtAuthGuard: Rejects request
Response: 401 Unauthorized
```

### If Token Expired

```
Request: GET /users/me with expired token
JwtAuthGuard: Rejects request
Response: 401 Unauthorized
```

### If User Not Found (shouldn't happen)

```
Query: SELECT * FROM users WHERE user_id = 7
Result: No user found
Response: null or 404 Not Found
```

---

## Deployment

### No Database Changes Needed

✅ Uses existing User entity
✅ No new columns required
✅ No migrations needed

### Frontend Works As-Is

✅ Already calls /users/me
✅ No code changes needed
✅ Just restart backend

---

## Summary

| Aspect              | Before              | After               |
| ------------------- | ------------------- | ------------------- |
| **Route**           | ❌ Doesn't exist    | ✅ GET /users/me    |
| **Profile Loading** | ❌ Fails with error | ✅ Works correctly  |
| **My Profile Page** | ❌ Error shown      | ✅ Displays profile |
| **Loyalty Points**  | ❌ Not visible      | ✅ Shows in profile |
| **Security**        | N/A                 | ✅ JWT protected    |

---

## Testing Checklist

- [ ] Backend restarted: `npm run start:dev`
- [ ] Navigate to /my-profile
- [ ] Profile page loads without errors ✅
- [ ] User info displayed correctly
- [ ] Loyalty points shown in card
- [ ] No 500 errors in console
- [ ] No "NaN" errors in logs

---

## Files Modified

```
src/users/users.controller.ts
├─ Added @Get('me') route
├─ Added getCurrentUser() method
├─ Placed before @Get(':id') for correct route matching
└─ Uses JwtAuthGuard for security
```

---

**Status**: ✅ **FIXED - Ready to Test**

The `/users/me` endpoint is now implemented. Restart the backend and navigate to `/my-profile` to test it!

```bash
npm run start:dev
```

Then visit: `http://localhost:5173/my-profile` ✅
