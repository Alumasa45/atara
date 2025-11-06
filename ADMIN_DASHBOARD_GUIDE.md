# Admin Dashboard - Complete Guide

## Overview

The Admin Dashboard is a comprehensive system administration interface that allows administrators to manage all aspects of the Atara Studio platform. It includes user management, trainer registration, booking management, and session scheduling.

## Features

### 1. Admin Dashboard (Main)

**Route:** `/dashboard/admin`

The main admin dashboard displays:

- **Summary Statistics**
  - Total Users, Bookings, Sessions, Trainers, Cancellations, Schedules
  - Users by Role (Clients, Trainers, Managers, Admins)
  - Bookings by Status (Confirmed, Pending, Cancelled)
- **Quick Action Buttons**
  - Manage Users
  - Register Trainer
  - View Bookings
  - Manage Sessions

- **Recent Activities**
  - Recent bookings list
  - Recent users
  - Pending cancellation requests

### 2. User Management

**Route:** `/admin/users`

Manage all users in the system with the following features:

#### Summary Cards

- Total Users
- Admins count
- Managers count
- Trainers count
- Clients count

#### Filtering & Search

- Search by username, email, or phone
- Filter by role (Admin, Manager, Trainer, Client)
- Filter by status (Active, Inactive, Suspended)

#### User Actions

- View all user details
- Edit user role
- Update user status
- Color-coded status and role badges

### 3. Trainer Registration & Management

**Route:** `/admin/trainers`

Register and manage all trainers in the system.

#### Register New Trainer

Complete registration form with two sections:

**User Account Section:**

- Username (required)
- Email (required)
- Password (required)

**Trainer Profile Section:**

- Full Name (required)
- Phone (required)
- Specialty (required)
  - Yoga
  - Pilates
  - Strength Training
  - Dance
  - Cardio
  - Stretching
  - Aerobics
- Bio (optional)

#### Trainer Management

- Summary cards showing:
  - Total Trainers
  - Active Trainers
  - Inactive Trainers
  - Pending Trainers

- Search and filter trainers
- Edit trainer profiles
- Update trainer status

### 4. Bookings Management

**Route:** `/admin/bookings`

View and manage all bookings in the system.

#### Summary Statistics

- Total Bookings
- Confirmed bookings
- Completed bookings
- Missed bookings
- Cancelled bookings

#### Filtering & Search

- Search by client, session, or trainer
- Filter by status:
  - Confirmed
  - Completed
  - Missed
  - Cancelled
- Filter by date range:
  - All Time
  - Today
  - This Week
  - This Month

#### Booking Details

View comprehensive booking information:

- Booking ID
- Client name
- Session title
- Trainer name
- Date and time
- Status
- Booking date

### 5. Sessions & Schedules Management

**Route:** `/admin/sessions`

Manage all training sessions and their schedules.

#### Two Tab Views

**Sessions Tab:**

- View all training sessions
- Summary cards:
  - Total Sessions
  - Active Sessions
  - Total Schedules
  - Upcoming Schedules

- Session details:
  - Title
  - Trainer name
  - Type
  - Capacity
  - Status
  - Description
  - Creation date

- Filter by status (Active, Inactive, Archived)

**Schedules Tab:**

- View all session schedules
- Schedule details:
  - Session title
  - Trainer name
  - Start date and time
  - End time
  - Location
  - Status (Past/Upcoming)

- Automatically highlights past schedules

## User Roles & Access

### Admin Permissions

Admins have full access to:

- All user management functions
- Trainer registration and management
- All booking data
- Session and schedule management
- System overview and statistics

### Access Control

All admin pages are protected with:

- JWT authentication (must be logged in)
- Role-based access control (must be admin role)
- Automatic redirection if not authorized

## Sidebar Navigation

The admin sidebar includes:

- Home
- Dashboard (main admin dashboard)
- Users (user management)
- Trainers (trainer registration)
- Bookings (booking management)
- Sessions (session management)

## Data Management Features

### Search & Filter

All pages include comprehensive search and filtering:

- Real-time search across multiple fields
- Multiple filter options
- Instant result updates

### Status Management

Color-coded status indicators:

