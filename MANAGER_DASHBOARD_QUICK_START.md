# Manager Dashboard - Quick Start & Testing Guide

## 🚀 Quick Start

### 1. Ensure Backend is Running

```bash
cd c:\Users\user\Desktop\atara\atarabackend
npm run start:dev
```

Expected output: "Nest application successfully started on port 3000"

### 2. Ensure Frontend Dev Server is Running

```bash
cd c:\Users\user\Desktop\atara\atarabackend\frontend
npm run dev
```

Expected output: "VITE v5.0.0 ready in X ms"

### 3. Access Manager Dashboard

```
http://localhost:5173/dashboard/manager
```

---

## 🧪 Testing Scenarios

### Scenario 1: Login as Manager

1. Navigate to `http://localhost:5173/login`
2. Use manager credentials (if available)
3. Should be redirected to Manager Dashboard

**Expected Result**: ✅ Dashboard loads with all tabs visible

---

### Scenario 2: View Overview Tab

1. On Manager Dashboard (Overview tab should be active by default)
2. Look for summary cards:
   - Total Users
   - Total Bookings
   - Total Sessions
   - Total Trainers
   - Total Schedules

**Expected Result**: ✅ All cards display with data from `/admin/stats`

---

### Scenario 3: User Management

1. Click on "👥 Users" tab
2. System loads user list
3. Verify columns:
   - Username
   - Email
   - Role (with color badge)
   - Status (with color badge)
   - **Loyalty Points** (blue badge with ⭐)
   - Actions (Edit button)

**Expected Result**: ✅ Users list displays with loyalty points showing

---

### Scenario 4: Search Users

1. In Users tab, enter search term in search box
2. Click "🔍 Search" or press Enter
3. System filters users

**Test Cases**:

- Search by username
- Search by email
- Search by phone number

**Expected Result**: ✅ Results filtered correctly

---

### Scenario 5: Filter Users by Role

1. In Users tab, select role from dropdown
2. Options: All Roles, Client, Trainer, Manager, Admin
3. List updates with selected role only

**Expected Result**: ✅ Users filtered by role

---

### Scenario 6: Edit User Role/Status

1. In Users tab, click "✏️ Edit" button on any user
2. Modal opens with current role and status
3. Change role to different option
4. Change status to "Inactive"
5. Click "💾 Save"

**Expected Result**: ✅ Modal closes, user list refreshes with updated data

---

### Scenario 7: View Bookings

1. Click on "📅 Bookings" tab
2. System loads bookings list
3. Verify columns:
   - Booking ID
   - User (username)
   - Session
   - Status (with color badge)
   - Date
   - Actions (Change Status button)

**Expected Result**: ✅ Bookings list displays correctly

---

### Scenario 8: Filter Bookings by Status

1. In Bookings tab, select status from dropdown
2. Options: All Bookings, Pending, Confirmed, Completed, Cancelled
3. List updates

**Expected Result**: ✅ Bookings filtered by status

---

### Scenario 9: Change Booking Status

1. In Bookings tab, click "📝 Change Status" on any booking
2. Modal opens with status dropdown
3. Select new status (e.g., "Completed")
4. Click "✓ Update"

**Expected Result**: ✅ Booking status updated, list refreshed

---

### Scenario 10: View Schedules

1. Click on "⏰ Schedules" tab
2. System loads schedules list
3. Verify columns:
   - Schedule ID
   - Name
   - Description
   - Status
   - Created date

**Expected Result**: ✅ Schedules display with pagination

---

### Scenario 11: View Sessions

1. Click on "🎯 Sessions" tab
2. System loads sessions list
3. Verify columns:
   - Session ID
   - Trainer ID
   - Schedule ID
   - Status
   - Created date

**Expected Result**: ✅ Sessions display with pagination

---

### Scenario 12: View Trainers

1. Click on "⚡ Trainers" tab
2. System loads trainers list
3. Verify columns:
   - Trainer ID
   - Name
   - Email
   - Status
   - Joined date

**Expected Result**: ✅ Trainers display with pagination

---

### Scenario 13: Analytics Overview

1. Click on "📊 Analytics" tab
2. System loads analytics section
3. Should display:
   - **Monthly Analysis Card** (gradient purple)
   - **System Analysis Chart** (line graph)
   - **User Intake Chart** (bar graph)

**Expected Result**: ✅ All charts render without errors

---

### Scenario 14: Monthly Analysis Card Details

1. In Analytics tab, check Monthly Analysis Card
2. Verify it displays:
   - Month and Year (e.g., "November 2025")
   - System Health Score (85% in demo)
   - Key metrics:
     - New Users: 487
     - Total Bookings: 1203
     - Completed Sessions: 892
     - Loyalty Points Awarded: 8920
     - Avg Booking/User: 2.47
     - Completion Rate: 85%
   - Top Trainer: Ahmed Hassan
   - Peak Booking Time: 6:00 PM - 8:00 PM
   - Insights section

