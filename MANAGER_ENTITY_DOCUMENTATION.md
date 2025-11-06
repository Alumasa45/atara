# Manager Entity & System Documentation

## Overview

You now have a complete **separate Manager entity** system distinct from the Admin entity. This explains how the role hierarchy works in your system.

## 🏗️ Architecture: Role vs. Permission Level

### User Role (in `User` entity)

The **role** field determines which dashboard a user accesses:

- `client` → Client Dashboard
- `trainer` → Trainer Dashboard
- `manager` → Manager Dashboard ✨ NEW
- `admin` → Admin Dashboard

### Manager Permission Level (in `Manager` entity)

The **manager_role** field determines what a manager can do:

- `center_manager` - Manages one training center/branch
- `regional_manager` - Manages multiple centers in a region
- `operations_head` - Manages all operations

### Admin Permission Level (in `Admin` entity)

The **permission_level** field determines admin capabilities:

- `super_admin` - Full system access, manage other admins
- `admin` - Manage users, trainers, bookings, sessions
- `manager` - (removed in favor of separate Manager entity)

## 📊 System Flow

```
User Registration
       ↓
    role = 'client'  OR  role = 'trainer'  OR  role = 'manager'  OR  role = 'admin'
       ↓                      ↓                       ↓                     ↓
   Client Dashboard    Trainer Dashboard     Manager Dashboard      Admin Dashboard
   (no extra entity)   (Trainer entity)      (Manager entity)       (Admin entity)
                                                    ↓
                                          manager_role: center_manager
                                          (manages trainers & sessions)
```

## 🎯 Manager Entity Structure

**Location**: `src/managers/entities/manager.entity.ts`

### Fields

```typescript
admin_id; // Primary Key
user_id; // Foreign Key to User (One-to-One)
center_id; // Which center they manage
manager_role; // center_manager, regional_manager, operations_head
manager_status; // active, inactive, on_leave
phone; // Contact number
department; // Center/Branch name
bio; // Manager bio
trainers_count; // Track # of trainers managed
sessions_count; // Track # of sessions managed
last_action; // Last action timestamp
notes; // Admin notes
created_at; // Creation timestamp
updated_at; // Update timestamp
```

### Enums

**ManagerRole**

```typescript
CENTER_MANAGER = 'center_manager'; // Manages one center
REGIONAL_MANAGER = 'regional_manager'; // Manages multiple centers
OPERATIONS_HEAD = 'operations_head'; // Manages all operations
```

**ManagerStatus**

```typescript
ACTIVE = 'active';
INACTIVE = 'inactive';
ON_LEAVE = 'on_leave';
```

## 🔄 Manager vs Admin vs User

| Aspect               | User              | Manager                  | Admin                        |
| -------------------- | ----------------- | ------------------------ | ---------------------------- |
| **Entity**           | User only         | User + Manager           | User + Admin                 |
| **Role Field**       | manager           | manager                  | admin                        |
| **Permission Level** | N/A               | manager_role (3 options) | permission_level (3 options) |
| **Scope**            | One person        | One or more centers      | Entire platform              |
| **Manages**          | Their profile     | Trainers & sessions      | All users & system           |
| **Dashboard**        | Manager Dashboard | Manager Dashboard        | Admin Dashboard              |

## 📋 Backend API Endpoints

**Base**: `/api/managers` (Protected by JWT + role 'admin')

### Endpoints

```
POST   /managers                      // Create manager
GET    /managers                      // List all managers (with filters)
GET    /managers/stats                // Manager statistics
GET    /managers/:manager_id          // Get manager by ID
GET    /managers/user/:user_id        // Get manager by user ID
GET    /managers/center/:center_id    // Get managers for specific center
PATCH  /managers/:manager_id          // Update manager
PATCH  /managers/:manager_id/status   // Update manager status
DELETE /managers/:manager_id          // Delete manager
```

## 🚀 How to Create a Manager

### Backend

```javascript
// Admin creates a manager
POST /api/managers
{
  "user_id": 5,              // ID of user with role 'manager'
  "center_id": 1,            // Which center
  "manager_role": "center_manager",
  "department": "Main Branch",
  "phone": "+1234567890",
  "bio": "Experienced center manager"
}
```

### Frontend

1. Create user with role 'manager' first (via User endpoints or admin panel)
2. Create Manager profile for that user
3. User will see Manager Dashboard when they login

## 💡 Why Separate Manager Entity?

**Benefits of separate Manager entity vs. using permission levels in Admin:**

1. ✅ **Clear separation of concerns**
   - Admins manage the platform
   - Managers manage centers
   - Different schemas for different needs

2. ✅ **Scalability**
   - Add manager-specific fields without Admin bloat
   - center_id, trainers_count, sessions_count, etc.

3. ✅ **Simpler permissions**
   - One permission level for managers (manager_role)
   - One permission level for admins (permission_level)
   - No confusion

4. ✅ **Future-proof**
   - Easy to add center features (budgets, performance metrics, etc.)
   - Easy to track manager-specific activity

## 📁 File Structure

```
src/
├── managers/
│   ├── entities/
│   │   └── manager.entity.ts         // Manager entity with enums
│   ├── dto/
│   │   └── manager.dto.ts            // DTOs for validation
│   ├── manager.controller.ts          // API endpoints
│   ├── manager.service.ts             // Business logic
│   └── manager.module.ts              // Module config
├── admin/
│   └── ... (existing admin module)
└── app.module.ts                      // ManagerModule added to imports
```

## 🔐 Security Model

**Access Control**:

- Managers can only be created/managed by **admins** (`@Roles('admin')`)
- Managers can view their own center data
- Admins have full access

**JWT Protection**:

- All manager endpoints require valid JWT token
- Role-based guards ensure only admins can manage managers
- User must have role 'manager' and valid manager profile

## 📝 Next Steps

1. **Verify compilation**: Run `npm run start:dev`
2. **Create frontend pages**: Enhanced ManagerDashboard with full trainer/session management
3. **Add center management**: Create Center entity if needed
4. **Add relationships**: Link trainers to centers via managers
5. **Track activity**: Implement audit logging for manager actions

## Summary

Your system now has three distinct dashboard roles:

| Role        | Purpose                                   | Entity           |
| ----------- | ----------------------------------------- | ---------------- |
| **Client**  | Book and manage sessions                  | None (User only) |
| **Trainer** | Create sessions and manage bookings       | Trainer          |
| **Manager** | Manage trainers and sessions for a center | Manager ✨ NEW   |
| **Admin**   | Manage entire platform                    | Admin            |

The **Manager entity** is specifically optimized for managing centers/branches with trainers and sessions, completely separate from the Admin entity which manages the entire platform.
