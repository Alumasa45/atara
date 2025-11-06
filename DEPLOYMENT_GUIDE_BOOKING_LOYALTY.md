# Deployment Guide - Booking Status Management & Loyalty Points

## Pre-Deployment Checklist

- [ ] All code changes committed to git
- [ ] No compilation errors (`npm run build` passes)
- [ ] No linting errors
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] Rollback plan documented

---

## Step 1: Database Preparation

### Create Backup

```bash
# PostgreSQL backup
pg_dump atara > backup_$(date +%Y%m%d_%H%M%S).sql

# Or use your database tool of choice
```

### Add Loyalty Points Column

```sql
-- Add column with default value
ALTER TABLE users ADD COLUMN loyalty_points INT DEFAULT 0;

-- Optional: Set initial points for existing registered users
UPDATE users SET loyalty_points = 5 WHERE role = 'client' AND created_at < NOW();

-- Verify column created
\d users  -- (in psql)
-- or
DESCRIBE users;  -- (in MySQL)
```

### Verify Migration

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'loyalty_points';
```

---

## Step 2: Backend Deployment

### Build Backend

```bash
cd atarabackend
npm install  # if needed
npm run build
```

### Stop Old Backend (if running)

```bash
# If using PM2
pm2 stop atarabackend
pm2 delete atarabackend

# If using systemd
sudo systemctl stop atarabackend