**Expected Result**: ✅ Card displays all information correctly

---

### Scenario 15: System Analysis Chart

1. In Analytics tab, look at System Analysis Chart (line graph)
2. Chart should show:
   - X-axis: Days 1-30
   - Y-axis: Counts (0-100+)
   - Three lines: Bookings (blue), Sessions (green), Users (orange)
3. Hover over lines to see tooltips

**Expected Result**: ✅ Chart renders with interactive tooltips

---

### Scenario 16: User Intake Chart

1. In Analytics tab, look at User Intake Chart (bar graph)
2. Chart should show:
   - X-axis: Days (D1-D30)
   - Y-axis: New users per day
   - Colored bars
3. Hover over bars to see values

**Expected Result**: ✅ Chart renders with tooltips

---

### Scenario 17: Pagination

1. In any tab with list (Users, Bookings, etc.)
2. Scroll to bottom to find pagination
3. Click "Next →" button
4. System should load next page

**Expected Result**: ✅ Page number updates, new data loads

---

### Scenario 18: Quick Actions

1. On Overview tab, scroll to "🚀 Quick Actions" section
2. Click each button:
   - "👥 Manage Users" → Should switch to Users tab
   - "📅 View Bookings" → Should switch to Bookings tab
   - "⏰ View Schedules" → Should switch to Schedules tab
   - "📊 View Analytics" → Should switch to Analytics tab

**Expected Result**: ✅ Each button navigates to correct tab

---

### Scenario 19: Memberships Navigation (Admin Only)

1. Navigate to Admin Dashboard: `http://localhost:5173/dashboard/admin`
2. Find "💳 Memberships" button
3. Click it
4. Should navigate to: `http://localhost:5173/admin/memberships`

**Expected Result**: ✅ Navigates to AdminMembershipsPage

---

### Scenario 20: Access Control

1. Try to access Manager Dashboard as non-manager
2. System should redirect to home page

**Expected Result**: ✅ Redirected (URL changes to `/`)

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch users" error

**Solution**:

- Check backend is running: `npm run start:dev`
- Verify token is valid in localStorage
- Check network tab in browser DevTools
- Ensure API endpoint is accessible: `http://localhost:3000/admin/users`

### Issue: Charts not displaying

**Solution**:

- Verify Recharts installed: `npm list recharts`
- If missing, run: `npm install recharts`
- Check browser console for errors
- Refresh page (Ctrl+F5 hard refresh)

### Issue: Loyalty points not showing

**Solution**:

- Verify database migration ran: `npm run migration:run`
- Check database has `loyalty_points` column
- Verify user has loyalty points (check database)
- Refresh page

### Issue: Modal not closing after save

**Solution**:

- Check network response in DevTools (should be 200)
- Verify API returned updated user
- Check browser console for errors
- Try refreshing page

### Issue: "Access Denied" message

**Solution**:

- Verify logged-in user is manager or admin
- Check localStorage for user role
- Try logging out and back in
- Clear browser cache

---

## 📊 Demo Data Information

**Sample Monthly Analysis**:

```
Month: November 2025
New Users: 487
Total Bookings: 1203
Completed Sessions: 892
Loyalty Points Awarded: 8920
Avg Booking/User: 2.47
Session Completion Rate: 85%
System Health Score: 85%
Top Trainer: Ahmed Hassan
Peak Booking Time: 6:00 PM - 8:00 PM
```

**Note**: This is demo data. After connecting to actual backend analytics endpoint, these will be real values.

---

## ✅ Verification Checklist

Before considering complete, verify:

- [ ] Manager Dashboard loads
- [ ] All 7 tabs visible and working
- [ ] Overview tab shows stats
- [ ] Users tab displays with loyalty points
- [ ] Can search and filter users
- [ ] Can edit user role/status
- [ ] Bookings tab loads and filters work
- [ ] Can change booking status
- [ ] Schedules/Sessions/Trainers tabs work
- [ ] Analytics tab displays all charts
- [ ] Monthly analysis card shows correctly
- [ ] Memberships button navigates
- [ ] Pagination works on all lists
- [ ] No console errors
- [ ] No 500 errors
- [ ] Responsive on mobile
- [ ] All API calls succeed

---

## 📞 Support

If you encounter any issues:

1. Check browser console for errors (F12)
2. Check network tab for API response status
3. Verify backend is running and responsive
4. Clear browser cache and refresh
5. Check localStorage for valid token

---

## 🎉 Success!

When all scenarios pass, the Manager Dashboard is fully functional and ready for use!

**Next Steps**:

1. Run database migration: `npm run migration:run`
2. Test with real data (not demo data)
3. Deploy to production
4. Train managers to use dashboard

---
