# Admin Dashboard - Quick Reference Card

## 🚀 Quick Start

### Access Admin Dashboard

```
URL: http://localhost:3000/dashboard
(You'll be redirected to /dashboard/admin if you're an admin)
```

### Quick Links

```
Admin Dashboard:    /dashboard/admin
User Management:    /admin/users
Trainer Register:   /admin/trainers
Booking Manager:    /admin/bookings
Session Manager:    /admin/sessions
```

---

## 👥 Admin Pages & Functions

| Page                     | URL                | Purpose           | Key Features                          |
| ------------------------ | ------------------ | ----------------- | ------------------------------------- |
| **Admin Dashboard**      | `/dashboard/admin` | System overview   | Stats, Quick actions, Recent activity |
| **User Management**      | `/admin/users`     | Manage users      | Search, Filter, Edit roles/status     |
| **Trainer Registration** | `/admin/trainers`  | Register trainers | Full form, Create account & profile   |
| **Bookings Management**  | `/admin/bookings`  | View bookings     | Search, Filter by status & date       |
| **Sessions Management**  | `/admin/sessions`  | Manage sessions   | Dual tabs, View sessions & schedules  |

---

## 📋 Admin Tasks Checklist

### Daily

- [ ] Check pending trainer registrations
- [ ] Review new bookings
- [ ] Monitor user activity
- [ ] Check cancellation requests

### Weekly

- [ ] Register new trainers
- [ ] Review user roles
- [ ] Manage inactive users
- [ ] Check session schedules

### Monthly

- [ ] Audit user roles
- [ ] Review system statistics
- [ ] Archive old data
- [ ] Generate reports

---

## 🎯 Main Admin Function: Trainer Registration

### Steps to Register Trainer:

1. Click "Register Trainer" button
2. Fill **User Account** section:
   - Username (unique)
   - Email (unique)
   - Password (secure)
3. Fill **Trainer Profile** section:
   - Full Name
   - Phone Number
   - Specialty (choose from list)
   - Bio (optional)
4. Click "Register Trainer"
5. Done! Trainer account created

### Trainer Specialties Available:

- Yoga
- Pilates
- Strength Training
- Dance
- Cardio
- Stretching
- Aerobics

---

## 🔍 Search & Filter

### User Management

- **Search:** Username, Email, Phone
- **Filter by Role:** Admin, Manager, Trainer, Client
- **Filter by Status:** Active, Inactive, Suspended

### Trainer Registration

- **Search:** Name, Email, Phone, Specialty
- **Filter by Status:** Active, Inactive, Pending

### Bookings Management

- **Search:** Client, Session, Trainer
- **Filter by Status:** Confirmed, Completed, Missed, Cancelled
- **Filter by Date:** Today, This Week, This Month, All Time

### Sessions Management

- **Search:** Session Title, Trainer
- **Tabs:** Sessions | Schedules

---

## 📊 Statistics & Summaries

### Admin Dashboard Shows:

- Total Users, Bookings, Sessions, Trainers
- Cancellations & Schedules
- Users by role breakdown
- Bookings by status breakdown
- Recent bookings list
- Recent users list
- Pending cancellations

### User Management Shows:

- Total Users
- Admins, Managers, Trainers, Clients counts

### Trainer Registration Shows:

- Total Trainers
- Active, Inactive, Pending counts

### Bookings Shows:

- Total Bookings
- Confirmed, Completed, Missed, Cancelled counts

### Sessions Shows:

- Total Sessions & Active count
- Total Schedules & Upcoming count

---

## 🎨 Color Guide

```
Status Colors:
🟢 GREEN    = Active, Confirmed, Completed
🟠 ORANGE   = Inactive, Pending, Upcoming
🔴 RED      = Cancelled, Suspended
🔵 BLUE     = Info, Primary actions, Client
🟣 PURPLE   = Admin, Premium, Archived
⚫ GRAY      = Inactive, Archived, Past
```

---

## ⚡ Quick Actions

### From Admin Dashboard:

