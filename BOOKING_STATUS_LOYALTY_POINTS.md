# Booking Status Management & Loyalty Points Implementation

## Overview

This implementation adds comprehensive booking status management for admins and an automatic loyalty points system for users.

## Backend Changes

### 1. User Entity (`src/users/entities/user.entity.ts`)

- Added `loyalty_points: number` field (default: 0)
- Automatically tracks user loyalty points

### 2. Loyalty Module (`src/loyalty/`)

Created new module with:

#### `loyalty.service.ts`

- `awardPoints(userId, points, reason)` - Award loyalty points to user
- `deductPoints(userId, points, reason)` - Deduct loyalty points
- `awardPointsForCompletedSession(bookingId, pointsToAward)` - Award points when session completed
- `getUserPoints(userId)` - Get user's current points
- `getLeaderboard(limit)` - Get top users by loyalty points

#### `loyalty.controller.ts`

- `GET /loyalty/my-points` - Get current user's points
- `GET /loyalty/user/:userId/points` - Get any user's points (admin only)
- `GET /loyalty/leaderboard` - Get loyalty leaderboard

#### `loyalty.module.ts`

- Registers LoyaltyService and LoyaltyController

### 3. Admin Service Updates (`src/admin/admin.service.ts`)

Added `updateBookingStatus(bookingId, newStatus)` method:

- Validates booking status transitions
- Only allows: `booked` → `completed`, `cancelled`, or `missed`
- Terminal states: `completed`, `cancelled`, `missed` (no further transitions)
- **Automatically awards 10 loyalty points** when booking marked as `completed`

### 4. Admin Controller Updates (`src/admin/admin.controller.ts`)

- Added `PATCH /admin/bookings/:id/status` endpoint
- Accepts `{ status: string }` payload
- Requires admin role

### 5. Users Service Updates (`src/users/users.service.ts`)

- Added `loyalty_points: 5` when user registers (both standard and Google signup)
- Awards initial 5 points automatically on account creation

### 6. App Module (`src/app.module.ts`)

- Imported and registered `LoyaltyModule`

## Frontend Changes

### 1. AdminBookingsPage (`frontend/src/pages/AdminBookingsPage.tsx`)

Enhanced with:

- Status change buttons for "booked" bookings:
  - ✅ **Complete** (awards 10 points, changes to blue)
  - ⏭️ **Missed** (changes to orange)
  - ❌ **Cancel** (changes to red)
- `handleStatusChange()` function to update booking status via API
- Toast notifications on success/error
- Automatic page refresh after status change
- Loading states during updates

### 2. UserProfilePage (`frontend/src/pages/UserProfilePage.tsx`)

New page displaying:

- **Account Information**: Username, email, role, status, member since
- **Loyalty Points Section**:
  - Current points balance (prominent display)
  - How to earn points (registration + completed sessions)
- **Info Card**: Education about loyalty points system

### 3. App.tsx

- Imported `UserProfilePage`
- Added route: `GET /my-profile`
- Protects with `ProtectedRoute`

### 4. Sidebar.tsx

- Added "My Profile" (⭐) link for all user roles
- Points to `/my-profile` route
- Appears for: client, trainer, admin

## Loyalty Points System

### Earning Points

1. **Registration**: +5 points (automatic on signup)
2. **Completed Session**: +10 points (when admin marks booking as completed)

### Total Possible Points

- Minimum: 5 points (on registration)
- Per session: +10 points
- Example: User with 5 completed sessions = 5 + (5 × 10) = 55 points

## API Endpoints

### Admin Booking Management

```bash
PATCH /admin/bookings/:bookingId/status
Body: { "status": "completed" | "missed" | "cancelled" }
Authorization: Bearer <token>
Response: Updated Booking object
```

### Loyalty Points

```bash
GET /loyalty/my-points
Authorization: Bearer <token>
Response: { loyalty_points: number }

GET /loyalty/user/:userId/points
Authorization: Bearer <token> (admin only)
Response: { user_id: number, loyalty_points: number }

GET /loyalty/leaderboard?limit=10
Authorization: Bearer <token>
Response: Array of top users by points
```

## Workflow Example

1. **User Registration**
   - User signs up → Gets 5 loyalty points automatically

2. **Booking and Completion**
   - User books a session → Status: "booked"
   - Session occurs
   - Admin opens Bookings page
   - Admin clicks "Complete" button → Status changes to "completed"
   - User automatically receives +10 loyalty points
   - Toast notification: "✅ Session marked as completed! User awarded 10 loyalty points."

3. **View Loyalty Points**
   - User clicks "My Profile" in sidebar
   - Sees current loyalty points balance
   - Sees earning methods

## Database Migrations Needed

Add column to users table:

```sql
ALTER TABLE users ADD COLUMN loyalty_points INT DEFAULT 0;
```

## Status Transition Rules

Valid transitions from each state:

- `booked` → `completed`, `missed`, `cancelled`
- `completed` → (terminal, no further transitions)
- `cancelled` → (terminal, no further transitions)
- `missed` → (terminal, no further transitions)

## Error Handling

- Invalid status transitions return 400 Bad Request
- Missing bookings return 404 Not Found
- Unauthorized admin actions return 403 Forbidden
- Failed point awards are logged but don't block booking status update

## Testing Checklist

- [ ] New user receives 5 points on registration
- [ ] Admin can change "booked" booking to "completed"
- [ ] User receives 10 points when booking marked complete
- [ ] Admin can change "booked" booking to "missed"
- [ ] Admin can change "booked" booking to "cancelled"
- [ ] Cannot transition from "completed" booking
- [ ] Cannot transition from "cancelled" booking
- [ ] Cannot transition from "missed" booking
- [ ] User profile shows correct loyalty points
- [ ] Leaderboard displays top users by points
- [ ] Toast notifications appear on status change
- [ ] Pages refresh and reflect changes

## Files Modified

Backend:

- `src/users/entities/user.entity.ts`
- `src/users/users.service.ts` (2 methods updated)
- `src/admin/admin.service.ts` (new method added)
- `src/admin/admin.controller.ts` (new endpoint added)
- `src/app.module.ts`

Backend - New:

- `src/loyalty/loyalty.service.ts`
- `src/loyalty/loyalty.controller.ts`
- `src/loyalty/loyalty.module.ts`

Frontend:

- `frontend/src/pages/AdminBookingsPage.tsx`
- `frontend/src/App.tsx`
- `frontend/src/components/Sidebar.tsx`

Frontend - New:

- `frontend/src/pages/UserProfilePage.tsx`