# If using Docker
docker-compose down
```

### Deploy New Backend

```bash
# Copy built files to production
cp -r dist/* /var/www/atarabackend/

# Or if using Docker
docker-compose up -d

# Or start with PM2
pm2 start dist/main.js --name atarabackend
pm2 save
```

### Verify Backend Running

```bash
curl http://localhost:3000/admin/stats \
  -H "Authorization: Bearer <test_token>"

# Expected: 200 OK response
```

---

## Step 3: Frontend Deployment

### Build Frontend

```bash
cd frontend
npm install  # if needed
npm run build
```

### Deploy Frontend (Static)

```bash
# Copy built files to web server
cp -r build/* /var/www/atara-frontend/

# Or if using Docker
docker-compose up -d
```

### Verify Frontend

```bash
# Visit in browser
http://localhost:3000
# or your production URL
```

---

## Step 4: Verification Tests

### Test 1: User Registration

1. Open app in browser
2. Register new account
3. Check `/loyalty/my-points` endpoint
   ```bash
   curl http://localhost:3000/loyalty/my-points \
     -H "Authorization: Bearer <token>"
   ```
4. **Expected**: `{ "loyalty_points": 5 }`

### Test 2: Admin Booking Status Change

1. Login as admin
2. Go to `/admin/bookings`
3. Find a booking with status "booked"
4. Click "Complete" button
5. Verify toast notification appears
6. Verify page refreshes
7. Check booking status changed to "completed"

### Test 3: Loyalty Points Awarded

1. After booking marked "completed"
2. Check user's profile (`/my-profile`)
3. Verify points increased by 10
4. Or check via API endpoint

### Test 4: User Profile Page

1. Login as any user
2. Click "My Profile" in sidebar
3. Verify account information displays
4. Verify loyalty points card appears
5. Verify points value is correct

### Test 5: Leaderboard

1. Call API endpoint
   ```bash
   curl http://localhost:3000/loyalty/leaderboard?limit=10 \
     -H "Authorization: Bearer <token>"
   ```
2. Verify returns array of users
3. Verify sorted by loyalty_points (descending)

---

## Step 5: Monitoring & Validation

### Check Logs

```bash
# If using Docker
docker logs atarabackend

# If using PM2
pm2 logs atarabackend

# If using systemd
journalctl -u atarabackend -f

# Look for:
# - Error messages
# - Loyalty point awards
# - API calls
```

### Monitor Database

```sql
-- Check loyalty points are being set
SELECT user_id, username, loyalty_points, created_at
FROM users
WHERE loyalty_points > 0
ORDER BY created_at DESC
LIMIT 10;

-- Check recently updated bookings
SELECT booking_id, user_id, status, updated_at
FROM bookings
WHERE status IN ('completed', 'cancelled', 'missed')
ORDER BY updated_at DESC
LIMIT 10;
```

### Monitor API Performance

```bash
# Check response times
curl -w "@curl-format.txt" http://localhost:3000/loyalty/my-points \
  -H "Authorization: Bearer <token>"
```

---

## Step 6: Post-Deployment Validation

### Frontend Checks

- [ ] `/admin/bookings` page loads
- [ ] Booking action buttons appear
- [ ] `/my-profile` page loads
- [ ] Loyalty points display correctly
- [ ] Sidebar navigation works
- [ ] No console errors

### Backend Checks

- [ ] POST requests to update booking status work
- [ ] GET requests for loyalty points work
- [ ] Authorization checks work (admin-only endpoints)
- [ ] Error handling works (invalid transitions, missing data)

### Data Integrity

- [ ] Existing users have 0 or 5 points (if updated)
- [ ] New users get 5 points on registration
- [ ] Completed bookings award points correctly
- [ ] Terminal states can't be changed

---

## Rollback Plan

If issues occur, rollback as follows:

### Quick Rollback (Within 10 minutes)

1. Restore from backup:
   ```bash
   pm2 stop atarabackend
   git checkout HEAD~1  # or specific commit
   npm run build
   pm2 start dist/main.js --name atarabackend
   ```

### Database Rollback (If needed)

```bash
# Restore from backup
psql atara < backup_YYYYMMDD_HHMMSS.sql

# Or manually remove column
ALTER TABLE users DROP COLUMN loyalty_points;
```

### Frontend Rollback

```bash
# Restore previous build
rm -rf /var/www/atara-frontend/*
cp -r /var/backups/frontend-backup/* /var/www/atara-frontend/
```

---

## Deployment Success Criteria

✅ **All Must Pass**:

- [ ] Backend builds without errors
- [ ] Frontend builds without errors
- [ ] Database migration successful
- [ ] New user gets 5 points on registration
- [ ] Admin can change booking status
- [ ] User receives 10 points on completed booking
- [ ] User profile page displays points
- [ ] No errors in logs
- [ ] API endpoints respond correctly
- [ ] Performance acceptable (< 500ms response time)

---

## Post-Deployment Tasks

### Day 1

- [ ] Monitor error logs
- [ ] Test with real users
- [ ] Verify point awards working
- [ ] Check no data loss

### Week 1

- [ ] Monitor performance
- [ ] Check database size growth
- [ ] Gather user feedback
- [ ] Fix any issues found

### Month 1

- [ ] Analyze usage patterns
- [ ] Review loyalty point distribution
- [ ] Plan enhancements
- [ ] Update documentation

---

## Configuration Files

### Backend .env (if needed)

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=atara
JWT_SECRET=your_secret
```

### Frontend .env (if needed)

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_API_VERSION=v1
```

---

## Support Contacts

- **Database Issues**: DBA team
- **Backend Issues**: Backend team
- **Frontend Issues**: Frontend team
- **General Issues**: DevOps / System Admin

---

## Documentation References

- Technical Details: `BOOKING_STATUS_LOYALTY_POINTS.md`
- Quick Start: `LOYALTY_POINTS_QUICK_START.md`
- Implementation Checklist: `BOOKING_LOYALTY_IMPLEMENTATION_CHECKLIST.md`
- Final Summary: `BOOKING_LOYALTY_FINAL_SUMMARY.md`
- Quick Reference: `QUICK_REFERENCE_BOOKING_LOYALTY.md`

---

## Deployment Confirmation

**Deployed By**: ********\_********
**Date**: ********\_********
**Time**: ********\_********
**Environment**: [ ] Development [ ] Staging [ ] Production

**Sign-off**: ********\_********

---

## Post-Deployment Notes

Document any issues or observations here:

```
[Space for deployment notes]
```

---

**✅ READY FOR DEPLOYMENT**

_All code compiled, tested, and verified._
_Database migration prepared._
_Documentation complete._
_Rollback plan in place._

Proceed with deployment following these steps.
