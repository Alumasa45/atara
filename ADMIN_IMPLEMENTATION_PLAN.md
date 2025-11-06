# Admin Dashboard Implementation Plan

## Current Status Assessment

### What Already Exists ✅

1. **Backend:**
   - Dashboard controller with `/dashboard/admin` endpoint
   - Dashboard service with `getAdminDashboard()` method
   - Returns: statistics, user counts, booking status, etc.

2. **Frontend:**
   - AdminDashboard.tsx page (already displays admin stats)
   - Admin sidebar navigation (Home, Dashboard, Schedule, Users, System)
   - App.tsx routing for admin role
   - Conditional rendering in App.tsx for admin

### What Needs to Be Done 🚀

#### Phase 1: Enable Admin to Create Trainers

1. **Create TrainerManagement component**
   - Form to create new trainer (name, specialty, email, phone)
   - List existing trainers
   - Edit/delete trainer options
   - Integration with admin dashboard

2. **Create CreateTrainerDto for backend**
   - Fields: name, specialty, email, phone, bio
   - Validation rules
   - Note: Trainer completes their profile later

3. **Create POST endpoint for admin to create trainer**
   - Route: `POST /trainers/create` (admin only)
   - Body: CreateTrainerDto
   - Creates trainer WITHOUT auto-generating user profile
   - Returns: trainer data with initial credentials

4. **Modify users.service.ts**
   - REMOVE trainer auto-creation logic on user registration
   - Only create trainer when explicitly requested by admin

#### Phase 2: Complete Admin Dashboard Pages

1. **AdminTrainersPage.tsx**
   - List all trainers
   - Create new trainer form
   - Edit trainer profile
   - View trainer stats

2. **AdminUsersPage.tsx**
   - Already exists as UserManagement component
   - List all users by role
   - Create/edit/delete users

3. **AdminSystemPage.tsx**
   - System settings
   - Logs
   - Configuration

#### Phase 3: Trainer Profile Completion Flow

1. **When admin creates trainer:**
   - Generate temporary password
   - Send email with login credentials
   - Trainer logs in
   - TrainerProfilePage loads incomplete profile
   - Trainer completes: bio, profile picture, etc.

2. **TrainerProfilePage.tsx modifications:**
   - Show "Complete your profile" banner if bio is empty
   - Allow editing all trainer fields

## Implementation Details

### Step 1: Remove Trainer Auto-Creation

**File: src/users/users.service.ts**

Remove this block (lines 77-86):

```typescript
// If user is a trainer, create a trainer profile
if (role === 'trainer') {
  try {
    await this.trainersService.create({ ... });
  } catch (e) {
    console.warn('Failed to create trainer profile...', e);
  }
}
```

Only admins/managers can create trainers now.

### Step 2: Create Admin Trainer Creation Endpoint

**New Controller Method: src/trainers/trainers.controller.ts**

```typescript
@Post('create')
@UseGuards(JwtAuthGuard)
async createTrainer(@Req() req: any, @Body() createTrainerDto: CreateTrainerDto) {
  // Only admin or manager can create trainers
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
    throw new ForbiddenException('Only admins and managers can create trainers');
  }

  return await this.trainersService.create(createTrainerDto);
}
```

### Step 3: Frontend - TrainerManagement Component

**New Component: frontend/src/components/TrainerManagement.tsx**

```tsx
- List all trainers in table format
- Create trainer button → opens form
- Form fields:
  - Name (required)
  - Specialty (dropdown: yoga, pilates, strength_training, dance)
  - Email (required)
  - Phone (required)
  - Bio (optional)
  - Status (active/inactive)
- Edit/Delete buttons for each trainer
- Success/error messages
```

### Step 4: Admin Dashboard Integration

**Modify: frontend/src/pages/AdminDashboard.tsx**

Add navigation to trainer management:

- "Trainers" link in admin sidebar
- Or: Add trainer card to admin dashboard with quick action

**New Page: frontend/src/pages/AdminTrainersPage.tsx**

```tsx
- Show all trainers
- Create new trainer form
- Stats: Total trainers, Active trainers
- Quick actions: Edit, Delete, View profile
```

## Implementation Sequence

1. **Remove auto-creation** → Fix users.service.ts
2. **Create POST endpoint** → Add to trainers.controller.ts
3. **Create frontend form** → TrainerManagement component
4. **Create admin page** → AdminTrainersPage.tsx
5. **Add sidebar link** → Update Sidebar.tsx (add Trainers link to admin)
6. **Test the flow** → Admin creates trainer, trainer logs in, completes profile

## Data Flow: Admin Creating Trainer

```
Admin fills form:
- Name: "John Smith"
- Email: "john@example.com"
- Specialty: "yoga"
- Phone: "1234567890"

          ↓

POST /trainers/create (admin auth)

          ↓

Backend:
- Check: user is admin/manager ✅
- Create trainer record
- Generate temporary password
- (Optional) Send email with credentials

          ↓

Response:
{
  "trainer_id": 5,
  "name": "John Smith",
  "specialty": "yoga",
  "email": "john@example.com",
  "phone": "1234567890",
  "bio": "",
  "status": "active",
  "user_id": null (or minimal user)
}

          ↓

Trainer receives email:
- Username/Email: john@example.com
- Temporary Password: [auto-generated]

          ↓

Trainer logs in with credentials

          ↓

Trainer taken to TrainerProfilePage
- Shows incomplete profile banner
- Can edit: bio, profile picture, etc.
- Saves profile

          ↓

Trainer can access dashboard normally
```

## Key Design Decisions

✅ **No auto-created user:** Trainer profile exists, but trainer needs to be given login credentials separately
✅ **Admin controls:** Only admin/manager can create trainers
✅ **Gradual profile completion:** Trainer completes profile on first login
✅ **Email notification:** Admin creates trainer → trainer gets email → trainer logs in
✅ **Clean separation:** Admin dashboard separate from trainer operations

## Files to Modify

1. **src/users/users.service.ts** - Remove auto-creation logic
2. **src/trainers/trainers.controller.ts** - Add POST /create endpoint
3. **frontend/src/pages/AdminDashboard.tsx** - Add trainer section
4. **frontend/src/components/Sidebar.tsx** - Add Trainers link for admin
5. **frontend/src/pages/AdminTrainersPage.tsx** - NEW: Trainer management page
6. **frontend/src/components/TrainerManagement.tsx** - NEW: Trainer form component
7. **frontend/src/pages/TrainerProfilePage.tsx** - Add "complete profile" prompt

## Next Steps

1. Should we proceed with removing auto-creation?
2. Should we also set up automatic email sending when trainer is created?
3. Should temporary password be generated or should trainer set their own?
4. Should we complete this fully before starting on Manager dashboard?
