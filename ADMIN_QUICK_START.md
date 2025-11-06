# 🚀 ADMIN SYSTEM - QUICK START GUIDE

## ⚡ Get Started in 5 Minutes

### Step 1: Start Backend (Terminal 1)

```bash
cd c:\Users\user\Desktop\atara\atarabackend
npm install
npm run start:dev
```

**Wait for**: `[Nest] ... NestJS application successfully started`

### Step 2: Start Frontend (Terminal 2)

```bash
cd c:\Users\user\Desktop\atara\atarabackend\frontend
npm install
npm run dev
```

**Wait for**: `Local: http://localhost:5173`

### Step 3: Open Browser

```
http://localhost:5173
```

### Step 4: Login as Admin

- Username: (your admin account)
- Password: (your admin password)

### Step 5: Click "Admin Dashboard"

- You're now in the admin system!

---

## 📍 Main Features Accessible From Dashboard

### 1. 👥 Manage Users

**Path**: `/admin/users`

- View all users
- Search by name, email, phone
- Filter by role and status
- Edit user roles/status
- Deactivate/activate users
- Delete users

### 2. ⚡ Register Trainer

**Path**: `/admin/trainers`

- Create new trainer account
- Assign specialty (7 options)
- View all trainers
- Search and filter trainers
- Edit trainer information

### 3. 📋 View Bookings

**Path**: `/admin/bookings`

- See all system bookings
- Search bookings
- Filter by status (4 options)
- Filter by date range
- View booking details

### 4. 📅 Manage Sessions

**Path**: `/admin/sessions`

- View all sessions
- View all schedules
- Search sessions/schedules
- Filter by status
- See trainer assignments

---

## 🔍 Quick Actions

| Action           | Button              | Location      |
| ---------------- | ------------------- | ------------- |
| View all users   | 👥 Manage Users     | Dashboard     |
| Register trainer | ⚡ Register Trainer | Dashboard     |
| Check bookings   | 📋 View Bookings    | Dashboard     |
| Manage sessions  | 📅 Manage Sessions  | Dashboard     |
| System stats     | Dashboard card      | Dashboard     |
| Search users     | Search box          | Users page    |
| Search trainers  | Search box          | Trainers page |
| Search bookings  | Search box          | Bookings page |
| Search sessions  | Search box          | Sessions page |

---

## 📊 Dashboard Overview

### Statistics Cards Display:

1. **Total Users** - with active count
2. **Total Bookings** - with confirmed count
3. **Total Sessions** - with active count
4. **Total Trainers** - with active count
5. **Total Schedules** - complete count

### Quick Navigation:

- 4 main action buttons
- System overview
- Quick tips section

---

## 🎯 Common Admin Tasks

### Task: Create New Trainer

1. Click "Register Trainer" button
2. Fill in User Account section
3. Fill in Trainer Profile section
4. Click "Register Trainer"
5. ✅ Trainer account created!

### Task: Update User Role

1. Click "Manage Users" button
2. Search for user (optional)
3. Click user row to edit
4. Change role and status
5. Click "Update User"
6. ✅ User role updated!

### Task: Check System Bookings

1. Click "View Bookings" button
2. Use search/filters as needed
3. Review booking details
4. ✅ See all bookings!

### Task: Manage Sessions

1. Click "Manage Sessions" button
2. Switch between Sessions/Schedules tabs
3. Use search/filters
4. ✅ See all sessions and schedules!

---

## 🔑 User Roles Available

| Role    | Permission Level | Can                     |
| ------- | ---------------- | ----------------------- |
| admin   | Highest          | Manage everything       |
| manager | High             | Manage users & sessions |
| trainer | Medium           | Create sessions         |
| client  | Low              | Book sessions           |

---

## 📝 Search & Filter Features

### Search Capabilities

- **Users**: Search by username, email, phone
- **Trainers**: Search by name, email, phone, specialty
- **Bookings**: Search by client, session, trainer
- **Sessions**: Search by title, description, trainer

### Filter Options

- **Users**: By role (4 options) and status (3 options)
- **Trainers**: By status (active/inactive/all)
- **Bookings**: By status (4 options) and date range (4 options)
- **Sessions**: By status (active/inactive/all)

---

## 🔐 Security Notes

- Only admins can access `/admin/*` pages
- JWT token required in all requests
- User roles cannot be changed by non-admins
- Cannot delete users with active bookings
- Cannot delete your own account

---

## 🆘 Troubleshooting

### Issue: "Unauthorized" Error

**Solution**:

- Login with admin account
- Check token in localStorage
- Clear browser cache

### Issue: "Forbidden" Error

**Solution**:

- Your account is not admin
- Contact system admin
- Request role update

### Issue: Pages not loading

**Solution**:

- Restart backend: `npm run start:dev`
- Restart frontend: `npm run dev`
- Clear browser cache

### Issue: 404 on API endpoints

**Solution**:

- Backend not running
- Check backend console for errors
- Restart backend server

---

## 📞 API Endpoints Reference

All endpoints start with `http://localhost:3000/admin`

### User Management

```
GET    /users           - List users
GET    /users/:id       - Get user
PATCH  /users/:id       - Update user
DELETE /users/:id       - Delete user
```

### Trainer Management

```
GET    /trainers        - List trainers
GET    /trainers/:id    - Get trainer
```

### Bookings

```
GET    /bookings        - List bookings
```

### Sessions

```
GET    /sessions        - List sessions
GET    /schedules       - List schedules
```

### Statistics

```
GET    /stats           - Get statistics
```

---

## 📚 Documentation Links

- **API Reference**: `ADMIN_MODULE_BACKEND.md`
- **Full Guide**: `ADMIN_DASHBOARD_COMPLETE_GUIDE.md`
- **Summary**: `ADMIN_IMPLEMENTATION_FINAL_SUMMARY.md`
- **Checklist**: `ADMIN_SYSTEM_IMPLEMENTATION_CHECKLIST.md`

---

## ✨ Features Summary

✅ User Management
✅ Trainer Registration  
✅ Bookings Oversight
✅ Session Management
✅ Schedule Management
✅ Search & Filtering
✅ Statistics & Analytics
✅ Professional UI
✅ Security & Access Control
✅ Error Handling
✅ Pagination Support
✅ Responsive Design

---

## 🎬 Quick Reference

| Need             | Do This                                     |
| ---------------- | ------------------------------------------- |
| Create trainer   | Dashboard → Register Trainer                |
| Manage users     | Dashboard → Manage Users                    |
| View bookings    | Dashboard → View Bookings                   |
| See schedules    | Dashboard → Manage Sessions (Schedules tab) |
| Change user role | Manage Users → Click user → Edit → Update   |
| Search anything  | Use search box on any page                  |
| Filter results   | Use filter dropdown on any page             |
| See stats        | Look at Dashboard cards                     |
| Go back          | Click sidebar item or dashboard button      |

---

## 🚀 You're Ready!

The admin system is now fully operational. All features are working and ready to use.

**Start by clicking the "Admin Dashboard" link in the navigation menu.**

Have fun managing your system! 🎉
