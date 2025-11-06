# 🗄️ Database Migration - Add Loyalty Points Column

## Problem

The backend code added `loyalty_points` field to the User entity, but the database hasn't been updated. TypeORM queries are trying to access a column that doesn't exist in the `users` table.

**Error**: `column "users"."loyalty_points" does not exist`

---

## Solution

A migration file has been created to add the `loyalty_points` column to the database:

**File**: `src/migrations/1763900000000-AddLoyaltyPointsToUsers.ts`

This migration will:

- ✅ Add `loyalty_points` column (integer type, default 0)
- ✅ Make it non-nullable so existing rows get value 0
- ✅ Be reversible (can rollback if needed)

---

## How to Run the Migration

### Step 1: Stop the Running Backend

If the backend is currently running, stop it (Ctrl+C)

### Step 2: Ensure PostgreSQL is Running

Make sure your PostgreSQL database is accessible at the configured host/port

```
Default: localhost:5434
Database: atara
```

### Step 3: Run the Migration

**Option A: Using npm script (RECOMMENDED)**

```bash
cd c:\Users\user\Desktop\atara\atarabackend
npm run migration:run
```

**Option B: Using TypeORM CLI directly**

```bash
cd c:\Users\user\Desktop\atara\atarabackend
npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d ./src/data-source.ts
```

### Step 4: Verify the Migration

Check that the command output shows:

```
query: CREATE TABLE "migrations" ("id" SERIAL, "timestamp" bigint NOT NULL UNIQUE, "name" character varying NOT NULL, PRIMARY KEY ("id")) -- ...
migration AddLoyaltyPointsToUsers1763900000000 has been executed successfully.
```

Or verify in database:

```sql
-- Connect to your PostgreSQL database and run:
\d users
-- or
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'loyalty_points';
```

---

## What the Migration Does

### TypeScript Migration Code

```typescript
export class AddLoyaltyPointsToUsers1763900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the loyalty_points column when migrating UP
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
    // Remove the loyalty_points column if rolling back
    await queryRunner.dropColumn('users', 'loyalty_points');
  }
}
```

### Generated SQL (approximately)

```sql
ALTER TABLE users ADD COLUMN loyalty_points INTEGER DEFAULT 0 NOT NULL;
```

---

## Rollback (if needed)

If you need to undo the migration:

```bash
npm run migration:revert
```

This will:

- Remove the `loyalty_points` column from the `users` table
- Revert the migration record from the `migrations` table

---

## After Migration Success

### Step 1: Restart the Backend

```bash
npm run start:dev
```

### Step 2: Expected Behavior

- ✅ Backend starts without errors
- ✅ No more "column does not exist" errors
- ✅ Loyalty points system fully functional
- ✅ New users get 5 points on registration
- ✅ Admin can award points via booking completion
- ✅ Users can see their points in profile

### Step 3: Verify in Frontend

1. Login as any user
2. Navigate to different pages (schedules, sessions, trainers)
3. All pages should load without database errors
4. Click "My Profile" to see loyalty points

---

## Database State After Migration

| Column         | Type    | Default | Nullable |
| -------------- | ------- | ------- | -------- |
| loyalty_points | integer | 0       | NO       |

**Effect on existing users**: All existing users will get 0 loyalty points by default

---

## Troubleshooting

### Error: "Cannot find module 'ts-node'"

**Solution**: Install dev dependencies

```bash
npm install
```

### Error: "ECONNREFUSED - Connection refused"

**Solution**: PostgreSQL is not running. Start your PostgreSQL service

```bash
# On Windows, PostgreSQL might be running as a service
# Or you can start it manually
```

### Error: "migration:run is not found"

**Solution**: Make sure you're in the correct directory

```bash
cd c:\Users\user\Desktop\atara\atarabackend
```

### Error: "Database does not exist"

**Solution**: Create the database first or update DB_NAME env variable

```bash
# Create database in PostgreSQL
createdb atara
```

### Error: "Cannot execute migration - wrong connection"

**Solution**: Check your database connection in `.env` or environment variables:

```
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=atara
```

---

## Verification Checklist

- [ ] Migration file exists: `src/migrations/1763900000000-AddLoyaltyPointsToUsers.ts`
- [ ] PostgreSQL is running
- [ ] Connection parameters are correct
- [ ] Ran `npm run migration:run`
- [ ] Migration completed without errors
- [ ] Backend started successfully
- [ ] No "column does not exist" errors in logs
- [ ] Tested pages load correctly (schedules, sessions, trainers)
- [ ] Tested loyalty features work (profile, points display)

---

## Next Steps

1. ✅ Run the migration: `npm run migration:run`
2. ✅ Restart the backend: `npm run start:dev`
3. ✅ Verify no database errors
4. ✅ Test the loyalty points system
5. ✅ Deploy to production with migration in place

---

## Migration Details

| Property       | Value                                      |
| -------------- | ------------------------------------------ |
| **Filename**   | `1763900000000-AddLoyaltyPointsToUsers.ts` |
| **Timestamp**  | 1763900000000                              |
| **Table**      | users                                      |
| **Column**     | loyalty_points                             |
| **Type**       | integer                                    |
| **Default**    | 0                                          |
| **Reversible** | Yes (down method implemented)              |
| **Status**     | ✅ Ready to run                            |

---

**Important**: After running this migration, the database schema will be in sync with the TypeORM entity definitions, and all application features should work correctly.

If you encounter any issues, check the logs and ensure all environment variables are correctly configured.
