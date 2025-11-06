# ⚡ Quick Migration Guide

## Problem

```
Error: column "users"."loyalty_points" does not exist
```

## Solution

Run the migration to add the column to the database.

---

## Quick Steps

### 1️⃣ Stop Backend (if running)

```
Press Ctrl+C in the terminal
```

### 2️⃣ Run Migration

```powershell
cd c:\Users\user\Desktop\atara\atarabackend
npm run migration:run
```

### 3️⃣ Start Backend

```powershell
npm run start:dev
```

### 4️⃣ Verify

- Navigate to different pages
- Check "My Profile" for loyalty points
- No database errors should appear

---

## What Was Added

**File**: `src/migrations/1763900000000-AddLoyaltyPointsToUsers.ts`

**Migration**: Adds `loyalty_points` column to `users` table

- Type: integer
- Default: 0
- Non-nullable: Yes

---

## If Something Goes Wrong

### Rollback the Migration

```powershell
npm run migration:revert
```

### Check Database Connection

```powershell
# Verify these environment variables:
$env:DB_HOST       # Should be: localhost
$env:DB_PORT       # Should be: 5434
$env:DB_NAME       # Should be: atara
$env:DB_USERNAME   # Should be: postgres
```

### Verify Database Exists

```sql
-- In PostgreSQL:
\l  -- List databases
```

---

## Expected Output

When you run `npm run migration:run`, you should see:

```
query: CREATE TABLE "migrations" ...
migration AddLoyaltyPointsToUsers1763900000000 has been executed successfully.
```

---

## All Fixed! ✅

After migration:

- Database schema matches TypeORM entities
- Loyalty points system fully functional
- All endpoints work correctly
- No more "column does not exist" errors

---

**See full details**: `DATABASE_MIGRATION_GUIDE.md`
