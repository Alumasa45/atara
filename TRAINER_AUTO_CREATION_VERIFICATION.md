# Trainer Profile Auto-Creation: Verification Guide

## Quick Answer: YES ✅

**When a user registers with `role: "trainer"`, a trainer record WILL be automatically added to the `trainers` table.**

Here's the exact flow:

```
1. User sends: POST /auth/register
   {
     "username": "NewTrainer",
     "email": "newtrainer@example.com",
     "password": "Trainer@1234",
     "role": "trainer",
     "phone": "1234567890"
   }

2. UsersService.create() executes:
   ├─ Create user record in users table
   ├─ Save user (now has user_id)
   ├─ Check: if (role === 'trainer')  ✅ YES
   ├─ Call: trainersService.create({...})
   ├─ TrainersService.create() executes:
   │  ├─ Verify user exists ✅
   │  ├─ Check no trainer already exists for this user ✅
   │  ├─ Create trainer record in trainers table with:
   │  │  - user_id: (from saved user)
   │  │  - name: username
   │  │  - specialty: yoga (default)
   │  │  - phone: from registration
   │  │  - email: from registration
   │  │  - bio: empty
   │  │  - status: active
   │  └─ Save trainer ✅
   └─ Create profile (points system)

3. Return: access_token + refresh_token + user data

4. Database state:
   ├─ users table: 1 new row (user_id=X, role="trainer")
   └─ trainers table: 1 new row (user_id=X, trainer_id=Y)
```

## Code Verification

### Location: `src/users/users.service.ts` Lines 77-86

```typescript
// If user is a trainer, create a trainer profile
if (role === 'trainer') {
  try {
    await this.trainersService.create({
      user_id: saved.user_id,
      name: username || email,
      specialty: specialty.yoga,
      phone: phone || '',
      email: email,
      bio: '',
      status: trainerStatus.active,
    });
  } catch (e) {
    // Log but don't fail trainer creation
    console.warn('Failed to create trainer profile for new trainer user', e);
  }
}
```

**Key Points:**

- ✅ Checks `role === 'trainer'`
- ✅ Calls `trainersService.create()`
- ✅ Passes correct `user_id` (from saved user)
- ✅ Uses proper enum values: `specialty.yoga`, `trainerStatus.active`
- ✅ Non-blocking: logs error but doesn't fail registration

## Module Setup Verification

### TrainersModule exports TrainersService

```typescript
// src/trainers/trainers.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Trainer, User]),
    forwardRef(() => UsersModule),
    AuthModule,
  ],
  controllers: [TrainersController],
  providers: [TrainersService],
  exports: [TrainersService], // ✅ EXPORTED
})
export class TrainersModule {}
```

### UsersModule imports TrainersModule

```typescript
// src/users/users.module.ts
@Module({
  controllers: [UsersController, AuthController],
  providers: [UsersService, MailService],
  imports: [
    TypeOrmModule.forFeature([User, EmailVerification]),
    ProfilesModule,
    forwardRef(() => TrainersModule), // ✅ IMPORTED with forwardRef
    AuthModule,
  ],
  exports: [TypeOrmModule, UsersService, AuthModule],
})
export class UsersModule {}
```

### UsersService injects TrainersService

```typescript
// src/users/users.service.ts constructor
constructor(
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
  @InjectRepository(EmailVerification)
  private readonly verificationRepository: Repository<EmailVerification>,
  private readonly jwtService: JwtService,
  private readonly profilesService: ProfilesService,
  private readonly trainersService: TrainersService,  // ✅ INJECTED
  private readonly mailService: MailService,
) {}
```

## How to Test

### Step 1: Register a New Trainer

**Request:**

```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "username": "TestTrainer123",
  "email": "testtrainer123@example.com",
  "phone": "9876543210",
  "password": "Trainer@1234",
  "role": "trainer",
  "status": "active"
}
```

**Success Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "d3f4g5h6i7j8k9l0m1n2o3p4...",
  "user": {
    "user_id": 15,
    "username": "TestTrainer123",
    "email": "testtrainer123@example.com",
    "phone": "9876543210",
    "role": "trainer",
    "status": "active"
  }
}
```

### Step 2: Verify Trainer Record Created

**Check Backend Console:**

- Should see user creation logs
- Should NOT see any "Failed to create trainer profile" warnings
- Should see successful response

**Check Database (SQL):**

```sql
-- Check users table
SELECT * FROM users WHERE email = 'testtrainer123@example.com';
-- Result: 1 row with user_id, role="trainer"

-- Check trainers table
SELECT * FROM trainers WHERE user_id = 15;
-- Result: 1 row with specialty="yoga", status="active", name="TestTrainer123"
```

### Step 3: Access Trainer Dashboard

**Request:**

```http
GET http://localhost:3000/dashboard/trainer
Authorization: Bearer {access_token}
```

**Success Response (200 OK):**

```json
{
  "trainer": {
    "trainer_id": 8,
    "user_id": 15,
    "name": "TestTrainer123",
    "specialty": "yoga",
    "phone": "9876543210",
    "email": "testtrainer123@example.com",
    "bio": "",
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

## Troubleshooting: If Trainer Profile NOT Created

If you don't see the trainer record in the database, check:

| Issue                         | How to Check                        | Solution                                                     |
| ----------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| Backend error                 | Check backend console               | Look for "Failed to create trainer profile" warning messages |
| TrainersService not available | Check DependencyResolutionException | Verify TrainersModule exports TrainersService                |
| User not saved yet            | Check users table                   | Verify user_id exists before trainer creation                |
| User registration failed      | Check response status code          | Look for validation or database errors                       |
| Wrong role value              | Check request body                  | Ensure `"role": "trainer"` (exact string)                    |

## Expected Default Values

New trainers get these defaults:

| Field       | Value                                 | Source            | Editable? |
| ----------- | ------------------------------------- | ----------------- | --------- |
| `name`      | username (or email if username empty) | From registration | ✅ Yes    |
| `specialty` | `yoga`                                | Auto-set          | ✅ Yes    |
| `phone`     | From registration (or empty)          | From registration | ✅ Yes    |
| `email`     | From registration                     | From registration | ✅ Yes    |
| `bio`       | Empty string                          | Auto-set          | ✅ Yes    |
| `status`    | `active`                              | Auto-set          | ✅ Yes    |

All can be edited via the TrainerProfilePage!

## Success Criteria ✅

You know it's working when:

1. ✅ Register new trainer succeeds (200 OK)
2. ✅ `users` table has new row with `role="trainer"`
3. ✅ `trainers` table has new row with matching `user_id`
4. ✅ GET `/dashboard/trainer` returns 200 OK (not 404)
5. ✅ Response includes trainer data with default values
6. ✅ TrainerProfilePage loads without errors
7. ✅ Can edit trainer profile fields
8. ✅ Each trainer only sees their own data

## Summary

The trainer profile auto-creation is **fully implemented and configured**.

When you register a new user with `role: "trainer"`:

1. User record created in `users` table
2. Trainer record automatically created in `trainers` table
3. Both records linked via `user_id` foreign key
4. Dashboard endpoint finds trainer immediately
5. TrainerProfilePage displays trainer data

**No manual steps needed. It's automatic!** 🚀
