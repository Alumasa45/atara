# Manager Dashboard - Complete Implementation Plan

## Overview

Create a comprehensive Manager Dashboard with full user administration, booking management, schedule viewing, trainer oversight, and analytics capabilities.

---

## 📋 Requirements Breakdown

### 1. Manager Dashboard Features

- [x] Full access to user administration
- [x] View all bookings
- [x] View schedules and sessions
- [x] View all trainers
- [x] Display user loyalty points in user management
- [ ] Line graphs for system analysis
- [ ] Bar graphs for user intake
- [ ] Monthly automated analysis with dashboard cards

### 2. Backend Endpoints Available

Already exist in admin service:

- `GET /admin/users` - Get all users with pagination
- `GET /admin/users/:id` - Get single user
- `PATCH /admin/users/:id` - Update user
- `GET /admin/trainers` - Get all trainers
- `GET /admin/bookings` - Get all bookings
- `GET /admin/sessions` - Get all sessions
- `GET /admin/schedules` - Get all schedules
- `PATCH /admin/bookings/:id/status` - Update booking status
- `GET /admin/stats` - Get admin statistics

### 3. Navigation Requirements

- Manager Dashboard accessible at `/dashboard/manager`
- Manager Dashboard accessible as default for manager role
- Memberships card should navigate to memberships page

---

## 🏗️ Implementation Strategy

### Phase 1: Manager Dashboard Core Structure

**Files to Create/Modify:**

1. `frontend/src/pages/ManagerDashboard.tsx` - Main dashboard component
2. `frontend/src/components/ManagerUserManagement.tsx` - User admin interface
3. `frontend/src/components/ManagerBookings.tsx` - Bookings viewer
4. `frontend/src/components/ManagerSchedules.tsx` - Schedules viewer
5. `frontend/src/components/ManagerSessions.tsx` - Sessions viewer
6. `frontend/src/components/ManagerTrainers.tsx` - Trainers viewer
7. `frontend/src/components/ManagerAnalytics.tsx` - Analytics charts

### Phase 2: Analytics & Charts

**Files to Create:**

1. `frontend/src/components/AnalyticsCharts.tsx` - Recharts implementation
2. `frontend/src/components/MonthlyAnalysisCard.tsx` - Monthly summary

### Phase 3: API Integration

**Backend Enhancements:**

1. Create new endpoint: `GET /admin/stats/monthly` - Monthly analysis data
2. Create new endpoint: `GET /admin/stats/user-intake` - User registration trends
3. Ensure manager role can access all endpoints (roles verification)

### Phase 4: Navigation & Routing

**Updates:**

1. Fix memberships card navigation in AdminDashboard
2. Ensure manager role routes to ManagerDashboard

---

## 📁 File Structure

```
frontend/src/
├── pages/
│   ├── ManagerDashboard.tsx (MAIN - orchestrates all sections)
│   └── (update AdminDashboard.tsx for memberships navigation)
├── components/
│   ├── ManagerUserManagement.tsx
│   ├── ManagerBookings.tsx
│   ├── ManagerSchedules.tsx
│   ├── ManagerSessions.tsx
│   ├── ManagerTrainers.tsx
│   ├── ManagerAnalytics.tsx
│   ├── AnalyticsCharts.tsx
│   └── MonthlyAnalysisCard.tsx
└── api.ts (add new helper functions if needed)
```

---

## 🔑 Key Technical Decisions

### 1. Chart Library

**Decision:** Recharts (or implement with Canvas/SVG)

- Lightweight alternative to Chart.js (not in dependencies)
- Can be installed: `npm install recharts`
- React-native compatible
- Built for React

### 2. Data Structure for Analytics

```typescript
interface MonthlyAnalysis {
  month: string;
  year: number;
  totalUsers: number;
  newUsers: number;
  activeBookings: number;
  completedSessions: number;
  totalLoyaltyPointsAwarded: number;
  averageBookingPerUser: number;
  topTrainer: string;
  systemHealthScore: number; // 0-100
}
```

### 3. User Intake Data Structure

```typescript
interface UserIntake {
  date: string;
  newUsers: number;
  role: 'client' | 'trainer' | 'manager';
}
```

