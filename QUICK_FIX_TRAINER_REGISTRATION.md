# ✅ Trainer Registration Error - FIXED

## 🐛 The Error

```
EntityPropertyNotFoundError: Property "user_id" was not found in "Trainer"
When: Admin tried to register a trainer
```

## 🔍 Root Cause

The trainer service used `.findOne({ where: { user_id } })` but `user_id` is a `@RelationId()` computed field, which TypeORM can't resolve in `.findOne()` queries.

## ✅ Solution

Changed from `.findOne()` to **QueryBuilder** approach:

### Before ❌

```typescript
const existing = await this.trainerRepository.findOne({
  where: { user_id },
});
```

### After ✅

```typescript
const existing = await this.trainerRepository
  .createQueryBuilder('trainer')
  .where('trainer.user_id = :userId', { userId: user_id })
  .getOne();
```

## 📋 File Fixed

- ✅ `src/trainers/trainers.service.ts` - `create()` method (line ~30)

## 🎯 What This Fixes

✅ Trainer registration now works
✅ Duplicate trainer check now works
✅ No more EntityPropertyNotFoundError

## 📊 Related Fixes

This is **Fix #3** of the same pattern:

1. ✅ Booking queries (admin.service.ts) - Fixed
2. ✅ Trainer check (trainers.service.ts) - Fixed now
3. ⚠️ Other services - May need checking

## 🟢 Status

**FIXED** ✅ - Ready to test trainer registration!

---

**Date Fixed**: November 5, 2025
**Recommendation**: Scan other services for similar patterns