```
Button 1: 👥 Manage Users      → /admin/users
Button 2: ⚡ Register Trainer  → /admin/trainers
Button 3: 📋 View Bookings     → /admin/bookings
Button 4: 📅 Manage Sessions   → /admin/sessions
```

---

## 📱 Sidebar Navigation

```
ADMIN MENU:
├─ 🏠 Home
├─ 📊 Dashboard
├─ 👥 Users          (User Management)
├─ ⚡ Trainers       (Trainer Registration)
├─ 📋 Bookings       (Bookings Management)
└─ 📅 Sessions       (Sessions Management)
```

---

## 🔐 Security Notes

✅ All pages require:

- Valid JWT token
- Admin role
- Active session

✅ Access control:

- Only admins can access
- Automatic redirection if not authorized
- Session timeout protection

---

## 🐛 Common Issues & Solutions

| Issue                      | Solution                              |
| -------------------------- | ------------------------------------- |
| Can't access pages         | Verify admin role, refresh token      |
| Search not working         | Refresh page, clear search box        |
| Data not loading           | Check backend running, refresh page   |
| Trainer registration fails | Verify all fields, check email unique |
| Form won't submit          | Validate all required fields          |
| Modal won't close          | Click Cancel or outside modal         |

---

## ⌨️ Keyboard Shortcuts

```
Ctrl/Cmd + F     = Focus search box (when on page)
Enter            = Submit form
Escape           = Close modal dialogs
Tab              = Navigate form fields
Shift + Tab      = Navigate backwards
```

---

## 📞 Support

### Before contacting support:

1. Refresh the page
2. Clear browser cache
3. Check backend is running
4. Check internet connection
5. Verify admin role

### Check browser console for errors:

- Press F12 or Right-click → Inspect
- Go to Console tab
- Look for red error messages

---

## 🎓 Common Workflows

### Register New Trainer

```
/dashboard/admin
    ↓ Click "Register Trainer"
/admin/trainers
    ↓ Fill form and submit
✓ Trainer created and appears in list
```

### Edit User Role

```
/admin/users
    ↓ Search/find user
    ↓ Click "Edit"
    ↓ Change role in modal
    ↓ Click "Save Changes"
✓ Role updated in list
```

### Find Bookings by Date

```
/admin/bookings
    ↓ Select date range filter
    ↓ Data updates automatically
✓ See bookings for selected period
```

### View Session Schedule

```
/admin/sessions
    ↓ Click "Schedules" tab
    ↓ View all upcoming/past schedules
    ↓ Use search if needed
✓ See session schedules
```

---

## 📈 Performance Tips

- Use search before filtering
- Filter by status to reduce data
- Use date filters for bookings
- Close modals when done
- Refresh if data seems stale

---

## 🎯 Admin Best Practices

1. **Regular Audits**
   - Check user roles monthly
   - Review inactive accounts
   - Monitor trainer status

2. **Data Accuracy**
   - Keep trainer info current
   - Verify user information
   - Track bookings carefully

3. **System Health**
   - Monitor statistics
   - Review pending items
   - Archive old data

4. **Security**
   - Don't share admin credentials
   - Logout when done
   - Keep password secure

---

## 📚 Documentation

- **ADMIN_DASHBOARD_GUIDE.md** - Detailed features guide
- **ADMIN_IMPLEMENTATION_COMPLETE.md** - Implementation summary
- **ADMIN_API_INTEGRATION.md** - API endpoints & validation
- **ADMIN_VISUAL_FLOWCHART.md** - Visual flowcharts

---

## ✨ Features Summary

✅ Complete user management
✅ Full trainer registration system
✅ Comprehensive booking management
✅ Session & schedule management
✅ Advanced search & filtering
✅ Real-time statistics
✅ Responsive design
✅ Mobile-friendly interface
✅ Role-based access control
✅ JWT authentication
✅ Modal editing
✅ Data validation

---

## 🚀 You're Ready!

**All features are implemented and tested. Start exploring by logging in as an admin!**

### First Steps:

1. Login as admin
2. Go to /dashboard/admin
3. Try quick action buttons
4. Explore each page
5. Register your first trainer

---

**Made with ❤️ for Atara Studio Admins** 🎉
