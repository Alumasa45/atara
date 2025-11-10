# URGENT: Trainer Dashboard Fix

## Problem
```
EntityPropertyNotFoundError: Property "trainer_id" was not found in "Session"
```

## Root Cause
The dashboard service was using `find({ where: { trainer_id: ... } })` which doesn't work with TypeORM RelationId properties.

## Solution
Replace the sessions query in `getTrainerDashboard` method:

### BEFORE (Broken):
```typescript
const sessions = await this.sessionRepository.find({
  where: { trainer_id: trainer.trainer_id },
});
```

### AFTER (Fixed):
```typescript
const sessions = await this.sessionRepository
  .createQueryBuilder('session')
  .leftJoinAndSelect('session.trainer', 'trainer')
  .where('trainer.trainer_id = :trainerId', { trainerId: trainer.trainer_id })
  .getMany();
```

## Quick Deploy Steps
1. Update `src/dashboards/dashboard.service.ts` with the fixed code
2. Redeploy the backend
3. Test with: `GET /dashboard/trainer` with valid trainer token

## Test Command
```bash
curl -X GET https://atara-dajy.onrender.com/dashboard/trainer \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJyb2xlIjoidHJhaW5lciIsImlhdCI6MTc2Mjc3OTE1NCwiZXhwIjoxNzYyNzgyNzU0fQ.TOKEN"
```

This should now return 200 OK with trainer dashboard data instead of 500 error.