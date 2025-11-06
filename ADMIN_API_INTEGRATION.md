# Admin Dashboard - API Integration & Validation Guide

## Overview

This document outlines all API endpoints used by the admin dashboard and their validation requirements.

## API Endpoints Used

### 1. Authentication & Dashboard

```
GET /dashboard/admin
- Requires: JWT token with admin role
- Returns: Dashboard data (summary, stats, recent activities)
- Used by: AdminDashboard.tsx
```

### 2. User Management Endpoints

#### Fetch All Users

```
GET /users
- Requires: JWT token
- Returns: Array of user objects
- Fields: user_id, username, email, phone, role, status, created_at, updated_at
- Used by: AdminUsersPage.tsx
```

#### Update User

```
PATCH /users/:id
- Requires: JWT token with admin role
- Body: { role, status }
- Returns: Updated user object
- Used by: AdminUsersPage.tsx (edit modal)
```

### 3. Trainer Management Endpoints

#### Fetch All Trainers

```
GET /trainers
- Requires: JWT token
- Query params: page (optional), limit (optional)
- Returns: { data: [...trainers], total, page, limit }
- Fields: trainer_id, user_id, name, specialty, phone, email, bio, status, created_at
- Used by: TrainerRegistrationPage.tsx, AdminTrainersPage.tsx
```

#### Create Trainer Account (User)

```
POST /auth/register
- Requires: No auth (public endpoint)
- Body: {
    username: string,
    email: string,
    password: string,
    role: 'trainer',
    phone: string
  }
- Returns: { user: { user_id, username, email, ... }, accessToken, refreshToken }
- Used by: TrainerRegistrationPage.tsx
```

#### Create Trainer Profile

```
POST /trainers
- Requires: JWT token with admin role
- Body: {
    user_id: number,
    name: string,
    specialty: string,
    phone: string,
    email: string,
    bio: string,
    status: 'active' | 'inactive' | 'pending'
  }
- Returns: Created trainer object
- Used by: TrainerRegistrationPage.tsx
```

#### Update Trainer

```
PATCH /trainers/:id
- Requires: JWT token with admin/manager role
- Body: {
    name?: string,
    specialty?: string,
    phone?: string,
    email?: string,
    bio?: string,
    status?: 'active' | 'inactive' | 'pending'
  }
- Returns: Updated trainer object
- Used by: TrainerRegistrationPage.tsx (edit modal)
```

### 4. Bookings Endpoints

#### Fetch All Bookings

```
GET /bookings
- Requires: JWT token
- Query params: page (optional), limit (optional)
- Returns: { data: [...bookings], ... } or direct array
- Fields:
  - booking_id
  - user_id
  - schedule_id
  - status: 'booked' | 'cancelled' | 'missed' | 'completed'
  - created_at
  - Relations:
    - user: { user_id, username, email }
    - schedule: { schedule_id, start_time, end_time, session: {...} }
- Used by: AdminBookingsPage.tsx
```

### 5. Sessions & Schedules Endpoints

#### Fetch All Sessions

```
GET /sessions
- Requires: JWT token
- Returns: { data: [...sessions], ... } or direct array
- Fields:
  - session_id
  - trainer_id
  - title
  - description
  - type
  - capacity
  - status: 'active' | 'inactive' | 'archived'
  - created_at
  - Relations: trainer: { trainer_id, name }
- Used by: AdminSessionsPage.tsx
```

#### Fetch All Schedules

```
GET /schedules
- Requires: JWT token
- Returns: { data: [...schedules], ... } or direct array
- Fields:
  - schedule_id
  - session_id
  - start_time (ISO datetime)
  - end_time (ISO datetime)
  - location
  - capacity
  - created_at
  - Relations: session: { session_id, title, trainer: {...} }
- Used by: AdminSessionsPage.tsx
```

## Data Validation Rules

### User Management Validation

#### Role Field

- Valid values: 'client' | 'trainer' | 'manager' | 'admin'
- Cannot change own role to non-admin
- Required for updates

#### Status Field

- Valid values: 'active' | 'inactive' | 'suspended'
- Default: 'active'
- Required for updates

#### Search Fields

- Username: case-insensitive partial match
- Email: case-insensitive partial match
- Phone: exact digits match (no formatting)

### Trainer Registration Validation

#### Required Fields (Registration)

- username: min 3 chars, alphanumeric + underscore
- email: valid email format, must be unique
- password: min 8 chars, must include:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- name: min 2 chars, max 100 chars
- phone: 10-15 digits

#### Optional Fields

- bio: max 1000 chars

#### Specialty Options

```javascript
const specialties = [
  'yoga',
  'pilates',
  'strength_training',
  'dance',
  'cardio',
  'stretching',
  'aerobics',
];
```

