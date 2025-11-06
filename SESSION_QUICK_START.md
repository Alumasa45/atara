# Session Management - Quick Start Guide ⚡

## 🎯 What Was Built

A complete **"Add New Session" feature** where admins and managers can create sessions directly from the AdminSessionsPage interface.

---

## 🚀 Quick Access

### For Admins/Managers:

1. Go to `/admin/sessions`
2. Click **"+ Add New Session"** button
3. Fill out the form
4. Click **"✓ Create Session"**
5. ✅ Session created and appears in table instantly

---

## 📝 Form Fields

```
Category *          → Dropdown (Yoga, Pilates, Strength Training)
Description *       → Text area (descriptive name/info)
Duration *          → Number input (minutes, min 15)
Capacity *          → Number input (participants, min 1)
Price *             → Decimal input (cost per session)
Trainer (Optional)  → Dropdown (select from available trainers)
```

---

## 🔧 Backend Endpoints

### Create Session

```
POST /sessions
Authorization: Bearer {token}
Roles: admin, manager

Body:
{
  "category": "yoga",
  "description": "Morning Flow",
  "duration_minutes": 60,
  "capacity": 15,
  "price": 20.0,
  "trainer_id": 1  // optional
}
```

### Update Session

```
PATCH /sessions/:id
Authorization: Bearer {token}
Roles: admin, manager
```

### Delete Session

```
DELETE /sessions/:id
Authorization: Bearer {token}
Roles: admin, manager
```

---

## ✨ Key Features

✅ **Real-time Updates** - New sessions appear instantly in table  
✅ **Form Validation** - All fields validated with helpful error messages  
✅ **Auto-close** - Form closes automatically after successful creation  
✅ **Trainer Assignment** - Optional trainer dropdown  
✅ **Error Handling** - Clear error messages on failures  
✅ **Success Feedback** - Green success message appears for 2 seconds  
✅ **Manager Support** - Both admin and manager roles can create/edit/delete sessions

---

## 🧪 Test It Now

1. **Login as Admin or Manager**
2. **Navigate to** `/admin/sessions`
3. **Click** "+ Add New Session"
4. **Fill Out**:
   - Category: "Yoga"
   - Description: "Morning Yoga Flow"
   - Duration: 60
   - Capacity: 20
   - Price: 25.00
   - Trainer: Select one (or leave blank)
5. **Click** "✓ Create Session"
6. **Verify**: ✓ Success message + New session in table

---

## 📊 Files Changed

**Backend:**

- `src/sessions/sessions.controller.ts` - Roles updated to include 'manager'

**Frontend:**

- `frontend/src/pages/AdminSessionsPage.tsx` - Added form state, handlers, and UI

---

## ⚠️ Validation Rules

| Field       | Min    | Max | Rule                     |
| ----------- | ------ | --- | ------------------------ |
| Description | 1 char | ∞   | Required, non-empty      |
| Duration    | 15 min | ∞   | Step 15 minutes          |
| Capacity    | 1      | ∞   | Min 1 participant        |
| Price       | 0      | ∞   | No negatives, 2 decimals |
| Category    | -      | -   | Required enum            |
| Trainer     | -      | -   | Optional                 |

---

## 🔒 Security

- ✅ JWT authentication required
- ✅ Role-based access (admin + manager only)
- ✅ Input validation on both frontend and backend
- ✅ No sensitive data leaked in errors

---

## 📞 Troubleshooting

### Form won't submit?

- ❌ Check all required fields are filled
- ❌ Check description is not empty
- ❌ Check duration is at least 15 minutes
- ❌ Check capacity is at least 1

### Trainer dropdown empty?

- ❌ Trainers not fetched yet (wait a moment)
- ❌ No trainers in system (create trainers first)

### Session not appearing in table?

- ❌ Refresh page to see (should appear instantly though)
- ❌ Check for error message
- ❌ Check browser console for network errors

---

## 💡 Pro Tips

1. **Optional Trainer**: Leave trainer blank if no specific trainer needed
2. **Auto-close**: Form closes automatically after 2 seconds on success
3. **Real-time**: No need to refresh page - new session appears instantly
4. **Bulk Create**: You can create multiple sessions quickly by clicking "+ Add New Session" again

---

**Status**: ✅ **LIVE AND READY TO USE**
