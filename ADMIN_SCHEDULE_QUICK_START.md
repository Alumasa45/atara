# Admin Schedule Management - Quick Start Guide

## 🚀 Getting Started

### Backend Setup

No additional dependencies needed - uses existing NestJS, TypeORM, and validation libraries.

### Frontend Setup

No additional dependencies needed - uses existing React and routing.

---

## 📍 Accessing the Feature

1. **Log in as admin**
2. **Navigate to:** `/admin/schedules` OR click "Schedules ⏰" in sidebar
3. **You'll see:**
   - Calendar on the left (current month)
   - Create/edit form or schedule list on the right

---

## 🎯 Common Tasks

### Create a New Schedule

1. Click on an **empty date** in the calendar
2. Form appears with date pre-filled
3. Select a **session** from the dropdown
4. Adjust **start time** and **end time** (default 1 hour)
5. (Optional) Set **capacity override** (if different from session)
6. (Optional) Select a **room** (Mat Area or Reformer Studio)
7. Click **"Create Schedule"** button
8. Schedule appears in calendar and list ✅

### Edit an Existing Schedule

1. Scroll to **Recent Schedules** section on the right
2. Find the schedule you want to edit
3. Click **"Edit"** button
4. Modify any fields in the form
5. Click **"Update Schedule"** button ✅

### Delete a Schedule

1. Find the schedule in the **Recent Schedules** section
2. Click **"Delete"** button
3. Confirm deletion
4. Schedule is removed ✅

### View Schedules by Date

1. Click on a **date with schedules** (highlighted in calendar)
2. Sessions for that date expand
3. Shows session name and time
4. Click again to collapse ✅

---

## 📋 Form Fields Explained

| Field             | Required | Notes                              |
| ----------------- | -------- | ---------------------------------- |
| Session           | ✅ Yes   | Dropdown of available sessions     |
| Start Time        | ✅ Yes   | Date + time picker (ISO 8601)      |
| End Time          | ✅ Yes   | Must be after start time           |
| Capacity Override | ❌ No    | Leave blank to use session default |
| Room              | ❌ No    | Mat Area or Reformer Studio        |

---

## ⚠️ Validation Rules

- **Start time must be before end time** - Will show error if not
- **Session must exist** - Can only schedule from available sessions
- **Datetime format** - Uses browser's locale (auto-formatted)
- **Capacity** - Must be positive number if provided
- **Room** - Must be one of the enum values if provided

---

## 🔄 Data Sync

**Automatic:**

- Calendar updates when you create/delete schedules
- List updates when you create/delete/edit schedules
- No page refresh needed
- Changes visible in real-time

**Client View:**

- Clients see schedules on `/schedule` page
- They see them immediately when you create them
- They can book from available schedules

---

## 🆘 Troubleshooting

### "Session not found" Error

**Solution:** Make sure the session exists. Go to Admin → Sessions to create sessions first.

### "Start time must be before end time" Error

**Solution:** Check your start and end times. End time should be later than start time.

### Schedule doesn't appear in calendar

**Solution:** Refresh the page or create another schedule. Changes should appear instantly.

### Can't access /admin/schedules

**Solution:** Make sure you're logged in as an admin. Check your user role in profile.

### Form not accepting input

**Solution:** Refresh the page. Make sure all required fields are filled (Session, Start Time, End Time).

---

## 📱 API Endpoints (For Developers)

```
POST   /admin/schedules        - Create schedule
PUT    /admin/schedules/:id    - Update schedule
DELETE /admin/schedules/:id    - Delete schedule
GET    /admin/schedules        - List schedules
```

All require: `Authorization: Bearer {token}` header

---

## 🎨 UI Layout

```
┌─────────────────────────────────────────────┐
│  Admin Header: Schedule Management          │
├──────────────────────┬──────────────────────┤
│                      │                      │
│  CALENDAR            │  CREATE/EDIT FORM    │
│  (Left Column)       │  OR                  │
│  - Month nav         │  SCHEDULE LIST       │
│  - 7x6 grid          │  (Right Column)      │
│  - Click dates       │  - Recent schedules  │
│  - Expandable        │  - Edit/Delete btns  │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

---

## 💡 Pro Tips

1. **Quick Create:** Click any empty date to instantly start creating
2. **Bulk Viewing:** Click a date with multiple sessions to see all at once
3. **Edit Mode:** Click "Edit" to load schedule into form (easy to modify)
4. **Time Formats:** Times auto-adjust to your browser timezone
5. **Capacity Flexibility:** Use override to offer different sizes on same session
6. **Room Management:** Assign room at schedule time (not just session time)

---

## 📞 Support

For issues or questions:

1. Check validation errors - they explain what's wrong
2. Make sure session exists first
3. Verify date/time logic
4. Check browser console for errors
5. Ensure admin role is assigned

---

## 🎉 You're All Set!

Your admin schedule management system is ready to use. Start creating schedules and watch them appear for your clients to book from!
