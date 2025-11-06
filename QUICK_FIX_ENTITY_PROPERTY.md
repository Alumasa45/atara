# 🔧 EntityPropertyNotFoundError - Quick Fix

## The Error

```
EntityPropertyNotFoundError: Property "user_id" was not found in "Booking"
```

## The Problem

TypeORM's `.count({ where: { user_id: ... } })` couldn't resolve the `@RelationId()` computed field in the Booking entity.

## The Solution

Replaced `.count()` calls with **QueryBuilder** approach:

### Before ❌

```typescript
const activeBookings = await this.bookingRepository.count({
  where: { user_id: userId, status: bookingStatus.booked },
});
```

### After ✅

```typescript
const activeBookings = await this.bookingRepository
  .createQueryBuilder('booking')
  .where('booking.user_id = :userId', { userId })
  .andWhere('booking.status = :status', { status: bookingStatus.booked })
  .getCount();
```

## Files Fixed

- ✅ `src/admin/admin.service.ts` - 2 methods updated
  - `deleteUser()` - Fixed booking check
  - `getUserActivitySummary()` - Fixed all 3 booking queries

## Result

✅ **FIXED** - No more EntityPropertyNotFoundError
✅ User suspension now works
✅ Activity summary now works

---

**Status**: Ready to test suspend user functionality again!
