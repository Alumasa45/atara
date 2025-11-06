# Guest Booking Flow - Complete Testing Guide

## Overview

The booking system supports two paths:

1. **Guest Booking** - No login required, provide name/email/phone
2. **Registered Booking** - Must be logged in

This guide covers testing the **Guest Booking** path.

---

## Step 1: Verify Admin Has Created Schedules

First, make sure there are schedules available:

1. **Login as Admin**
   - Go to: `http://localhost:5173/login`
   - Username: `admin` (or your admin user)
   - Password: your admin password

2. **Navigate to Schedules**
   - Click "Schedules" in the sidebar
   - You should see a list of schedules with dates and time slots
   - If no schedules exist, create one:
     - Click "Add Schedule"
     - Pick a date (today or future)
     - Add time slots (e.g., 10:00 - 11:00, 14:00 - 15:00)
     - Save

**Example Schedule to Create:**

- Date: Today or tomorrow
- Time Slot 1: 10:00 - 11:00 (Capacity: 5)
- Time Slot 2: 14:00 - 15:00 (Capacity: 5)

---

## Step 2: Login As Admin & Create Sessions

Admin needs to create sessions that can be booked:

1. **Go to Sessions Page**
   - Click "Sessions" in sidebar
   - Create a new session if none exist:
     - Description: "Morning Yoga Class"
     - Category: "yoga"
     - Duration: 60 minutes
     - Capacity: 15
     - Price: 2000 KES

2. **Create a Trainer** (if needed)
   - Go to "Trainers" in sidebar
   - Click "Register Trainer"
   - Full Name: e.g., "Jane Doe"
   - Email: e.g., "jane@example.com"
   - Specialty: "yoga"
   - Phone: "+254712345678"
   - Status: "Active"
   - Click "Register Trainer"

3. **Link Session to Trainer**
   - Go back to Sessions
   - Edit your session
   - Select the trainer you just created
   - Save

---

## Step 3: Logout and Test Guest Booking

