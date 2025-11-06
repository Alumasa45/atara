# 🔧 Database Migration Issue - Complete Report

## Problem Summary

The backend is throwing **"column does not exist"** errors when trying to query the `users` table:

```
ERROR: column Schedule__Schedule_createdBy.loyalty_points does not exist
ERROR: column Session__Session_trainer__Session__Session_trainer_user.loyalty_points does not exist
ERROR: column Trainer__Trainer_user.loyalty_points does not exist
```

---

## Root Cause

### What Happened

1. ✅ Added `loyalty_points` field to User entity (TypeORM code)
2. ✅ Code compiles successfully
3. ✅ Backend starts without errors
4. ❌ Database hasn't been updated yet
5. ❌ When queries try to select `loyalty_points` column, it doesn't exist in PostgreSQL

### The Mismatch

```
TypeORM Entity (Code):
├─ User Entity
│  └─ loyalty_points: number

Database Schema (PostgreSQL):
└─ users table
   ├─ user_id
   ├─ username
   ├─ email
   ├─ ... other columns ...
   └─ ❌ loyalty_points ← NOT PRESENT!

Result: When loading related Users (via Schedule.createdBy, Session.trainer.user, etc),
the query includes loyalty_points but the column doesn't exist → ERROR
```

---

## Solution Provided

### Migration File Created

**File**: `src/migrations/1763900000000-AddLoyaltyPointsToUsers.ts`

```typescript
export class AddLoyaltyPointsToUsers1763900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'loyalty_points',
        type: 'integer',
        default: 0,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'loyalty_points');
  }
}
```

### What It Does

- ✅ Adds `loyalty_points` column to `users` table
- ✅ Sets type to integer (whole numbers)
- ✅ Sets default value to 0 (all existing users start with 0 points)
- ✅ Makes it non-nullable (never NULL, always has a value)
- ✅ Reversible (can rollback if needed)

---

## How to Fix

### Step 1: Run the Migration

```powershell
cd c:\Users\user\Desktop\atara\atarabackend
npm run migration:run
```

**Expected output:**

```
query: CREATE TABLE "migrations" ...
migration AddLoyaltyPointsToUsers1763900000000 has been executed successfully.
```

### Step 2: Restart Backend

```powershell
npm run start:dev
```

### Step 3: Verify

Navigate to:

- `/admin/schedules` - Should load without errors
- `/admin/sessions` - Should load without errors
- `/admin/trainers` - Should load without errors
- `/my-profile` - Should display loyalty points

---

## Why This Happened

### Migration System Explanation

TypeORM uses a **migration system** to track database schema changes:

```
Development Cycle:
1. Developer updates Entity (TypeORM code)
   └─ User.entity.ts: + loyalty_points field

2. Developer creates Migration file
   └─ 1763900000000-AddLoyaltyPointsToUsers.ts

3. Developer runs migration
   └─ npm run migration:run
   └─ Migration executes SQL: ALTER TABLE users ADD COLUMN...
   └─ Migration is recorded in "migrations" table

4. Database schema is now in sync with Entity
   └─ TypeORM queries work correctly
   └─ No more "column does not exist" errors
```

### Why We Need Migrations

**Without migrations:**

- Developer changes code → Entity has new field
- Deployed to production → Database doesn't have the field
- Queries fail → "Column does not exist" errors
- Manual database edits needed → Error-prone, hard to track

**With migrations:**

- Developer changes code → Creates migration file
- Migration deployed → Automatically runs on startup
- Database schema matches code → Everything works
- Easy to rollback → Just run `migration:revert`

---

## Files Created

| File                                                      | Purpose                                     |
| --------------------------------------------------------- | ------------------------------------------- |
| `src/migrations/1763900000000-AddLoyaltyPointsToUsers.ts` | Migration file to add loyalty_points column |
| `DATABASE_MIGRATION_GUIDE.md`                             | Detailed migration guide                    |
| `MIGRATION_QUICK_STEPS.md`                                | Quick reference for running migration       |
| This file                                                 | Complete explanation                        |

---

## Verification Checklist

- [ ] Migration file exists in `src/migrations/`
- [ ] PostgreSQL is running and accessible
- [ ] Ran `npm run migration:run` successfully
- [ ] No errors in migration output
- [ ] Backend started: `npm run start:dev`
- [ ] Backend starts without "column does not exist" errors
- [ ] Test pages load (schedules, sessions, trainers)
- [ ] "My Profile" shows loyalty points

---

## What Happens After Migration

### Database State

```
users table:
├─ user_id: int (PK)
├─ username: varchar
├─ email: varchar
├─ phone: varchar
├─ ...
└─ loyalty_points: integer (NEW!) ← Default 0

Existing Users: All get loyalty_points = 0
New Users: Get loyalty_points = 5 on registration
Completed Sessions: Admin can award +10 points
```

### Application Features Restored

✅ Schedules page loads without errors
✅ Sessions page loads without errors
✅ Trainers page loads without errors
✅ My Profile page shows loyalty points
✅ Admin can change booking status
✅ Users earn loyalty points
✅ Leaderboard works correctly

---

## Technical Details

### Migration Lifecycle

**Up Migration (Forward)**:

```sql
ALTER TABLE users ADD COLUMN loyalty_points INTEGER DEFAULT 0 NOT NULL;
```

**Down Migration (Rollback)**:

```sql
ALTER TABLE users DROP COLUMN loyalty_points;
```

### TypeORM Configuration

From `src/data-source.ts`:

```typescript
const AppDataSource = new DataSource({
  // ... connection config ...
  synchronize: false, // Don't auto-sync, use migrations
  migrations: [join(srcPath, 'migrations', '*.{ts,js}')],
});
```

### npm Script

From `package.json`:

```json
{
  "scripts": {
    "migration:run": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d ./src/data-source.ts",
    "migration:revert": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:revert -d ./src/data-source.ts"
  }
}
```

---

## Troubleshooting

### "Cannot find module 'ts-node'"

**Solution**: Install dependencies

```bash
npm install
```

### "Cannot execute migration - wrong connection"

**Solution**: Check database connection settings

```powershell
$env:DB_HOST       # localhost
$env:DB_PORT       # 5434
$env:DB_NAME       # atara
$env:DB_USERNAME   # postgres
$env:DB_PASSWORD   # postgres
```

### "Database does not exist"

**Solution**: Create database

```sql
CREATE DATABASE atara;
```

### "Still getting errors after migration"

**Solution**: Verify migration was applied

```bash
# Check migrations table in database
SELECT * FROM migrations;
# Should show: AddLoyaltyPointsToUsers1763900000000
```

---

## Summary

### ❌ Before Migration

- TypeORM entity has `loyalty_points` field
- Database table doesn't have the column
- Queries fail with "column does not exist"
- Schedules/Sessions/Trainers pages broken
- Profile page broken

### ✅ After Migration

- TypeORM entity has `loyalty_points` field
- Database table has the column
- Queries succeed
- All pages work
- Loyalty points system fully functional

---

## Next Steps

1. **Run Migration**: `npm run migration:run`
2. **Restart Backend**: `npm run start:dev`
3. **Test Application**: Browse all pages
4. **Deploy**: Include migration in production deployment
5. **Monitor**: Check logs for any errors

---

**Status**: 🎉 **MIGRATION READY - Ready to Run**

For step-by-step instructions, see: `MIGRATION_QUICK_STEPS.md`
For detailed guide, see: `DATABASE_MIGRATION_GUIDE.md`
