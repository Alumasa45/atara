# Membership System Setup Guide

## Overview

The membership system has been implemented with a **minimal backend** that allows **admins to create membership plans**. The system includes:

- Backend entities, DTOs, and services
- API endpoints for admin plan management, client purchases, and subscription tracking
- Frontend MembershipCard component with real API integration
- Database migrations (no pre-seeded data - admins create plans)

## Quick Setup

### 1. Run Database Migrations

Execute the TypeORM migrations to create the membership tables:

```bash
cd backend
pnpm run migration:run
```

This creates:

- `membership_plans` table (stores plan definitions)
- `membership_subscriptions` table (stores user purchases)

### 2. Restart Backend

```bash
pnpm run start:dev
```

### 3. Create Membership Plans via Admin API

Admins can now create membership plans using the API:

```bash
curl -X POST http://localhost:3000/memberships/admin/plans \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "name": "Flow Starter",
    "description": "Perfect for your wellness journey",
    "classes_included": 1,
    "duration_days": 30,
    "price": 1500,
    "benefits": ["1 class per month", "Email support", "Flexible scheduling"],
    "sort_order": 1
  }
```

### 4. Verify Plans are Showing

1. Go to Home page
2. Expand "💳 Membership Plans" card
3. Plans created by admin will appear and be purchasable by clients

## API Endpoints

### Public (No Auth)

- `GET /memberships/plans` - List all active membership plans
- `GET /memberships/plans/:id` - Get specific plan details

### Authenticated Clients

- `POST /memberships/purchase` - Purchase a membership
  ```json
  {
    "plan_id": 1,
    "payment_reference": "MPESA_REF_123456"
  }
  ```
- `GET /memberships/my-subscriptions` - View all user subscriptions
- `GET /memberships/my-active` - Get currently active subscription

### Admin Only

- `POST /memberships/admin/plans` - **Create new plan** (main endpoint)
  ```json
  {
    "name": "Plan Name",
    "description": "Plan description",
    "classes_included": 4,
    "duration_days": 30,
    "price": 3500,
    "benefits": ["benefit 1", "benefit 2"],
    "sort_order": 1
  }
  ```
- `PUT /memberships/admin/plans/:id` - Update existing plan
- `DELETE /memberships/admin/plans/:id` - Delete plan
- `GET /memberships/admin/subscriptions` - View all subscriptions
- `GET /memberships/admin/subscriptions/:id` - Get specific subscription

## Frontend Integration

The `MembershipCard` component on the Home page automatically:

1. Fetches plans from `/memberships/plans` when expanded
2. Shows expandable list of all active plans
3. Allows clicking to see plan details
4. Has "Buy Now" button that calls `/memberships/purchase`
5. Shows loading states and error handling

### Usage in Components

```tsx
import MembershipCard from '../components/MembershipCard';

export default function MyPage() {
  return <MembershipCard />;
}
```

## Features

✅ **Automatic Date Calculations**

- Subscription `end_date` calculated from `start_date + duration_days`

✅ **Class Tracking**

- `classes_remaining` field tracks how many classes user has left
- Auto-updates to `status: 'expired'` when classes reach 0

✅ **JSON Benefits Storage**

- Benefits stored as JSON array, flexible for future additions
- Example: `["Unlimited classes", "Priority booking", "Free workshops"]`

✅ **Status Lifecycle**

- `active` - User can book classes
- `expired` - No classes left or end_date passed
- `cancelled` - Admin cancelled subscription

## Data Model

### MembershipPlan Entity

```typescript
{
  plan_id: number(PK);
  name: string; // "Flow Starter", "Flow Steady", etc.
  description: string; // Descriptive text
  price: decimal; // Plan price in KES
  duration_days: number; // How many days subscription lasts
  classes_included: number; // Number of classes (999 = unlimited)
  benefits: string(JSON); // Benefits array as JSON string
  sort_order: number; // Display order
  is_active: boolean; // Can be purchased
  created_at: timestamp;
  updated_at: timestamp;
}
```

### MembershipSubscription Entity

```typescript
{
  subscription_id: number (PK)
  user_id: number (FK)
  plan_id: number (FK)
  start_date: date
  end_date: date
  classes_remaining: number
  status: enum ('active', 'expired', 'cancelled')
  payment_reference: string // Payment gateway reference
  created_at: timestamp
  updated_at: timestamp
}
```

## Testing

### Test Purchase Flow

1. Go to Home page
2. Expand "💳 Membership Plans" card
3. Click on a plan (e.g., "Flow Steady")
4. Click "Buy Now"
5. System creates subscription in DB

### Check Active Subscription

1. Log in as client
2. Go to Dashboard
3. Should see membership plan details
4. View remaining classes after each booking

### Admin Management

1. Log in as admin
2. Navigate to memberships admin panel (when created)
3. Can CRUD membership plans
4. Can view all user subscriptions

## Troubleshooting

### "Failed to load membership plans"

- ✅ Check backend is running: `npm run start:dev`
- ✅ Verify `/memberships/plans` endpoint exists
- ✅ Check JWT token is valid (if authenticated)

### Memberships not showing

- ✅ Run migrations: `npm run migration:run`
- ✅ Run seed script: `npm run seed:memberships`
- ✅ Verify database has data: `SELECT * FROM membership_plans;`
- ✅ Hard refresh browser (Ctrl+Shift+R)

### Purchase button not working

- ✅ Verify user is authenticated (should show in profile)
- ✅ Check payment_reference is valid format
- ✅ Check user_id is correctly set from JWT token

## Next Steps

1. **Payment Integration**
   - Implement M-Pesa payment validation
   - Update `purchaseMembership` endpoint to verify payment before creating subscription

2. **Class Deduction**
   - Auto-deduct from `classes_remaining` when booking completes
   - Prevent booking if `classes_remaining = 0`

3. **Admin Dashboard**
   - Create membership management page
   - Show subscription analytics (active users, revenue, etc.)

4. **User Notifications**
   - Email when subscription expires
   - Email when classes are running low
   - Email before end_date to upsell renewal

5. **Membership Upgrades**
   - Allow users to upgrade to higher tier
   - Pro-rate remaining days

## File Locations

- **Entities**: `src/memberships/entities/`
- **DTOs**: `src/memberships/dto/membership.dto.ts`
- **Service**: `src/memberships/memberships.service.ts`
- **Controller**: `src/memberships/memberships.controller.ts`
- **Module**: `src/memberships/memberships.module.ts`
- **Migration**: `src/migrations/1701860000000-CreateMembershipTables.ts`
- **Seed**: `src/seeds/membership-seed.ts`
- **Frontend**: `frontend/src/components/MembershipCard.tsx`
