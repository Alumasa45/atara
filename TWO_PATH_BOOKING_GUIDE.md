# Two-Path Booking Flow - Implementation Guide

## Overview

Implemented a clear, explicit two-path booking system that eliminates confusion about guest vs. registered user bookings.

## Problem Solved

**Before:** Users saw optional guest fields (name, email, phone) and weren't sure if they should:

- Create an account, OR
- Fill in guest fields

This was causing anxiety and confusion! 😂

**After:** Users explicitly choose their booking path:

```
Select Class → Choose Method:
  ✅ My Account (Register/Login if needed)
  👤 Book as Guest (Fill contact info)
    ↓
  Confirm & Complete
```

## Changes Made

### Frontend: BookingFlow Component

**File:** `frontend/src/components/BookingFlow.tsx`

#### 1. Added New State

```typescript
type BookingMethod = 'registered' | 'guest' | null;
const [bookingMethod, setBookingMethod] = useState<BookingMethod>(null);
const currentUser = getCurrentUserFromToken();
```

#### 2. Updated Flow Steps

```typescript
type Step = 'pickDate' | 'pickClass' | 'confirm' | 'chooseBookingMethod';
```

#### 3. Modified pickClass Function

When user selects a class, instead of going directly to confirm:

- Navigate to `'chooseBookingMethod'` step
- Reset `bookingMethod` to null
- User must choose their path before seeing confirmation

#### 4. Updated completeBooking Function

Now validates based on booking method:

```typescript
if (bookingMethod === 'registered' && !currentUser?.userId) {
  toast.error('Please log in to book as a registered user');
}

if (bookingMethod === 'guest') {
  if (!guestName || !guestEmail || !guestPhone) {
    toast.error('Please provide your name, email, and phone number');
  }
}
```

Builds payload accordingly:

```typescript
// For registered users: include user_id
if (bookingMethod === 'registered' && currentUser?.userId) {
  payload.user_id = currentUser.userId;
}

// For guests: include guest info
if (bookingMethod === 'guest') {
  payload.guest_name = guestName;
  payload.guest_email = guestEmail;
  payload.guest_phone = guestPhone;
}
```

#### 5. New UI Step: "chooseBookingMethod"

**Display:** Two cards side-by-side, user taps to select:

**Card 1: Register/Login**

- Title: "✅ My Account" (if logged in) or "🔓 Create Account" (if not)
- Description: "Book using your registered account" or "Register or log in with your account"
- Selection highlights card in green

**Card 2: Book as Guest**

- Title: "👤 Book as Guest"
- Description: "No account needed. Just provide your contact info"
- Selection highlights card in green

**Action:** Continue button (disabled until method selected)

#### 6. Updated "confirm" Step UI

**Changes based on bookingMethod:**

**If `bookingMethod === 'registered'` AND user is logged in:**

- Show user's name and email (read-only)
- No input fields needed
- Ready to complete booking

**If `bookingMethod === 'registered'` AND user NOT logged in:**

- Show message: "Please log in or register to continue booking"
- [Login/Register] button directs to `/login`
- [Cancel] button returns to choose method

**If `bookingMethod === 'guest'`:**

- Show three required input fields:
  - Your name
  - Email
  - Phone
- All fields required (not optional anymore)
- Clear what's needed

**In all cases:**

- Payment reference field (optional)
- Complete booking button

## User Experience Flow

### Path 1: Registered User (Already Logged In)

```
1. Browse sessions → [Book Now]
2. Select date → Select class
3. See: "How would you like to book?"
   - Select "✅ My Account"
4. See confirmation with pre-filled info:
   - Name: John Doe
   - Email: john@example.com
5. Enter payment reference (optional)
6. Click [Complete Booking]
7. ✅ Booking confirmed
```

### Path 2: Registered User (Not Logged In)

```
1. Browse sessions → [Book Now]
2. Select date → Select class
3. See: "How would you like to book?"
   - Select "🔓 Create Account"
4. Message: "Please log in or register"
   - [Login/Register] → Goes to /login
   - User creates account or logs in
   - Returns to booking
5. Follow Path 1 from here
```

### Path 3: Guest Booking

