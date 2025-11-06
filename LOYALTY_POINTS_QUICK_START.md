# Booking Status Management & Loyalty Points - Quick Start Guide

## Admin Managing Bookings

### Step 1: Navigate to Admin Bookings

1. Login as admin
2. Click "Bookings" in sidebar (📋 icon)
3. View all bookings in table

### Step 2: Change Booking Status

For any booking with status "**booked**", you'll see 3 action buttons:

| Button          | Result                     | Points Awarded     |
| --------------- | -------------------------- | ------------------ |
| ✅ **Complete** | Marks session as completed | +10 points to user |
| ⏭️ **Missed**   | Marks session as missed    | No points          |
| ❌ **Cancel**   | Cancels the booking        | No points          |

### Step 3: Confirm Changes

- Success toast notification appears
- Page automatically refreshes
- Booking status updates in table
- User receives loyalty points (if completed)

---

## User Viewing Loyalty Points

### Access User Profile

1. Click "My Profile" in sidebar (⭐ icon)
2. See account information at top
3. View **Loyalty Points** card (purple gradient)

### Points Display

```
🏆 Loyalty Points
├─ Current Balance: [Total Points]
└─ How to Earn:
   ✅ 5 points for registration
   ✅ 10 points per completed session
```

### Example Scenarios

#### Scenario 1: New User

- Registers → **5 points**
- Books session → **0 points** (yet)
- Session completed by admin → **+10 points** = **15 total**

#### Scenario 2: Active User

- Registration: **5 points**
- After 10 completed sessions: **5 + (10 × 10) = 105 points**

---

## Backend API Reference

### Update Booking Status

```bash
PATCH http://localhost:3000/admin/bookings/:bookingId/status
Authorization: Bearer <token>

Request Body:
{
  "status": "completed" | "missed" | "cancelled"
}

Response:
{
  "booking_id": 1,
  "status": "completed",
  "user_id": 5,
  ...
}
```

### Get User Loyalty Points

```bash
GET http://localhost:3000/loyalty/my-points
Authorization: Bearer <token>

Response:
{
  "loyalty_points": 15
}
```

### Get Loyalty Leaderboard

```bash
GET http://localhost:3000/loyalty/leaderboard?limit=10
Authorization: Bearer <token>

Response:
[
  { "user_id": 1, "username": "john_doe", "loyalty_points": 105 },
  { "user_id": 2, "username": "jane_smith", "loyalty_points": 95 },
  ...
]
```

---

## Status Flow Diagram

```
User Books Session
        ↓
  Status: "booked"
        ↓
    [Admin Actions]
        ↙  ↓  ↘
   Complete Missed Cancel
        ↓    ↓    ↓
    completed missed cancelled
   (Terminal) (Terminal) (Terminal)
        ↓
   +10 Points
   (if completed)
        ↓
   Total Points Updated
```

---

## Key Features

✅ **Automatic Point Allocation**

- Triggered when admin marks booking as "completed"
- Doesn't block booking status change if point award fails
- Logged for debugging

✅ **Status Validation**

- Only "booked" bookings can change status
- Terminal states prevent accidental changes
- Clear error messages on invalid transitions

✅ **User Experience**

- Toast notifications on all actions
- Auto-refresh shows latest changes
- Points display in prominent card
- Leaderboard shows community engagement

✅ **Admin Control**

- Simple one-click status changes
- Action buttons only appear for "booked" bookings
- Disabled during update (prevents double-clicks)

---

## Troubleshooting

### Points Not Awarded?

1. Check user has valid user_id (not guest booking)
2. Check booking status actually changed to "completed"
3. Check backend logs for loyalty service errors
4. Refresh page to verify points updated

### Can't Change Booking Status?

1. Verify user is logged in as admin
2. Verify booking status is "booked" (not already changed)
3. Check for network errors in browser console
4. Try refreshing page and retry

### Profile Page Shows 0 Points?

1. User must have completed registration
2. Give page 2-3 seconds to load
3. Refresh page if needed
4. Check /loyalty/my-points endpoint in network tab

---

## Notes

- Loyalty points are cumulative (never decrease except via deduction method)
- Points are user-specific and persist across logins
- Leaderboard updates in real-time
- All point awards are logged for audit trail
