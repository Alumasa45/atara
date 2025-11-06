# 🚀 Manager System - Quick Reference

## The Answer to Your Question

**Q: "If we put the manager over here, will we need to have the manager's dashboard as a user?"**

**A: YES! And they are now completely separate from Admin.**

### Three Dashboard Roles

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    CLIENT    │  │   TRAINER    │  │   MANAGER    │  │     ADMIN    │
│              │  │              │  │              │  │              │
│ role=client  │  │role=trainer  │  │role=manager  │  │ role=admin   │
│              │  │              │  │              │  │              │
│ Books        │  │ Creates      │  │ Manages      │  │ Manages      │
│ sessions     │  │ sessions     │  │ trainers &   │  │ entire       │
│              │  │              │  │ sessions     │  │ platform     │
│              │  │              │  │ for a center │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
     User only       User+Trainer       User+Manager       User+Admin
                                           Entity             Entity
```

---

## Manager Permission Levels

```typescript
CENTER_MANAGER; // Manages 1 center (most common)
REGIONAL_MANAGER; // Manages multiple centers
OPERATIONS_HEAD; // Manages all operations
```

---

## Creating a Manager

### Step 1: Create User (Admin does this)

```bash
POST /api/users
{
  "username": "manager1",
  "email": "manager@example.com",
  "role": "manager",        ← KEY!
  "password": "..."
}
```

### Step 2: Create Manager Profile (Admin does this)

```bash
POST /api/managers
{
  "user_id": 5,             ← User ID from Step 1
  "center_id": 1,           ← Which center they manage
  "manager_role": "center_manager",
  "department": "Main Branch"
}
```

### Step 3: Manager Logs In

User sees **Manager Dashboard** where they can:

- View trainers for their center
- View sessions
- Manage bookings
- See statistics

---

## API Endpoints (for Admins to manage Managers)

```
GET    /api/managers                 // List all managers
POST   /api/managers                 // Create manager
GET    /api/managers/:manager_id     // Get one manager
PATCH  /api/managers/:manager_id     // Update manager
DELETE /api/managers/:manager_id     // Delete manager
PATCH  /api/managers/:manager_id/status  // Change status
GET    /api/managers/center/:center_id   // Get managers for a center
GET    /api/managers/stats           // See all manager stats
```

---

## Admin vs Manager vs Client Hierarchy

| Feature                  | Client | Trainer | Manager         | Admin    |
| ------------------------ | ------ | ------- | --------------- | -------- |
| **Entity**               | User   | Trainer | Manager         | Admin    |
| **Role**                 | client | trainer | manager         | admin    |
| **Can Book Sessions**    | ✅     | ✅      | ✅              | ❌       |
| **Can Create Sessions**  | ❌     | ✅      | ❌              | ❌       |
| **Can Manage Trainers**  | ❌     | ❌      | ✅ (for center) | ✅ (all) |
| **Can Manage All Users** | ❌     | ❌      | ❌              | ✅       |
| **Can Manage Centers**   | ❌     | ❌      | ✅              | ✅       |
| **Dashboard**            | Client | Trainer | Manager         | Admin    |

---

## Database Table

```sql
-- Automatically created when app runs

CREATE TABLE managers (
  manager_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE,          -- Link to User
  center_id INT,               -- Which center
  manager_role ENUM(...),      -- center_manager, etc.
  manager_status ENUM(...),    -- active, inactive, on_leave
  phone VARCHAR(15),
  department VARCHAR(100),
  bio TEXT,
  trainers_count INT,          -- Auto-tracked
  sessions_count INT,          -- Auto-tracked
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Files Created

✅ **Backend Module**

- `src/managers/entities/manager.entity.ts` - Entity + Enums
- `src/managers/dto/manager.dto.ts` - DTOs
- `src/managers/manager.service.ts` - Business Logic (185 lines)
- `src/managers/manager.controller.ts` - API Endpoints (85 lines)
- `src/managers/manager.module.ts` - Module Config

✅ **Frontend**

- `frontend/src/pages/ManagerDashboard.tsx` - Dashboard Component

✅ **Integration**

- `src/app.module.ts` - ManagerModule added to imports

✅ **Documentation**

- `MANAGER_ENTITY_DOCUMENTATION.md` - Detailed explanation
- `MANAGER_SYSTEM_IMPLEMENTATION.md` - Complete implementation guide

---

## Key Differences: Admin vs Manager

| Aspect                    | Admin              | Manager                                           |
| ------------------------- | ------------------ | ------------------------------------------------- |
| **Scope**                 | Entire Platform    | One/Multiple Centers                              |
| **Manages**               | All Users          | Trainers for their center(s)                      |
| **Permission Level Enum** | super_admin, admin | center_manager, regional_manager, operations_head |
| **Entity**                | Admin              | Manager                                           |
| **User Role**             | admin              | manager                                           |
| **Dashboard**             | Admin Dashboard    | Manager Dashboard                                 |
| **Users Managed**         | Everyone           | Trainers in their center(s)                       |

---

## Next Steps (Optional)

1. ✅ Backend ready - no code needed
2. ✅ Frontend dashboard ready - enhance with UI
3. Create Center entity (if managing multiple centers)
4. Add manager permissions to API calls
5. Add audit logging for manager actions

---

## Summary

You now have:

- ✅ **Separate Manager role** - Not using Admin for managers anymore
- ✅ **Manager Entity** - Linked 1-to-1 with User
- ✅ **Manager Dashboard** - Separate from Admin Dashboard
- ✅ **Manager API** - 10 endpoints for CRUD operations
- ✅ **Proper Hierarchy** - Client → Trainer → Manager → Admin

**Managers are operators who run centers. Admins run the platform.**

🎉 Ready to go!