```
1. Browse sessions → [Book Now]
2. Select date → Select class
3. See: "How would you like to book?"
   - Select "👤 Book as Guest"
4. See confirmation form with required fields:
   - Your name: [________]
   - Email: [________]
   - Phone: [________]
5. Enter payment reference (optional)
6. Click [Complete Booking]
7. ✅ Booking confirmed (email sent to provided address)
```

## Backend: No Changes Needed

The backend already supports both paths:

- `user_id` optional (nullable)
- `guest_name`, `guest_email`, `guest_phone` optional (nullable)
- Service validates booking is created (with either user_id or guest fields)

Current validation in `bookings.service.ts`:

```typescript
if (user_id) {
  user = await this.userRepository.findOne({ where: { user_id } });
  if (!user) throw new NotFoundException('User not found');
}
// Guest info is optional if user_id provided
// Both can coexist - will use user_id for linked bookings
```

## Benefits

✅ **Clear Choice:** Users know exactly what they're doing
✅ **No Confusion:** Guest fields only appear when choosing guest path
✅ **No Empty Fields:** Required fields are actually required
✅ **Accessibility:** Color highlights show selected path
✅ **Mobile Friendly:** Cards stack nicely on small screens
✅ **Flexible:** Supports both registered users and guest bookings

## Visual Design

### Booking Method Selection

```
┌─ Are you registered? ─────────────────────────┐
│                                               │
│ ┌─ ✅ My Account ─────┐  ┌─ 👤 Book as Guest─┐
│ │ Book using your      │  │ No account needed  │
│ │ registered account   │  │ Just provide       │
│ │                      │  │ contact info       │
│ └─ (green if selected) ┘  └─ (green if sel.)─ ┘
│                                               │
│ [Continue] (disabled until selected)         │
│ [Back]                                        │
└───────────────────────────────────────────────┘
```

### Confirm Step - Registered User (Logged In)

```
┌─ Confirm Booking ──────────────────────────────┐
│ Class: Yoga                                    │
│ Time: Wed Nov 05 2025 08:00 AM                │
│ Booking as: ✅ Registered User                 │
│ Name: John Doe                                 │
│ Email: john@example.com                        │
│                                               │
│ Payment reference: [__________________]       │
│ [Complete Booking]  [Back]                    │
└───────────────────────────────────────────────┘
```

### Confirm Step - Guest Booking

```
┌─ Confirm Booking ──────────────────────────────┐
│ Class: Yoga                                    │
│ Time: Wed Nov 05 2025 08:00 AM                │
│ Booking as: 👤 Guest                           │
│                                               │
│ Your name: [__________________]                │
│ Email: [__________________]                    │
│ Phone: [__________________]                    │
│                                               │
│ Payment reference: [__________________]       │
│ [Complete Booking]  [Back]                    │
└───────────────────────────────────────────────┘
```

## Testing Checklist

- [ ] Guest can see "Choose Booking Method" step
- [ ] Can select "My Account" path
- [ ] Can select "Book as Guest" path
- [ ] Registered user (logged in) shows pre-filled info
- [ ] Unregistered user sees login prompt in registered path
- [ ] Guest fields only shown in guest path
- [ ] Guest fields validation works (all required)
- [ ] Registered path doesn't ask for guest info
- [ ] Payment reference optional in both paths
- [ ] Complete booking works for registered users
- [ ] Complete booking works for guest bookings
- [ ] Email confirmation sent to guest's provided email
- [ ] Back buttons work correctly
- [ ] Mobile responsiveness good

## Code Files Modified

- ✅ `frontend/src/components/BookingFlow.tsx` - Completely refactored booking flow with two-path UI

## No Backend Changes Required

All existing guest and registered user booking logic remains functional. Frontend now makes clearer choice and sends appropriate data.

## Future Enhancements

1. **Remember Choice:** Save user's preference for next booking
2. **Social Login:** Quick register via Google/Facebook
3. **Email Verification:** Auto-verify guest email before confirmation
4. **SMS Integration:** Send OTP to guest phone for verification
5. **One-Click Booking:** For returning users

## Summary

The new two-path booking system is:

- ✅ Clear and explicit
- ✅ No more confusion about guest fields
- ✅ Better UX with visual selection
- ✅ Flexible for both use cases
- ✅ Ready to deploy
