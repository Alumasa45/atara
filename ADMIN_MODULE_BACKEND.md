# Backend Admin Module - Complete Implementation

## Overview

The backend Admin Module is now fully implemented and provides all necessary REST API endpoints for the admin dashboard. This module handles user management, trainer management, bookings oversight, session management, and system statistics.

## File Structure

```
src/admin/
├── admin.service.ts       # Business logic for all admin operations
├── admin.controller.ts    # REST API endpoints
├── admin.module.ts        # Module registration and dependencies
└── dto/
    └── admin.dto.ts       # Data Transfer Objects and validation
```

## API Endpoints

All endpoints require:

- **Authentication**: Valid JWT token in Authorization header
- **Authorization**: User must have `admin` role
- **Base Path**: `/admin`

### Statistics Endpoints

#### Get Admin Dashboard Statistics

```
GET /admin/stats
```

**Response:**

```json
{
  "users": {
    "total": 50,
    "active": 48
  },
  "trainers": {
    "total": 12,
    "active": 10
  },
  "bookings": {
    "total": 200,
    "confirmed": 180
  },
  "sessions": {
    "total": 30,
    "active": 25
  },
  "schedules": {
    "total": 120
  }
}
```

### User Management Endpoints

#### Get All Users (with pagination and filtering)

```
GET /admin/users?page=1&limit=20&search=john&filter=trainer
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by username, email, or phone
- `filter` (optional): Filter by role (admin, manager, trainer, client, or 'all')

**Response:**

```json
{
  "data": [
    {
      "user_id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "trainer",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "pages": 8
}
```

#### Get Single User by ID

```
GET /admin/users/:id
```

**Response:**

```json
{
  "user_id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "1234567890",
  "role": "trainer",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Update User Role and Status

```
PATCH /admin/users/:id
Content-Type: application/json

{
  "role": "manager",
  "status": "active"
}
```

**Valid Roles:** `admin`, `manager`, `trainer`, `client`
**Valid Statuses:** `active`, `inactive`, `suspended`

#### Get User Activity Summary

```
GET /admin/users/:id/activity
```

**Response:**

```json
{
  "user": {
    /* user object */
  },
  "stats": {
    "totalBookings": 15,
    "confirmedBookings": 12,
    "cancelledBookings": 2
  }
}
```

#### Deactivate User Account

```
PATCH /admin/users/:id/deactivate
```

**Note:** Admin cannot deactivate their own account

#### Activate User Account

```
PATCH /admin/users/:id/activate
```

#### Delete User Account

```
DELETE /admin/users/:id
```

**Restrictions:**

- Admin cannot delete their own account
- Cannot delete users with active bookings

### Trainer Management Endpoints

#### Get All Trainers (with pagination and filtering)

```
GET /admin/trainers?page=1&limit=20&search=yoga&filter=active
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name, email, phone, or specialty
- `filter` (optional): Filter by status (active, inactive, all)

**Response:**

```json
{
  "data": [
    {
      "trainer_id": 1,
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "phone": "9876543210",
      "specialty": "Yoga",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "user": {
        /* user object */
      }
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

#### Get Single Trainer by ID

```
GET /admin/trainers/:id
```

**Response:**

```json
{
  "trainer_id": 1,
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "phone": "9876543210",
  "specialty": "Yoga",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z",
  "user": {
    /* user object */
  }
}
```

### Bookings Endpoints

#### Get All Bookings (with advanced filtering)

```
GET /admin/bookings?page=1&limit=20&search=session1&filter=booked
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by client username, session title, or trainer name
- `filter` (optional): Filter by status (booked, completed, missed, cancelled, all)

**Response:**

```json
{
  "data": [
    {
      "booking_id": 1,
      "status": "booked",
      "created_at": "2024-01-15T10:30:00Z",
      "user": {
        /* user object */
      },
      "schedule": {
        "schedule_id": 5,
        "start_time": "2024-02-15T09:00:00Z",
        "end_time": "2024-02-15T10:00:00Z",
        "location": "Studio A",
        "session": {
          "session_id": 1,
          "title": "Morning Yoga",
          "trainer": {
            /* trainer object */
          }
        }
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

### Sessions Endpoints

#### Get All Sessions (with pagination and filtering)

```
GET /admin/sessions?page=1&limit=20&search=yoga&filter=active
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by title, description, or trainer name
- `filter` (optional): Filter by status (active, inactive, all)

**Response:**

```json
{
  "data": [
    {
      "session_id": 1,
      "title": "Morning Yoga",
      "description": "Relaxing morning yoga session",
      "type": "Yoga",
      "capacity": 20,
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "trainer": {
        /* trainer object */
      }
    }
  ],
  "total": 30,
  "page": 1,
  "limit": 20,
  "pages": 2
}
```

### Schedules Endpoints

#### Get All Schedules (with pagination)

```
GET /admin/schedules?page=1&limit=20&search=yoga
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by session title or trainer name

**Response:**

```json
{
  "data": [
    {
      "schedule_id": 5,
      "start_time": "2024-02-15T09:00:00Z",
      "end_time": "2024-02-15T10:00:00Z",
      "location": "Studio A",
      "session": {
        "session_id": 1,
        "title": "Morning Yoga",
        "trainer": {
          /* trainer object */
        }
      }
    }
  ],
  "total": 120,
  "page": 1,
  "limit": 20,
  "pages": 6
}
```

## Service Methods

### AdminService

All business logic is contained in `AdminService`:

#### User Operations

- `getAllUsers(query)` - Get paginated users with filtering
- `getUserById(userId)` - Get single user
- `updateUserRole(userId, updateDto)` - Update user role and status
- `getUserActivitySummary(userId)` - Get user's booking statistics
- `deactivateUser(userId, adminId)` - Deactivate user account
- `activateUser(userId)` - Activate user account
- `deleteUser(userId, adminId)` - Delete user account

#### Trainer Operations

- `getAllTrainers(query)` - Get paginated trainers with filtering
- `getTrainerById(trainerId)` - Get single trainer

#### Booking Operations

- `getAllBookings(query)` - Get paginated bookings with filtering

#### Session Operations

- `getAllSessions(query)` - Get paginated sessions with filtering
- `getAllSchedules(query)` - Get paginated schedules with filtering

#### Statistics

- `getAdminStats()` - Get system-wide statistics

## Security Features

### Authentication & Authorization

- All endpoints require valid JWT token in `Authorization` header
- `@UseGuards(JwtAuthGuard)` - Verifies JWT token validity
- `@UseGuards(RolesGuard)` - Verifies user role
- `@Roles('admin')` - Only admins can access endpoints

### Data Safety

- Prevention of self-deactivation/deletion
- Prevention of deleting users with active bookings
- Proper error handling with appropriate HTTP status codes
- SQL injection prevention through parameterized queries

## Error Handling

### Common Response Codes

| Code | Scenario                                              |
| ---- | ----------------------------------------------------- |
| 200  | Successful GET, PATCH request                         |
| 201  | Successful POST request                               |
| 400  | Bad request (validation error, self-deletion attempt) |
| 401  | Unauthorized (missing or invalid token)               |
| 403  | Forbidden (user is not admin)                         |
| 404  | Resource not found                                    |
| 500  | Server error                                          |

### Example Error Responses

**Missing Admin Role:**

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

**User Not Found:**

```json
{
  "statusCode": 404,
  "message": "User with ID 999 not found",
  "error": "Not Found"
}
```

**Cannot Delete Self:**

```json
{
  "statusCode": 400,
  "message": "Cannot delete your own account",
  "error": "Bad Request"
}
```

## Integration with Frontend

The Admin Module provides all backend support for:

- **AdminUsersPage.tsx** - User management interface
- **TrainerRegistrationPage.tsx** - Trainer registration
- **AdminBookingsPage.tsx** - Bookings management
- **AdminSessionsPage.tsx** - Session and schedule management
- **AdminDashboard.tsx** - Dashboard statistics

### Frontend API Calls

All frontend components use the `getJson` utility from `api.ts`:

```typescript
// Get all users
const users = await getJson(
  '/admin/users?page=1&limit=20&search=john&filter=trainer',
);

// Update user role
const updated = await getJson('/admin/users/1', {
  method: 'PATCH',
  body: JSON.stringify({ role: 'manager', status: 'active' }),
});

// Get bookings
const bookings = await getJson('/admin/bookings?page=1&limit=20&filter=booked');

// Get stats
const stats = await getJson('/admin/stats');
```

## Database Entities Used

The Admin Module interacts with:

- **User** - User accounts with roles and status
- **Trainer** - Trainer profiles linked to users
- **Booking** - Session bookings by clients
- **Session** - Training sessions offered
- **Schedule** - Session schedules with dates/times

## Pagination and Performance

- Default page size: 20 items
- Maximum recommended page size: 100 items
- All list endpoints support pagination for better performance
- Search functionality uses case-insensitive ILIKE queries
- Proper index recommendations:
  - `User.username`, `User.email`, `User.role`, `User.status`
  - `Trainer.status`, `Trainer.specialty`
  - `Booking.status`, `Booking.user_id`
  - `Session.status`, `Session.title`

## Testing the Admin Module

### Using the HTTP Client (app.http)

```http
### Get Admin Stats
GET http://localhost:3000/admin/stats
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN

### Get All Users (Page 1)
GET http://localhost:3000/admin/users?page=1&limit=20
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN

### Update User Role
PATCH http://localhost:3000/admin/users/2
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "role": "manager",
  "status": "active"
}

### Get All Bookings
GET http://localhost:3000/admin/bookings?filter=booked
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN

### Get All Sessions
GET http://localhost:3000/admin/sessions?page=1&limit=20
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN

### Get All Schedules
GET http://localhost:3000/admin/schedules?page=1&limit=20
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN

### Get User Activity
GET http://localhost:3000/admin/users/1/activity
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN

### Deactivate User
PATCH http://localhost:3000/admin/users/2/deactivate
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN

### Delete User
DELETE http://localhost:3000/admin/users/3
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

## Future Enhancements

Potential improvements for the Admin Module:

1. **Audit Logging** - Log all admin actions for compliance
2. **Bulk Operations** - Batch update multiple users/trainers
3. **Export Functionality** - Export user/booking data to CSV/Excel
4. **Advanced Analytics** - More detailed charts and trends
5. **Custom Reports** - Generate custom admin reports
6. **Email Notifications** - Notify admins of important events
7. **Admin Alerts** - Real-time alerts for critical issues
8. **Permission Levels** - More granular admin permissions

## Summary

The backend Admin Module is now complete and fully integrated with the frontend admin dashboard. All endpoints are secured with JWT authentication and role-based access control. The module provides comprehensive user management, trainer oversight, bookings management, and system statistics—everything needed for effective platform administration.
