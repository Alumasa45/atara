# Public vs Protected Routes - Access Control Guide

## Overview

The Atara booking system now supports **two access levels**:

1. **Public Routes** - Accessible to anyone (no login required)
2. **Protected Routes** - Require authentication (login required)

This allows guests to browse and book without creating an account, while still protecting admin/trainer-only features.

---

## PUBLIC ROUTES (Guest Accessible)

### ✅ Home Page

- **URL**: `http://localhost:5173/`
- **What**: Browse upcoming sessions and trainers
- **Who**: Everyone (guests + registered users)
- **What You Can Do**:
  - View upcoming sessions
  - View trainer profiles
  - See session details (price, duration, etc.)

### ✅ Trainers Page

- **URL**: `http://localhost:5173/trainers`
- **What**: Browse all available trainers
- **Who**: Everyone (guests + registered users)
- **What You Can Do**:
  - View trainer profiles
  - See trainer specialties
  - View trainer contact info

### ✅ Booking Modal (Session)

- **URL**: `http://localhost:5173/sessions/:id/book`
- **What**: Book a specific session
- **Who**: Everyone (guests + registered users)
- **What You Can Do**:
  - Select date and time slot
  - Choose booking method (guest or registered)
  - Enter guest information
  - Complete booking without login

### ✅ Booking Modal (Time Slot)

- **URL**: `http://localhost:5173/time-slot/:id/book`
- **What**: Book a specific time slot
- **Who**: Everyone (guests + registered users)
- **What You Can Do**:
  - Quick booking for specific time slot
  - Choose booking method
  - Enter guest information

### ✅ Login Page

- **URL**: `http://localhost:5173/login`
- **What**: Login page
- **Who**: Everyone
- **What You Can Do**:
  - Login as registered user
  - Register if you have an account

---

## PROTECTED ROUTES (Login Required)

### 🔒 Dashboard (Role-Based)

- **URL**: `http://localhost:5173/dashboard`
- **Requires**: Login
- **Routes to**:
  - `/dashboard/client` - Client dashboard
  - `/dashboard/trainer` - Trainer dashboard
  - `/dashboard/manager` - Manager dashboard
  - `/dashboard/admin` - Admin dashboard

### 🔒 Admin Pages

- **URLs**:
  - `/admin/users` - Manage users
  - `/admin/trainers` - Manage trainers
  - `/admin/sessions` - Manage sessions
  - `/admin/schedules` - Manage schedules
  - `/admin/bookings` - View bookings
  - `/admin/profiles` - Manage profiles
- **Requires**: Admin role login

### 🔒 Trainer Pages

- **URLs**:
  - `/trainer/bookings` - View bookings
  - `/trainer/dashboard` - Trainer dashboard
  - `/trainer/sessions` - Manage sessions
  - `/trainer/profile` - Edit profile
- **Requires**: Trainer role login

### 🔒 Client Dashboard

- **URL**: `/dashboard/client`
- **Requires**: Client login
- **What You Can Do**:
  - View your bookings
  - View upcoming sessions
  - Manage your profile

### 🔒 Profile Pages

- **URLs**:
  - `/profile` - User profile (logged in user)
  - `/admin/profiles` - Admin profiles (admin only)
  - `/trainer/profile` - Trainer profile
- **Requires**: Login

---

## Guest Booking Flow - No Login Required!

Here's what a guest can do **without logging in**:

```
1. Visit Home Page (public) → 2. Click "Book Now" (public) →
3. Select Date & Time Slot (public) → 4. Choose "Guest Booking" (public) →
5. Enter Name, Email, Phone (public) → 6. Complete Booking (public) →
7. Get Booking Confirmation ✅
```

**No login needed at any step!**

---

## Registered User Booking Flow - With Login

Registered users get additional benefits:

```
1. Login (protected) → 2. Visit Home Page (public) →
3. Click "Book Now" (public) → 4. Select Date & Time Slot (public) →
5. Choose "Registered User" (public) → 6. Auto-fills user info (public) →
7. Complete Booking (public) → 8. Booking linked to user account ✅
```

Then they can:

- View bookings in their Client Dashboard (protected)
- Manage their profile (protected)

---

## Routes by Role

### Guest (Not Logged In)

✅ Can Access:

- Home page
- Trainers page
- Book sessions/time slots
- View upcoming sessions
- Login page

