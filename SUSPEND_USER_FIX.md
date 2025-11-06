# User Suspension Fix - Admin Dashboard

## Problem Identified

When attempting to suspend a user from the admin dashboard, you received a **400 Bad Request** error with message "Failed to update user".

### Root Cause

The mismatch between frontend and backend implementations:

- **Frontend**: Displays and sends a `suspended` status value
- **Backend Entity**: Only supports `active`, `inactive`, and `banned` statuses (no `suspended` enum)
- **API**: Attempted to update user status to an unsupported enum value, causing validation failure

```typescript
// User Entity - Missing 'suspended' status
export enum status {
  active = 'active',
  inactive = 'inactive',
  banned = 'banned', // ← No 'suspended' option
}
```

## Solution Implemented

Since the requirement is to map the "suspend" action to delete functionality, the frontend has been updated to:

### 1. **Redirect Suspend to Delete** (`AdminUsersPage.tsx`)

- When a user's status is changed to "suspended", the system now calls the **DELETE** endpoint instead of PATCH
- Added `handleDeleteUser()` function that:
  - Shows a confirmation dialog
  - Calls `/admin/users/:id` with DELETE method
  - Removes the user from the list upon success

### 2. **Improved UI/UX**

- Status dropdown now shows: `Suspended (Delete User)` to clarify the action
- Added warning message when "Suspended" status is selected
- Button text changes from "Save Changes" to "Delete User" when suspended is selected
- Button color changes from green (#4CAF50) to red (#F44336) to indicate danger

### 3. **Enhanced User Experience**

```
Warning Box (Yellow):
⚠️ Warning:
Setting status to "Suspended" will permanently delete this user
from the system. This action cannot be undone.
```

## Technical Changes

### File Modified: `frontend/src/pages/AdminUsersPage.tsx`

#### New Function: `handleDeleteUser()`

```typescript
const handleDeleteUser = async (userId: number) => {
  if (
    !confirm(
      'Are you sure you want to delete this user? This action cannot be undone.',
    )
  ) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/admin/users/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    if (!response.ok) throw new Error('Failed to delete user');

    setUsers(users.filter((u) => u.user_id !== userId));
    setShowEditForm(false);
    setEditingUser(null);
  } catch (err: any) {
    setError(err.message);
  }
};
```

#### Updated Function: `handleUpdateUser()`

```typescript
const handleUpdateUser = async () => {
  if (!editingUser) return;

  // If status is suspended, delete the user instead
  if (editingUser.status === 'suspended') {
    return handleDeleteUser(editingUser.user_id);
  }

  // ... rest of update logic for active/inactive
};
```

## API Endpoints Used

### Suspend User (Now Maps to Delete)

```
DELETE /admin/users/:id
Authorization: Bearer {token}

Requires:
- Admin role
- User ID in URL path
- Valid JWT token
```

### Existing Endpoints (Unchanged)

```
PATCH /admin/users/:id
- Updates user role and status (for active/inactive)

PATCH /admin/users/:id/deactivate
- Sets status to 'inactive'

PATCH /admin/users/:id/activate
- Sets status to 'active'

DELETE /admin/users/:id
- Permanently deletes the user (hard delete)
```

## Testing Steps

1. **Navigate to Admin Dashboard** → Users
2. **Click Edit** on any user
3. **Change Status to "Suspended"** from dropdown
4. **Observe warning message** appears
5. **Button changes to "Delete User"** (red color)
6. **Click "Delete User"**
7. **Confirm deletion** in the confirmation dialog
8. **User is removed** from the system and table updates

## Safety Features

✅ **Confirmation Dialog** - Prevents accidental deletion
✅ **Visual Warning** - Yellow warning box clarifies the permanent action
✅ **Button Color Change** - Red indicates danger/destructive action
✅ **Backend Validation** - Admin cannot delete their own account
✅ **Active Bookings Check** - Prevents deletion of users with active bookings

## Backend Validation (Already in Place)

The `/admin/users/:id` DELETE endpoint includes safety checks:

```typescript
async deleteUser(userId: number, adminId: number) {
  // Prevent self-deletion
  if (userId === adminId) {
    throw new BadRequestException('Cannot delete your own account');
  }

  // Check if user has active bookings
  const activeBookings = await this.bookingRepository.count({
    where: { user_id: userId, status: bookingStatus.booked },
  });

  if (activeBookings > 0) {
    throw new BadRequestException('Cannot delete user with active bookings');
  }

  return await this.userRepository.remove(user);
}
```

## Summary

| Aspect              | Before                                              | After                                          |
| ------------------- | --------------------------------------------------- | ---------------------------------------------- |
| **Suspend Action**  | Tried to set invalid `suspended` status → 400 Error | Calls DELETE endpoint → User removed           |
| **UI Clarity**      | Generic "Suspended" option                          | "Suspended (Delete User)" with warning         |
| **Confirmation**    | None                                                | Confirmation dialog + warning message          |
| **Button Feedback** | Fixed green button                                  | Dynamic red button when deleting               |
| **Safety**          | N/A                                                 | Prevents self-deletion, checks active bookings |

## Status

✅ **FIXED** - Admin can now successfully suspend (delete) users from the admin dashboard without errors.