### 4. Manager Role Permissions

Manager should have same access as Admin for:

- User viewing/management
- Booking management
- Schedule/session/trainer viewing

---

## 📊 Analytics Implementation

### Line Graph (System Analysis Over Time)

```
X-axis: Days/Weeks in month
Y-axis: Metrics (active bookings, completed sessions, users online)
Multiple lines: Bookings, Sessions, Users
```

### Bar Graph (User Intake)

```
X-axis: Days in current month
Y-axis: Number of new users
Single bar series for new registrations
```

### Monthly Analysis Card (End of Month)

```
Card appears on top of dashboard when month is complete
Shows:
- Total new users
- Average session completion rate
- Most popular trainer
- Peak booking time
- Total loyalty points awarded
- System uptime/health score
- Recommendations for improvement
```

---

## 🔄 Data Flow

### On Manager Dashboard Load:

```
1. Verify manager role (redirect if not)
2. Fetch /admin/stats → Dashboard summary cards
3. Fetch /admin/users → User list (paginated)
4. Fetch /admin/bookings → Booking list
5. Fetch /admin/sessions → Session list
6. Fetch /admin/schedules → Schedule list
7. Fetch /admin/trainers → Trainer list
8. Fetch /admin/stats/monthly (new endpoint) → Analytics data
9. Calculate monthly analysis if applicable
10. Render all components
```

### User Management Interactions:

```
Click user → Show details with loyalty points
Update user → PATCH /admin/users/:id
Delete user → DELETE /admin/users/:id (if available)
```

### Booking/Session Interactions:

```
View booking → Show details
Change booking status → PATCH /admin/bookings/:id/status
View session details → GET /admin/sessions/:id
```

---

## 🎯 Implementation Steps

### Step 1: Install Recharts

```bash
npm install recharts
```

### Step 2: Create Base Manager Dashboard Component

- Use similar structure to AdminDashboard
- Add tabs/sections for different views
- Implement role verification

### Step 3: Create User Management Component

- Fetch users list with pagination
- Display loyalty points
- Allow user role/status updates

### Step 4: Create Bookings Component

- Show all bookings with status
- Allow status updates
- Filter by date/trainer/user

### Step 5: Create Schedule/Sessions/Trainers Components

- Simple viewers with lists
- Pagination support
- Search/filter capabilities

### Step 6: Create Analytics Components

- Line graph for system metrics
- Bar graph for user intake
- Monthly analysis card

### Step 7: Backend Enhancement (if needed)

- Add GET /admin/stats/monthly endpoint
- Add GET /admin/stats/user-intake endpoint
- Ensure manager role access

### Step 8: Update Admin Dashboard

- Fix memberships card to navigate to memberships page
- Ensure navigation works correctly

---

## 🔐 Security Considerations

### Role-Based Access:

- Manager can access all manager dashboard endpoints
- Manager cannot delete users (only deactivate)
- Manager cannot modify trainer credentials
- Manager can view but not export user PII without additional authorization

### API Calls:

- All requests must include JWT token
- Backend verifies manager role
- Implement rate limiting for user actions

---

## ✅ Success Criteria

1. ✅ Manager Dashboard loads with all components
2. ✅ User management shows loyalty points
3. ✅ Can view and manage bookings
4. ✅ Can view schedules, sessions, trainers
5. ✅ Analytics charts display correctly
6. ✅ Monthly analysis cards appear
7. ✅ All API calls return data
8. ✅ No console errors
9. ✅ Memberships card navigates correctly
10. ✅ Role verification prevents unauthorized access

---

## 📝 Testing Checklist

- [ ] Login as manager
- [ ] Dashboard loads without errors
- [ ] View users - see loyalty points
- [ ] Update user role/status
- [ ] View all bookings
- [ ] Change booking status
- [ ] View schedules/sessions/trainers
- [ ] Analytics charts render
- [ ] Monthly analysis appears
- [ ] Memberships card works
- [ ] Navigation persists
- [ ] All API calls succeed

---

## 🚀 Deployment Ready

Once complete, manager dashboard will be production-ready with:

- Full system management capabilities
- Real-time analytics
- User loyalty tracking
- Automated monthly analysis
- Professional UI/UX
