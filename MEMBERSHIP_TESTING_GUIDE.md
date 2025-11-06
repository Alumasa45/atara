# 🧪 Quick Test Guide - Membership Interface & React Router Fixes

## Before You Start

- Backend should be running: `npm run start:dev`
- Frontend should be running: `npm run dev`
- You should be logged in as an **admin** user
- Open browser console (F12) to check for warnings

---

## Test 1: Verify React Router Warnings are Gone ✅

### Steps:

1. Open the app in browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. **Expected Result**:
   - ❌ NO warnings about "v7_startTransition"
   - ❌ NO warnings about "v7_relativeSplatPath"
   - ✅ Console should be clean

### What Changed:

```diff
- <BrowserRouter>
+ <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

---

## Test 2: Verify Membership Form Shows by Default ✅

### Steps:

1. Login as **admin**
2. Go to Admin Dashboard: `/dashboard/admin`
3. Click **"Memberships"** button
4. Should redirect to `/admin/memberships`

### Expected Screen:

```
┌─────────────────────────────────────────┐
│ 💳 Membership Plans Management          │
│ Create and manage membership plans      │
├─────────────────────────────────────────┤
│ [← Back to Admin Dashboard]             │
├─────────────────────────────────────────┤
│ 💳 Membership Plans        [⬆️ Collapse] │
├─────────────────────────────────────────┤
│                                         │
│  CREATE MEMBERSHIP FORM (visible!)      │
│  ┌───────────────────────────────────┐ │
│  │ Plan Name: [_________________]    │ │
│  │ Price (KES): [_________________] │ │
│  │ Classes: [___] Duration: [____]  │ │
│  │ Sort Order: [_]                  │ │
│  │ Description: [________________]  │ │
│  │ Benefits (one per line):         │ │
│  │ [_____________________________]   │ │
│  │ [_____________________________]   │ │
│  │ [Update Plan] [Clear]            │ │
│  └───────────────────────────────────┘ │
│                                         │
│  EXISTING MEMBERSHIPS:                  │
│  ┌─────────────────────────────────┐   │
│  │ Plan 1 Name                     │   │
│  │ Description...                  │   │
│  │ KES 1,500 • 4 classes • 1 mo    │   │
│  │                    [Edit] [Del] │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### What Changed:

```diff
- const [showForm, setShowForm] = useState(false);  // Hidden
+ const [showForm, setShowForm] = useState(true);   // Visible

- {showForm ? 'Cancel' : '+ Add Plan'}
+ {showForm ? '⬆️ Collapse Form' : '➕ Show Form'}
```

---

## Test 3: Create a New Membership Plan ✅

### Steps:

1. **Form should already be visible** (from Test 2)
2. Fill in the form:
   ```
   Plan Name: Premium Weekly
   Price (KES): 2000
   Classes Included: 8
   Duration (Days): 7
   Description: Perfect for intensive training
   Benefits:
     8 classes per week
     Priority booking
     Personal trainer guidance
     Email support
   Sort Order: 2
   ```
3. Click **[Create Plan]** button
4. Should see: "✅ Plan created successfully!"

### Expected Result:

- Form clears
- New plan appears in the list below
- Toast notification shows success message

---

## Test 4: View All Membership Plans ✅

### What You Should See:

- **Seeded Plans** (from database):
  1. Flow Starter - Basic plan
  2. Flow Intermediate - Intermediate plan
  3. Flow Advanced - Advanced plan
- **New Plan** you just created (if you completed Test 3)

### Each Plan Shows:

- Plan name
- Description
- Price in KES
- Number of classes included
- Duration in months
- **[Edit]** button
- **[Delete]** button

---

## Test 5: Edit an Existing Plan ✅

### Steps:

1. Find any membership plan in the list
2. Click **[Edit]** button
3. Form populates with plan details
4. Change something:
   ```
   Old Price: 1500
   New Price: 1800
   ```
5. Click **[Update Plan]** button
6. Should see: "✅ Plan updated successfully!"

### Expected Result:

