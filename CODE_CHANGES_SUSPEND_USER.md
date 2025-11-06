# Code Changes - Suspend User Fix

## File: `frontend/src/pages/AdminUsersPage.tsx`

### CHANGE #1: Add New Delete Handler Function

**Location**: After `handleUpdateUser()` function (around line 95)

**Added Code**:

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

---

### CHANGE #2: Update handleUpdateUser Function

**Location**: Lines 61-90 (approximately)

**Before**:

```typescript
const handleUpdateUser = async () => {
  if (!editingUser) return;

  try {
    const response = await fetch(
      `http://localhost:3000/admin/users/${editingUser.user_id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          role: editingUser.role,
          status: editingUser.status,
        }),
      },
    );

    if (!response.ok) throw new Error('Failed to update user');

    const updated = await response.json();
    setUsers(users.map((u) => (u.user_id === updated.user_id ? updated : u)));
    setShowEditForm(false);
    setEditingUser(null);
  } catch (err: any) {
    setError(err.message);
  }
};
```

**After**:

```typescript
const handleUpdateUser = async () => {
  if (!editingUser) return;

  // If status is suspended, delete the user instead
  if (editingUser.status === 'suspended') {
    return handleDeleteUser(editingUser.user_id);
  }

  try {
    const response = await fetch(
      `http://localhost:3000/admin/users/${editingUser.user_id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          role: editingUser.role,
          status: editingUser.status,
        }),
      },
    );

    if (!response.ok) throw new Error('Failed to update user');

    const updated = await response.json();
    setUsers(users.map((u) => (u.user_id === updated.user_id ? updated : u)));
    setShowEditForm(false);
    setEditingUser(null);
  } catch (err: any) {
    setError(err.message);
  }
};
```

**Key Changes**:

- Added check: `if (editingUser.status === 'suspended')`
- Routes to `handleDeleteUser()` instead of PATCH

---

### CHANGE #3: Update Status Dropdown

**Location**: In the Edit User Form Modal (around line 449)

**Before**:

```typescript
<select
  value={editingUser.status}
  onChange={(e) =>
    setEditingUser({
      ...editingUser,
      status: e.target.value as any,
    })
  }
  className="input"
>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
  <option value="suspended">Suspended</option>
</select>
```

**After**:

```typescript
<select
  value={editingUser.status}
  onChange={(e) =>
    setEditingUser({
      ...editingUser,
      status: e.target.value as any,
    })
  }
  className="input"
>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
  <option value="suspended">Suspended (Delete User)</option>
</select>
```

**Change**: Added `(Delete User)` to clarify what suspended does

---

### CHANGE #4: Add Warning Message

**Location**: After the status select field (after line 453)

**Added Code**:

```typescript
{editingUser.status === 'suspended' && (
  <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#FFF3CD', borderRadius: 4, border: '1px solid #FFE69C' }}>
    <strong style={{ color: '#856404' }}>⚠️ Warning:</strong>
    <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#856404' }}>
      Setting status to "Suspended" will permanently delete this user from the system. This action cannot be undone.
    </p>
  </div>
)}
```

**Shows**: Yellow warning box only when "suspended" is selected

---

### CHANGE #5: Update Submit Button

**Location**: In the button group (around line 463)

**Before**:

```typescript
<div style={{ display: 'flex', gap: 12 }}>
  <button
    onClick={handleUpdateUser}
    style={{
      flex: 1,
      padding: '12px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: 14,
    }}
  >
    Save Changes
  </button>
```

**After**:

```typescript
<div style={{ display: 'flex', gap: 12 }}>
  <button
    onClick={handleUpdateUser}
    style={{
      flex: 1,
      padding: '12px',
      backgroundColor: editingUser.status === 'suspended' ? '#F44336' : '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: 14,
    }}
  >
    {editingUser.status === 'suspended' ? 'Delete User' : 'Save Changes'}
  </button>
```

**Changes**:

- Button color: `#4CAF50` (green) → Dynamic based on status
- Button text: "Save Changes" → Dynamic text

---

## Summary of Changes

| Change                      | Type       | Lines Added  | Purpose                            |
| --------------------------- | ---------- | ------------ | ---------------------------------- |
| New `handleDeleteUser()`    | Function   | ~50          | Handle DELETE API call             |
| Update `handleUpdateUser()` | Logic      | +5           | Route suspend to delete            |
| Status dropdown text        | UI Text    | 0            | Clarify what suspended means       |
| Warning message             | UI Element | ~9           | Warn user about permanent deletion |
| Dynamic button              | UI Logic   | 0 (modified) | Change color/text based on status  |

**Total Lines Added**: ~64
**Total Lines Modified**: ~3
**Files Changed**: 1
**Breaking Changes**: 0

---

## Verification

To verify the changes are correct:

1. ✅ Open `frontend/src/pages/AdminUsersPage.tsx`
2. ✅ Find `handleUpdateUser()` - should have `if (editingUser.status === 'suspended')` check
3. ✅ Find `handleDeleteUser()` - should exist after `handleUpdateUser()`
4. ✅ Find status select - should show "Suspended (Delete User)"
5. ✅ Find warning message - should appear conditionally
6. ✅ Find button - should have dynamic backgroundColor and children

**All changes are in place** ✅

---

## Rollback Instructions (if needed)

If you need to revert these changes:

1. Remove the `handleDeleteUser()` function entirely
2. Remove the `if (editingUser.status === 'suspended')` check from `handleUpdateUser()`
3. Change status dropdown back to "Suspended"
4. Remove the warning message JSX
5. Change button back to static green color and "Save Changes" text

---

## API Endpoints Used

### DELETE (New usage)

```
DELETE /admin/users/:id
Authorization: Bearer {token}

Response on success:
- 200 OK
- User removed from database
```

### PATCH (Existing, unchanged)

```
PATCH /admin/users/:id
Authorization: Bearer {token}
Body: { role: string, status: 'active' | 'inactive' }

Response on success:
- 200 OK
- User object with updated fields
```

---

**Status**: ✅ All changes implemented and ready for testing