#### Trainer Status

- Valid values: 'active' | 'inactive' | 'pending'
- Default: 'active'

### Booking Filtering

#### Status Filters

- All statuses: 'booked', 'cancelled', 'missed', 'completed'
- Filter key: `booking.status`

#### Date Range Filters

- Today: Same calendar date
- Week: Monday to Sunday (or Sunday to Saturday)
- Month: Same month and year

### Session Filtering

#### Status Filters (Sessions)

- Valid values: 'active' | 'inactive' | 'archived'
- Filter key: `session.status`

#### Time-based Filters (Schedules)

- Past: `schedule.start_time < now()`
- Upcoming: `schedule.start_time >= now()`

## Response Format Standards

### Success Response

```json
{
  "data": [...],
  "message": "Success",
  "statusCode": 200
}
```

### Paginated Response

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

### Error Response

```json
{
  "message": "Error description",
  "statusCode": 400,
  "error": "BadRequest"
}
```

## Error Handling

### Expected Error Codes

#### 400 Bad Request

- Invalid input data
- Missing required fields
- Invalid field values

#### 401 Unauthorized

- No JWT token provided
- Invalid or expired token

#### 403 Forbidden

- User doesn't have admin role
- Insufficient permissions for operation

#### 404 Not Found

- Resource doesn't exist
- User ID not found
- Trainer ID not found

#### 409 Conflict

- Email already exists
- Username already taken
- Duplicate resource

#### 500 Internal Server Error

- Database errors
- Unexpected server issues

## Implementation Notes

### Trainer Registration Flow

1. Admin fills registration form
2. Frontend validates all fields
3. POST /auth/register creates user
4. Extract user_id from response
5. POST /trainers creates trainer profile with user_id
6. Handle errors from either step

### Data Relationships

```
User (1) ─────────── (1) Trainer
  ├── user_id
  ├── username
  ├── email
  ├── role
  └── status

Trainer (1) ─────────── (N) Sessions
  └── trainer_id ────── session_id

Session (1) ─────────── (N) Schedules
  └── session_id ────── schedule_id

Schedule (1) ─────────── (N) Bookings
  └── schedule_id ────── booking_id

Booking (N) ─────────── (1) User
  └── user_id ────── user_id
```

### Date/Time Handling

#### ISO 8601 Format

- All dates from API: ISO 8601 format
- Example: "2024-01-15T14:30:00Z"

#### Frontend Conversion

```javascript
// Parse from API
new Date(iso8601String);

// Format for display
date.toLocaleDateString(); // "1/15/2024"
date.toLocaleTimeString(); // "2:30:00 PM"
date.toLocaleDateString(); // Full date format
```

#### Filtering by Date Range

```javascript
// Today
const isToday = date.toDateString() === new Date().toDateString();

// This week
const weekStart = new Date(now);
weekStart.setDate(weekStart.getDate() - weekStart.getDay());

// This month
const isThisMonth =
  date.getMonth() === now.getMonth() &&
  date.getFullYear() === now.getFullYear();
```

## Performance Considerations

### API Calls

- Fetch all data on component mount
- Filter data client-side (for faster UX)
- Use pagination query params if needed

### Data Caching

- No caching implemented (fresh data on each load)
- Consider implementing if performance is needed

### Large Datasets

- For >1000 records, implement server-side pagination
- Use limit/skip query parameters
- Implement lazy loading

## Security Considerations

### JWT Token

- Required for all admin endpoints
- Stored in localStorage
- Sent in Authorization header
- Format: "Bearer {token}"

### Role Validation

- Checked on backend for all admin operations
- Frontend checks role for navigation

### Data Validation

- Validate all inputs before sending to API
- Show validation errors to user
- Never trust client-side validation alone

### Sensitive Data

- Don't log passwords or tokens
- Don't store sensitive data in localStorage long-term
- Use HTTPS for all API calls

## Testing the Admin Dashboard

### Test Cases

#### User Management

1. ✅ Fetch all users
2. ✅ Search users by username
3. ✅ Filter users by role
4. ✅ Update user role
5. ✅ Update user status

#### Trainer Registration

1. ✅ Fill complete registration form
2. ✅ Validate all required fields
3. ✅ Create user account
4. ✅ Create trainer profile
5. ✅ Edit existing trainer
6. ✅ Filter trainers by status

#### Bookings

1. ✅ Load all bookings
2. ✅ Search bookings
3. ✅ Filter by status
4. ✅ Filter by date range

#### Sessions

1. ✅ Load all sessions
2. ✅ Load all schedules
3. ✅ Display past vs upcoming
4. ✅ Search sessions
5. ✅ Switch between tabs

---

**All endpoints are mapped and validated!** ✅