- Plan information updates in list
- Form clears

---

## Test 6: Delete a Membership Plan ✅

### Steps:

1. Find the plan you created (or any plan)
2. Click **[Delete]** button
3. Confirmation dialog appears: "Are you sure you want to delete this plan?"
4. Click **OK** to confirm
5. Should see: "✅ Plan deleted successfully!"

### Expected Result:

- Plan disappears from list
- Form clears if it was being edited

---

## Test 7: Collapse/Expand Form ✅

### Steps:

1. Form is visible with data
2. Click **[⬆️ Collapse Form]** button
3. Form should hide, only list remains
4. Button changes to **[➕ Show Form]**
5. Click **[➕ Show Form]** button
6. Form shows again

### Expected Result:

- Toggle works smoothly
- List of memberships always visible
- Button label updates

---

## Test 8: Access Control - Non-Admin Test ✅

### Steps:

1. Logout (if logged in as admin)
2. Login as **client** or **trainer**
3. Try to navigate directly to `/admin/memberships`

### Expected Result:

- Should be redirected to home page `/`
- Message: "You do not have permission to view this page"
- Cannot access membership management interface

---

## Test 9: Form Validation ✅

### Steps - Try submitting empty form:

1. Click **[Create Plan]** without filling anything
2. Should see error: "Please fill in all required fields"
3. Fill only some fields and try again
4. Should show same error

### Expected Result:

- Form doesn't submit until all required fields filled
- Toast shows error message

---

## Test 10: Long Benefit List ✅

### Steps:

1. Create a plan with many benefits:
   ```
   Benefit 1
   Benefit 2
   Benefit 3
   Benefit 4
   Benefit 5
   Benefit 6
   ```
2. Submit form
3. View the plan in the list

### Expected Result:

- All benefits stored correctly
- Plan details display properly
- No text overflow or layout issues

---

## 🎯 Troubleshooting

### Issue: Form still not visible

```
Solution:
1. Hard refresh page (Ctrl+F5)
2. Check browser console for errors
3. Verify you're logged in as admin
4. Check that AdminMembershipsManager has showForm: true
```

### Issue: Getting 401 errors on API calls

```
Solution:
1. Check if JWT token in localStorage
2. Verify admin role:
   - Open DevTools → Application → localStorage
   - Check "user" and "token" keys
3. Login again if needed
```

### Issue: Can't find the Memberships page

```
Solution:
1. Admin Dashboard → Memberships button
2. Or navigate directly: /admin/memberships
3. Verify you're logged in as admin
```

### Issue: React Router warnings still showing

```
Solution:
1. Hard refresh browser (Ctrl+F5)
2. Clear browser cache
3. Verify main.tsx has future flags
4. Restart dev server: npm run dev
```

---

## 📊 Success Criteria

✅ All 10 tests pass = **Fully Functional**

| Test                       | Status | Notes                 |
| -------------------------- | ------ | --------------------- |
| 1. No Router warnings      | ✅     | Console clean         |
| 2. Form visible by default | ✅     | Create form shows     |
| 3. Create membership       | ✅     | New plan appears      |
| 4. View all plans          | ✅     | Seeded + new shown    |
| 5. Edit membership         | ✅     | Updates in list       |
| 6. Delete membership       | ✅     | Removed from list     |
| 7. Toggle form             | ✅     | Collapse/expand works |
| 8. Access control          | ✅     | Non-admins blocked    |
| 9. Form validation         | ✅     | Validates all fields  |
| 10. Long benefits          | ✅     | No layout issues      |

---

## 🚀 Performance Tips

- Form submission should be instant (< 1 second)
- Page load should be fast (< 2 seconds)
- No console errors should appear
- Notifications should disappear after 3 seconds

---

## 📞 Need Help?

If something isn't working:

1. Check browser console (F12)
2. Look for red error messages
3. Check backend logs
4. Verify JWT token is valid
5. Try refreshing the page

**Last Updated**: November 6, 2025  
**Version**: 1.0.1  
**Status**: ✅ Ready for Testing
