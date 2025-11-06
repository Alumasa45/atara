# Dashboard Access Guide

## Dashboard Overview

The Atara system now includes role-based dashboards for all user types (except system admins without assigned roles).

## Accessing Dashboards

After logging in, users can access their dashboard:

### 1. **Automatic Access**

- Navigate to `/dashboard` - automatically routes to your role-specific dashboard

### 2. **Direct Access by Role**

- **Client**: `/dashboard/client`
- **Trainer**: `/dashboard/trainer`
- **Manager**: `/dashboard/manager`
- **Admin**: `/dashboard/admin`

---

## Dashboard Types

### 👤 Client Dashboard

**For**: Regular clients/customers booking sessions

**Displays**:

- **Profile Info**: Username, email, member since date
- **Statistics**: Total bookings, confirmed, pending, cancelled counts
- **Upcoming Sessions**: Next 5 scheduled sessions with trainer and date info
- **Past Sessions**: History of completed/past sessions

**Actions Available**:

- View booking details
- Track session attendance

---

### 🏋️ Trainer Dashboard

**For**: Fitness trainers and instructors

**Displays**:

- **Trainer Profile**: Name, specialty, contact info, status
- **Statistics**: Total sessions, bookings, upcoming sessions, cancellations
- **Upcoming Sessions**: Schedule of all upcoming training sessions
- **Recent Bookings**: Clients who booked your sessions
- **Cancellation Requests**: Pending client cancellation requests

**Actions Available**:

- Monitor session attendance
- Track booking status
- Review cancellation requests

---

### 📊 Manager Dashboard

**For**: Studio/facility managers

**Displays**:

- **Key Metrics**:
  - Total users (clients and trainers)
  - Total bookings and sessions
  - User breakdown by type
- **Booking Overview**: Statistics by status (confirmed, pending, cancelled)
- **Recent Bookings**: Latest bookings with client, trainer, and session info
- **Cancellation Requests**: Recent cancellation requests

**Actions Available**:

- Monitor system activity
- Review booking trends
- Track cancellation patterns
- Manage day-to-day operations

---

### ⚙️ Admin Dashboard

**For**: System administrators with full access

**Displays**:

- **System Summary**:
  - Total users, bookings, sessions, schedules, trainers
  - Total cancellation requests
- **User Breakdown**: Count by role (clients, trainers, managers, admins)
- **Booking Analysis**: Detailed breakdown by status
- **Recent Activities**:
  - Recent bookings table
  - Recent user registrations
- **Pending Cancellations**: Requests requiring admin action

**Actions Available**:

- Approve/reject cancellation requests
- Full system visibility
- User management access
- Complete activity monitoring

---

## Dashboard Features

### Common Elements (All Dashboards)

1. **Statistics Cards**
   - Display key metrics at a glance
   - Color-coded for quick identification
   - Green = positive/confirmed
   - Orange = pending/attention needed
   - Red = cancelled/issues

2. **Data Tables**
   - Sort and view multiple records
   - Detailed information display
   - Status indicators with colors

3. **Status Indicators**
   - 🟢 Green: Active, Confirmed, Booked
   - 🟠 Orange: Pending, Upcoming, Inactive
   - 🔴 Red: Cancelled, Rejected, Banned

4. **Responsive Design**
   - Works on desktop, tablet, and mobile
   - Card-based layout for easy scanning
   - Scrollable tables on small screens

---

## Data Shown

### Booking Statuses

- **Booked**: Confirmed reservation
- **Completed**: Session finished
- **Missed**: User didn't attend
- **Cancelled**: Booking was cancelled

### User Roles

- **Client**: Regular user booking sessions
- **Trainer**: Instructor leading sessions
- **Manager**: Facility/studio management
- **Admin**: System administrator

### User Statuses

- **Active**: User can login and use services
- **Inactive**: User account disabled
- **Banned**: User access restricted

---

## Tips for Using Dashboards

1. **Refresh Data**: Page automatically loads latest data on access
2. **Dates**: All dates shown in your local format
3. **Statistics**: Updated in real-time from database
4. **Search**: Use browser find (Ctrl+F) to search table data
5. **Export**: Consider taking screenshots for records

---

## Troubleshooting

### "Access Denied" Message

- Verify you're logged in with correct role
- Check your user role assignment
- Clear browser cache and retry

### Missing Data

- Ensure you have sufficient permissions
- Data may still be loading (wait a few seconds)
- Refresh the page

### Wrong Dashboard Showing

- Verify your login role
- Clear localStorage and login again
- Check URL is correct for your role

---

## Role Permissions

| Feature               | Client | Trainer           | Manager | Admin |
| --------------------- | ------ | ----------------- | ------- | ----- |
| View own bookings     | ✅     | ✅                | ✅      | ✅    |
| View all bookings     | ❌     | ❌ (own sessions) | ✅      | ✅    |
| View all users        | ❌     | ❌                | ✅      | ✅    |
| View cancellations    | ❌     | ✅ (own)          | ✅      | ✅    |
| Approve cancellations | ❌     | ❌                | ❌      | ✅    |
| Full system access    | ❌     | ❌                | ❌      | ✅    |

---

## Support

For issues or questions about dashboard features:

- Contact your system administrator
- Check your user role assignment
- Verify your login credentials