- **Green (#4CAF50):** Active, Confirmed, Completed
- **Orange (#FF9800):** Inactive, Pending, Upcoming
- **Red (#F44336):** Cancelled, Suspended
- **Blue (#2196F3):** Pending, Upcoming, Client role
- **Purple (#9C27B0):** Admin, Archived

### Data Display

- Responsive tables with horizontal scrolling
- Pagination indicators
- Formatted dates and times
- Clear data hierarchies

## Key Admin Tasks

### Daily Tasks

1. Review pending cancellation requests
2. Monitor new bookings
3. Check system statistics
4. Review recent user activity

### Weekly Tasks

1. Register new trainers
2. Manage inactive trainers
3. Review booking trends
4. Verify session schedules

### Monthly Tasks

1. User role audits
2. System performance review
3. Report generation
4. Policy updates

## Features Overview

### User Management Functions

✅ View all users with details
✅ Search by multiple criteria
✅ Filter by role and status
✅ Update user roles
✅ Change user status
✅ View user creation date

### Trainer Registration Functions

✅ Register new trainers with full account creation
✅ Set trainer specialties
✅ Edit trainer profiles
✅ Update trainer status
✅ Search and filter trainers
✅ View trainer statistics

### Bookings Management Functions

✅ View all bookings
✅ Search by client/session/trainer
✅ Filter by booking status
✅ Filter by date range
✅ View booking details
✅ Track booking trends

### Sessions Management Functions

✅ View all training sessions
✅ Filter sessions by status
✅ View session details
✅ Manage schedules
✅ Track upcoming sessions
✅ Monitor session capacity

## Navigation Quick Links

| Function             | Route              | Icon |
| -------------------- | ------------------ | ---- |
| Admin Dashboard      | `/dashboard/admin` | ⚙️   |
| User Management      | `/admin/users`     | 👥   |
| Trainer Registration | `/admin/trainers`  | ⚡   |
| Bookings Management  | `/admin/bookings`  | 📋   |
| Sessions Management  | `/admin/sessions`  | 📅   |

## API Endpoints Used

### Users

- `GET /users` - Fetch all users
- `PATCH /users/:id` - Update user

### Trainers

- `GET /trainers` - Fetch all trainers
- `POST /trainers` - Create new trainer
- `PATCH /trainers/:id` - Update trainer

### Bookings

- `GET /bookings` - Fetch all bookings
- `GET /dashboard/admin` - Get admin dashboard data

### Sessions

- `GET /sessions` - Fetch all sessions
- `GET /schedules` - Fetch all schedules

### Authentication

- `GET /dashboard/admin` - Admin-only endpoint (requires admin role)

## Security Features

1. **JWT Token Validation** - All requests require valid JWT token
2. **Role-Based Access Control** - Only admins can access admin pages
3. **Protected Routes** - All admin routes wrapped with ProtectedRoute component
4. **Authorization Checks** - Backend validates admin role before returning data

## Responsive Design

All admin pages are fully responsive:

- Mobile-friendly tables with horizontal scroll
- Responsive grid layouts
- Adaptive button sizing
- Mobile-optimized forms

## Best Practices

### For Admins

1. Regularly review system statistics
2. Keep trainer information current
3. Monitor booking trends
4. Manage user roles appropriately
5. Review pending cancellation requests promptly

### For System Stability

1. Archive old sessions regularly
2. Review inactive trainers
3. Monitor capacity usage
4. Track booking trends
5. Regular data backups

## Troubleshooting

### Common Issues

**Can't access admin pages?**

- Verify you have admin role
- Check JWT token is valid
- Clear browser cache and reload

**Data not loading?**

- Check network connection
- Verify backend server is running
- Check browser console for errors

**Filters not working?**

- Refresh the page
- Clear search query
- Check data availability

**Trainer registration failing?**

- Verify all required fields filled
- Check email is unique
- Verify username doesn't exist
- Check backend is running

## Future Enhancements

Potential features for future releases:

- Export bookings to CSV/PDF
- Advanced analytics dashboard
- Email notifications
- Batch user management
- Custom reports
- System logs and audit trails
- Backup and restore functionality
- Advanced scheduling tools
