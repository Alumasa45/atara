# Admin Membership Management Guide

## Creating Membership Plans

Admins can create custom membership plans through the API. This guide shows how to do it.

## Prerequisites

1. Be logged in as an **admin user**
2. Have a valid **JWT token** from your login
3. Backend running at `http://localhost:3000`

## Step 1: Get Your Admin Token

Log in as admin through the UI or API:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d {
    "email": "admin@example.com",
    "password": "your_password"
  }
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

Save the `token` value.

## Step 2: Create a Membership Plan

Use the token to create a new membership plan:

```bash
curl -X POST http://localhost:3000/memberships/admin/plans \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Flow Starter",
    "description": "Perfect for your wellness journey",
    "classes_included": 1,
    "duration_days": 30,
    "price": 1500,
    "benefits": [
      "1 class per month",
      "Email support",
      "Flexible scheduling"
    ],
    "sort_order": 1
  }'
```

### Field Descriptions

| Field              | Type     | Required | Example                        | Description                               |
| ------------------ | -------- | -------- | ------------------------------ | ----------------------------------------- |
| `name`             | string   | ✓        | "Flow Starter"                 | Plan display name                         |
| `description`      | string   | ✓        | "Perfect for beginners"        | Short marketing description               |
| `classes_included` | number   | ✓        | 4                              | Number of classes (use 999 for unlimited) |
| `duration_days`    | number   | ✓        | 30                             | How long subscription lasts in days       |
| `price`            | number   | ✓        | 3500                           | Price in KES                              |
| `benefits`         | string[] | ✓        | ["4 classes/month", "Support"] | Array of benefits                         |
| `sort_order`       | number   | ✗        | 1                              | Display order (default: 1)                |

### Response

Success (200):

```json
{
  "plan_id": 1,
  "name": "Flow Starter",
  "description": "Perfect for your wellness journey",
  "classes_included": 1,
  "duration_days": 30,
  "price": 1500,
  "benefits": "[\"1 class per month\",\"Email support\",\"Flexible scheduling\"]",
  "is_active": true,
  "sort_order": 1,
  "created_at": "2025-11-06T09:00:00Z",
  "updated_at": "2025-11-06T09:00:00Z"
}
```

## Step 3: View Created Plans

Check that your plan was created:

```bash
curl -X GET http://localhost:3000/memberships/plans \
  -H "Content-Type: application/json"
```

The plan should now appear on the Home page in the "💳 Membership Plans" card!

## Example Plans to Create

### Plan 1: Flow Starter

```bash
curl -X POST http://localhost:3000/memberships/admin/plans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Flow Starter",
    "description": "Perfect for your wellness journey",
    "classes_included": 1,
    "duration_days": 30,
    "price": 1500,
    "benefits": ["1 class per month", "Email support", "Flexible scheduling"],
    "sort_order": 1
  }'
```

### Plan 2: Flow Steady

```bash
curl -X POST http://localhost:3000/memberships/admin/plans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Flow Steady",
    "description": "Build momentum with consistent practice",
    "classes_included": 4,
    "duration_days": 30,
    "price": 3500,
    "benefits": ["4 classes per month", "Priority booking", "Email support", "Flexible rescheduling"],
    "sort_order": 2
  }'
```

### Plan 3: Flow Strong

```bash
curl -X POST http://localhost:3000/memberships/admin/plans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Flow Strong",
    "description": "Transform your wellness with dedicated practice",
    "classes_included": 8,
    "duration_days": 30,
    "price": 6500,
    "benefits": ["8 classes per month", "Priority booking", "1 free drop-in class", "Email & phone support"],
    "sort_order": 3
  }'
```

### Plan 4: Flow Unlimited Monthly

```bash
curl -X POST http://localhost:3000/memberships/admin/plans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Flow Unlimited Monthly",
    "description": "Unlimited classes - live your best life",
    "classes_included": 999,
    "duration_days": 30,
    "price": 12000,
    "benefits": ["Unlimited classes", "Priority booking", "Free guest passes (2/month)", "VIP support", "Monthly wellness check-in"],
    "sort_order": 4
  }'
```

### Plan 5: Flow Quarterly

```bash
curl -X POST http://localhost:3000/memberships/admin/plans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Flow Quarterly",
    "description": "Committed to 3 months of wellness",
    "classes_included": 12,
    "duration_days": 90,
    "price": 9000,
    "benefits": ["12 classes per quarter", "20% savings vs monthly", "Priority booking", "1 free workshop"],
    "sort_order": 5
  }'
```

### Plan 6: Flow Commitment

```bash
curl -X POST http://localhost:3000/memberships/admin/plans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Flow Commitment",
    "description": "Six months of transformative wellness",
    "classes_included": 30,
    "duration_days": 180,
    "price": 18000,
    "benefits": ["30 classes over 6 months", "25% savings vs monthly", "Priority booking", "2 free workshops", "Dedicated trainer consultation"],
    "sort_order": 6
  }'
```

## Update a Plan

To modify an existing plan:

```bash
curl -X PUT http://localhost:3000/memberships/admin/plans/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1600,
    "description": "Updated description"
  }'
```

Only include the fields you want to update.

## Delete a Plan

```bash
curl -X DELETE http://localhost:3000/memberships/admin/plans/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## View All User Subscriptions

See all active memberships purchased by users:

```bash
curl -X GET http://localhost:3000/memberships/admin/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing in Postman/Insomnia

1. Get token from login endpoint
2. Add header: `Authorization: Bearer YOUR_TOKEN`
3. POST to `http://localhost:3000/memberships/admin/plans`
4. Use raw JSON body with the plan data

## Next Steps

- Clients will see the plans on the Home page
- Clients can expand the "💳 Membership Plans" card
- Clients can purchase plans by clicking "Buy Now"
- Track all subscriptions via admin endpoints