1. **Logout**
   - Click your profile icon
   - Click "Logout"
   - Or go to: `http://localhost:5173/login` (you'll be redirected if logged out)

2. **Go to Home Page**
   - Navigate to: `http://localhost:5173/`
   - Or click "Home" in the sidebar (if visible when logged out)
   - You should see the "Upcoming Sessions" section

3. **Find "Book Now" Button**
   - In the "Upcoming Sessions" section, you should see sessions listed
   - Each session has a green "Book Now" button
   - Click on it

---

## Step 4: Complete Guest Booking Flow

### 4a. Pick a Date

1. **Modal Opens**: "Book a class"
2. **Select Date**:
   - Click on one of the available dates in the date picker
   - You should see dates like "2025-11-05", "2025-11-06", etc.
   - This date should have the schedule you created in Step 1

### 4b. Select Time Slot

1. **View Time Slots**:
   - After selecting a date, you'll see available time slots
   - Example: "10:00 - 11:00", "14:00 - 15:00"
   - Click on one to select it
   - It should show a green checkmark or border

2. **View Slot Details**:
   - Session name
   - Time
   - Price

### 4c. Choose Booking Method

1. **Booking Method Selection**:
   - Two options appear:
     - "Guest Booking" (recommended for test)
     - "Registered User" (requires login)
   - Click on "Guest Booking"

### 4d. Enter Guest Information

1. **Fill in Guest Details**:

   ```
   Name: John Doe
   Email: john@example.com
   Phone: +254712345678
   ```

2. **Enter Payment Reference** (optional):
   - This is for M-Pesa or payment confirmation
   - For testing, you can leave it blank or enter a test reference like: `TEST123`
   - In real usage, this would be from M-Pesa payment

3. **Click "Complete Booking"**

### 4e: Expected Result

1. **Success Toast**:
   - Green notification: "Booking created #X" (X is booking ID)
   - Another notification: "Payment verified — booking completed" (if payment is auto-verified)

2. **Modal Closes**
   - You're back to the home page

3. **Booking Created**
   - A new booking record is created in the database
   - Status: "pending" (or "completed" if payment verified)

---

## Step 5: Verify Booking Was Created

### Option A: Check via Admin Dashboard

1. **Login as Admin** again
2. **Go to Bookings**
3. **Find Your Booking**:
   - Look for the guest name you entered ("John Doe")
   - Verify details:
     - Guest name matches
     - Guest email matches
     - Guest phone matches
     - Status shows "pending" or "completed"
     - Time slot is correct
     - Price matches

### Option B: Check Database

```sql
SELECT * FROM bookings WHERE guest_name = 'John Doe';
```

Expected columns:

- `booking_id` (auto-generated)
- `time_slot_id` (foreign key to schedule_time_slots)
- `guest_name` = "John Doe"
- `guest_email` = "john@example.com"
- `guest_phone` = "+254712345678"
- `status` = "pending" or "verified"
- `payment_reference` = null (if you didn't enter one)

---

## Common Issues & Troubleshooting

### Issue 1: "No schedules available" in modal

**Solution**:

- Verify admin created schedules (Step 1)
- Check that schedules have dates
- Check browser console (F12) for errors
- See: `SCHEDULE_FETCH_FIX.md`

### Issue 2: No dates appear after selecting a session

**Solution**:

- Make sure the schedule has a valid date field
- Check that time slots are created for that schedule
- Check backend logs for errors

### Issue 3: "Booking created" but can't see it in Admin

**Solution**:

- Make sure you're looking for the correct guest name
- Check the Bookings page filters (may be filtered by status)
- Try refreshing the page
- Check database directly

### Issue 4: Payment not verifying

**Solution**:

- Payment verification requires valid M-Pesa reference or test setup
- For now, booking is created with status "pending"
- Admin can manually verify in Admin Dashboard

### Issue 5: Can't find "Book Now" button

**Solution**:

- Make sure you're on Home page (logged out)
- Make sure sessions exist (created in Step 2)
- Make sure sessions have trainers assigned
- Check browser console for JavaScript errors

---

## Testing Checklist

- [ ] Admin logged in and created schedules with time slots
- [ ] Admin created sessions and assigned trainers
- [ ] Logged out and went to Home page
- [ ] Clicked "Book Now" on a session
- [ ] Date picker showed available dates
- [ ] Selected a date and saw time slots
- [ ] Selected a time slot (saw visual feedback)
- [ ] Chose "Guest Booking" option
- [ ] Entered guest name, email, phone
- [ ] Clicked "Complete Booking"
- [ ] Saw success notifications
- [ ] Modal closed
- [ ] Logged back in as admin
- [ ] Found booking in Bookings page with guest details
- [ ] Verified all details match what you entered

---

## Database Verification Query

After booking, you can verify directly in the database:

```sql
-- Find the booking
SELECT b.*, ts.start_time, ts.end_time, s.date
FROM bookings b
JOIN schedule_time_slots ts ON b.time_slot_id = ts.slot_id
JOIN schedules s ON ts.schedule_id = s.schedule_id
WHERE b.guest_name = 'John Doe'
ORDER BY b.created_at DESC;
```

Expected result: 1 row with your booking details

---

## Next Steps After Successful Guest Booking

1. **Test Registered User Booking**
   - Login as a regular user
   - Go through the same flow but choose "Registered User"
   - Verify booking has `user_id` instead of guest info

2. **Test Multiple Bookings**
   - Book the same time slot twice
   - Verify capacity management (can't book if full)

3. **Test Payment Integration**
   - Try entering valid M-Pesa reference
   - Verify payment verification works

4. **Test Booking Confirmation**
   - Go to dashboard and verify booking appears there
   - Test cancellation if available

---

## Quick Command Reference

**Start Frontend Dev Server** (if not running):

```bash
cd frontend
npm run dev
```

**Access Points:**

- Home/Booking: `http://localhost:5173/`
- Login: `http://localhost:5173/login`
- Admin Dashboard: `http://localhost:5173/dashboard/admin`
- Bookings Page: `http://localhost:5173/admin/bookings`
- Schedules Page: `http://localhost:5173/admin/schedules`

**Test Credentials** (adjust to your actual users):

- Admin username: `admin`
- Admin password: `your_password`

---

**Status**: ✅ COMPLETE TESTING GUIDE
**Created**: November 5, 2025