❌ Cannot Access:

- Any dashboard
- Admin pages
- Trainer pages
- My Bookings
- Profile pages

### Registered User (Client)

✅ Can Access:

- All public routes (home, trainers, booking)
- Client dashboard
- My bookings
- My profile

❌ Cannot Access:

- Admin pages
- Trainer pages
- Manager pages

### Trainer (Logged In)

✅ Can Access:

- All public routes (home, trainers, booking)
- Trainer dashboard
- Trainer bookings
- Trainer sessions
- Trainer profile

❌ Cannot Access:

- Admin pages
- Manager pages
- Client dashboard

### Admin (Logged In)

✅ Can Access:

- All public routes (home, trainers, booking)
- All dashboards
- All admin pages
- All user/trainer/session management
- All bookings

---

## Backend API Access

### Public Endpoints (No Auth Required)

```
GET /schedule                    (fetch schedules for booking)
GET /sessions                    (fetch sessions)
GET /trainers                    (fetch trainers)
POST /bookings                   (create guest booking)
GET /bookings/:id                (get booking status)
POST /bookings/:id/confirm       (confirm booking)
```

### Protected Endpoints (Auth Required)

```
POST /schedule                   (create schedule - admin/manager)
GET /schedule/:id                (get schedule - authenticated)
PUT /schedule/:id                (update schedule - admin/manager)
DELETE /schedule/:id             (delete schedule - admin/manager)
GET /admin/*                     (all admin endpoints)
GET /dashboard/*                 (all dashboard endpoints)
```

---

## Testing Public Access

### Test 1: Browse as Guest

1. **Don't login**
2. Go to: `http://localhost:5173/`
3. You should see:
   - ✅ Upcoming Sessions
   - ✅ Trainers
   - ✅ Quick Booking sidebar
4. Click "Book Now" → Booking modal should open ✅

### Test 2: Guest Booking

1. **Don't login**
2. Go to: `http://localhost:5173/`
3. Click "Book Now" on a session
4. Complete the booking as guest ✅

### Test 3: Protected Route Access

1. **Don't login**
2. Try to access: `http://localhost:5173/dashboard`
3. You should be **redirected to login** ✅

### Test 4: Registered User

1. **Login**
2. Go to: `http://localhost:5173/dashboard/client`
3. You should see your **bookings** ✅

---

## Security Considerations

### Frontend Protection

- Routes wrapped in `<ProtectedRoute>` redirect to login if no token
- Token stored in localStorage
- Cannot access protected pages without login

### Backend Protection

- All endpoints validate token in `JwtAuthGuard`
- Role-based access control via `RolesGuard`
- Admin/manager routes reject non-admin requests
- Public endpoints don't check auth (but validate data)

### What's Protected in Backend?

- Schedule creation/update/delete → Admin/Manager only
- Admin endpoints → Admin only
- Trainer management → Admin only
- Session creation → Admin/Trainer only

### What's Public in Backend?

- Fetching schedules for booking
- Viewing sessions
- Creating guest bookings
- Confirming bookings

---

## Configuration

All routes are configured in: `frontend/src/App.tsx`

To make a route public:

```tsx
// BEFORE (Protected)
<Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

// AFTER (Public)
<Route path="/home" element={<Home />} />
```

To protect a route:

```tsx
// Add ProtectedRoute wrapper
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

---

## Summary

| Feature           | Guest | Client | Trainer | Admin |
| ----------------- | ----- | ------ | ------- | ----- |
| Browse Sessions   | ✅    | ✅     | ✅      | ✅    |
| View Trainers     | ✅    | ✅     | ✅      | ✅    |
| Book as Guest     | ✅    | ❌     | ❌      | ❌    |
| Book as User      | ❌    | ✅     | ❌      | ❌    |
| Client Dashboard  | ❌    | ✅     | ❌      | ❌    |
| Trainer Dashboard | ❌    | ❌     | ✅      | ✅    |
| Admin Dashboard   | ❌    | ❌     | ❌      | ✅    |
| Manage Schedules  | ❌    | ❌     | ❌      | ✅    |
| Manage Sessions   | ❌    | ❌     | ❌      | ✅    |
| Manage Trainers   | ❌    | ❌     | ❌      | ✅    |

---

**Status**: ✅ PUBLIC ACCESS ENABLED
**Date**: November 5, 2025
