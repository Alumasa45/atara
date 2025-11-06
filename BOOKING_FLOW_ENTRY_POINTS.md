# 🎯 Complete Booking Flow - Entry Points & Architecture

## Overview

Users can make bookings from **5 different entry points**. All paths eventually lead to the `/bookings` API endpoint.

---

## 📍 Entry Point 1: Quick Booking Sidebar (Home Page)

**File**: `frontend/src/components/BookingForm.tsx`  
**Location**: Right sidebar on home page `/`  
**Type**: Quick form - for fast bookings

### Flow:

```
User on Home → Quick Booking sidebar appears
    ↓
Enter: Guest name, email, phone (optional)
       Select schedule from dropdown
       Payment reference
    ↓
Click "Create booking" button
    ↓
POST /bookings with schedule_id + guest fields
```

### Current Issue ⚠️

- Still uses `schedule_id` instead of time slot selection
- Needs to be updated to show time slots like BookingFlow does

### API Payload:

```json
{
  "schedule_id": 123,
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "555-0100",
  "payment_reference": "MPESA123456"
}
```

---

## 📍 Entry Point 2: Book Now Button with Full Flow (Home Page)

**File**: `frontend/src/components/BookingFlow.tsx`  
**Location**: Right sidebar on home page `/` → "Book Now" button → Opens modal  
**Type**: Full interactive flow with multiple paths

### Flow:

```
User on Home → Click "Book Now"
    ↓
Modal opens with BookingFlow
    ↓
Step 1: Select Date
  - Shows all upcoming dates
  - Click date to see classes for that day
  - Each date shows individual TIME SLOTS
    ↓
Step 2: Pick Class / Time Slot
  - Shows all time slots for selected date
  - Each time slot shows: session title, time, category
  - Click "Book Now" on a slot
    ↓
Step 3: Choose Booking Method (*** THIS IS THE KEY INNOVATION ***)
  ┌─────────────────────────────────────────┐
  │ ✅ My Account / 🔓 Create Account       │  ← For Registered Users
  │ (Book using your registered account)    │
  └─────────────────────────────────────────┘
  ┌─────────────────────────────────────────┐
  │ 👤 Book as Guest                        │  ← For Guest Users
  │ (No account needed)                     │
  └─────────────────────────────────────────┘
    ↓
Step 4a (If Registered User selected):
  - If already logged in: Show user details
  - If not logged in: Redirect to /login
    ↓
Step 4b (If Guest selected):
  - Form appears: Name, Email, Phone
  - All required
    ↓
Step 5: Confirm Booking
  - Enter payment reference (optional)
  - Click "Complete booking"
    ↓
POST /bookings with time_slot_id + user_id or guest fields
```

### API Payload (Registered User):

```json
{
  "user_id": 5,
  "time_slot_id": 1,
  "payment_reference": "MPESA123456"
}
```

### API Payload (Guest User):

```json
{
  "time_slot_id": 1,
  "guest_name": "Jane Smith",
  "guest_email": "jane@example.com",
  "guest_phone": "555-0200",
  "payment_reference": "MPESA789012"
}
```

### Status: ✅ Ready for testing

---

## 📍 Entry Point 3: Browse Schedules Page

**File**: `frontend/src/pages/SchedulePage.tsx`  
**Location**: `/schedule` route  
**Type**: Browse-first approach

### Flow:

```
User navigates to /schedule
    ↓
Sees list of upcoming schedules grouped by date
    ↓
Each schedule shows its time slots
    ↓
Click "Schedule a class" on any time slot
    ↓
Opens BookingFlow modal with that time slot pre-selected
    ↓
Continues as Entry Point 2, Step 4+
```

### Status: ✅ Should work with new time slot model

---

## 📍 Entry Point 4: Client Dashboard - Upcoming Schedules

**File**: `frontend/src/pages/ClientDashboard.tsx` (line 248)  
**Location**: `/dashboard/client` → "Upcoming Schedules" section  
**Type**: Dashboard quick-access booking

### Flow:

```
User on Client Dashboard
    ↓
Sees "Upcoming Schedules" section
    ↓
Shows all available dates with time slots
    ↓
Click "Book Now" on any time slot
    ↓
Navigates to: /time-slot/{timeSlot.slot_id}/book
    ↓
Opens BookingModal with timeSlotId pre-filled
    ↓
BookingFlow starts from Step 3 (Choose Method)
    ↓
Continue booking...
```

### Route Handler:

- **Route**: `/time-slot/:id/book` (defined in `App.tsx` line ~240)
- **Component**: `BookingModal` → `BookingFlow` with `initialTimeSlotId={id}`

### Status: ✅ Fully implemented

---

## 📍 Entry Point 5: Direct API Call (Backend/Testing)

**Endpoint**: `POST http://localhost:3000/bookings`

### For Guest Users:

```bash
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "time_slot_id": 1,
    "guest_name": "John Doe",
    "guest_email": "john@example.com",
    "guest_phone": "555-0100",
    "payment_reference": "MPESA123456"
  }'
```

