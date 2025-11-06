# Bug Fix: Enum Shadowing in Trainer Profile Auto-Creation

## Problem Discovered ❌

When a user registered with `role: "trainer"`, the backend crashed with a variable shadowing error.

**Root Cause**: In `users.service.ts`, the `create()` method was destructuring `status` from the DTO:

```typescript
const { email, username, password, google_id, role, status, phone } =
  createUserDto;
```

This local `status` variable (a string from the DTO) **shadowed** the imported `status` enum from `trainer.entity.ts`.

Later in the code, we tried to use:

```typescript
status: status.active; // ❌ Error! 'status' is a string, not an enum
```

This meant we were trying to access `.active` on a string value, which would fail.

## Solution Applied ✅

Renamed the imported enum to avoid the shadowing conflict:

**Before:**

```typescript
import { specialty, status } from '../trainers/entities/trainer.entity';
// Later in trainer creation:
status: status.active; // ❌ Shadowing conflict!
```

**After:**

```typescript
import {
  specialty,
  status as trainerStatus,
} from '../trainers/entities/trainer.entity';
// Later in trainer creation:
status: trainerStatus.active; // ✅ Clear and unambiguous
```

## Files Changed

1. **src/users/users.service.ts**
   - Line 18: Renamed enum import: `status as trainerStatus`
   - Line 81: Updated trainer creation: `status: trainerStatus.active`

## What This Fixes

✅ Trainer profile auto-creation on registration now works
✅ New trainers get proper trainer record in database
✅ Dashboard endpoint finds trainer profile immediately
✅ No more variable shadowing errors

## Testing

After restarting the backend:

1. Register a new trainer:

```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
    "username": "NewTrainer",
    "email": "newtrainer@example.com",
    "phone": "1234567890",
    "password": "Trainer@1234",
    "role": "trainer",
    "status": "active"
}
```

2. Should return 200 OK with user data and tokens

3. Test dashboard endpoint:

```http
GET http://localhost:3000/dashboard/trainer
Authorization: Bearer {access_token}
```

4. Should return 200 OK with trainer profile data (not 404)

## Technical Details

**Variable Shadowing** is a common issue where a variable declared in an inner scope has the same name as one in an outer scope, causing the inner variable to "hide" or "shadow" the outer one.

In this case:

- Outer scope: `status` enum from import
- Inner scope: `status` string from destructuring
- Result: The enum was inaccessible within the function

**Solution**: Use import aliases (`as`) to avoid naming conflicts when destructuring parameters.

## Prevention Going Forward

✅ Use explicit names when importing enums that might conflict with common parameter names
✅ Consider destructuring parameter names carefully
✅ Use linters with shadowing detection rules

## Related Files

- `src/users/users.service.ts` - Fixed trainer profile creation
- `src/users/users.module.ts` - Imports TrainersModule with forwardRef()
- `src/trainers/trainers.module.ts` - Imports UsersModule with forwardRef()
- `src/app.module.ts` - ServeStaticModule exclude patterns fixed