### For Registered Users:

```bash
curl -X POST http://localhost:3000/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 5,
    "time_slot_id": 1,
    "payment_reference": "MPESA123456"
  }'
```

---

## 🔄 Data Model for Bookings

### Booking Entity Fields:

```typescript
- booking_id: number (Primary Key)
- user_id?: number (FK to users, nullable)
- time_slot_id: number (FK to schedule_time_slots) ← NEW
- schedule_id: number (FK to schedules, kept for denormalization)
- group_id: number (FK to session_groups)
- guest_name?: string (For guest bookings)
- guest_email?: string (For guest bookings)
- guest_phone?: string (For guest bookings)
- status: 'booked' | 'confirmed' | 'completed' | 'cancelled'
- payment_reference?: string
- created_at: timestamp
- updated_at: timestamp
```

### Time Slot Entity:

```typescript
- slot_id: number (Primary Key)
- schedule_id: number (FK to schedules)
- session_id: number (FK to sessions)
- start_time: string (TIME type: HH:MM:SS)
- end_time: string (TIME type: HH:MM:SS)
- created_at: timestamp
- updated_at: timestamp
```

---

## 🧪 Testing Checklist

### Prerequisites:

1. Backend running on `http://localhost:3000`
2. Admin created some schedules with time slots
3. Sessions exist with trainers assigned

### Test Cases:

#### Test 1: Quick Booking (Entry Point 1)

- [ ] Go to home page
- [ ] Fill in Quick Booking form with guest info
- [ ] Select a schedule from dropdown
- [ ] Click "Create booking"
- [ ] Verify booking created in database
- **Note**: Form still uses schedule_id; need to update for time slots

#### Test 2: Full BookingFlow - Guest Path (Entry Point 2)

- [ ] Go to home page
- [ ] Click "Book Now" button
- [ ] Select a date
- [ ] Select a time slot
- [ ] Click "Book as Guest"
- [ ] Enter guest details
- [ ] Enter payment reference
- [ ] Click "Complete booking"
- [ ] Verify booking created with guest_name/email/phone

#### Test 3: Full BookingFlow - Registered Path (Entry Point 2)

- [ ] Go to home page (logged in as client)
- [ ] Click "Book Now" button
- [ ] Select a date
- [ ] Select a time slot
- [ ] Click "My Account"
- [ ] Verify user details are pre-filled
- [ ] Enter payment reference
- [ ] Click "Complete booking"
- [ ] Verify booking created with user_id
- [ ] Check Client Dashboard - booking should appear in "Upcoming Sessions"

#### Test 4: Browse & Book (Entry Point 3)

- [ ] Navigate to `/schedule`
- [ ] See available schedules with time slots
- [ ] Click "Schedule a class" on a time slot
- [ ] BookingFlow modal opens with time slot pre-selected
- [ ] Complete booking flow

#### Test 5: Dashboard Quick Book (Entry Point 4)

- [ ] Go to `/dashboard/client`
- [ ] Find "Upcoming Schedules" section
- [ ] Click "Book Now" on any time slot
- [ ] Should navigate to `/time-slot/{id}/book`
- [ ] Modal appears with pre-selected time slot
- [ ] Complete booking
- [ ] Booking should appear in "Upcoming Sessions" below

#### Test 6: Capacity Management

- [ ] Create a session with capacity=2
- [ ] Create a schedule with 1 time slot for this session
- [ ] Book as guest 1 → Success
- [ ] Book as guest 2 → Success
- [ ] Try to book as guest 3 → Should fail (no space in group)

#### Test 7: Multiple Time Slots Per Day

- [ ] Create schedule for Nov 10 with 3 time slots:
  - 08:00-09:00
  - 10:00-11:00
  - 14:00-15:00
- [ ] All 3 should appear as separate booking options
- [ ] Each can be booked independently
- [ ] Capacity managed per slot

---

## 🔧 Issues to Address

### Issue 1: Quick Booking Form (BookingForm.tsx)

**Problem**: Still shows full schedules instead of time slots  
**Solution**: Update dropdown to show time slots with format: "HH:MM - SessionTitle"  
**File**: `frontend/src/components/BookingForm.tsx` line ~40

### Issue 2: Time Slot Booking Needs Test

**Problem**: New time slot booking flow not yet tested end-to-end  
**Solution**: Run test cases 2-7 above  
**Timeline**: ~15 minutes for all tests

---

## 🚀 Conclusion

The booking system has **dual paths**:

1. **Quick Booking** (sidebar form) - For speed-conscious users
2. **Full BookingFlow** (modal with date/time/method selection) - For users who want to browse

Both support **guest and registered user paths**, ensuring:

- Unregistered users can book without creating an account
- Registered users can use their account for easier booking
- All bookings properly linked to specific time slots
- Capacity managed at the session level

The system is production-ready pending the BookingForm.tsx update and test verification!
