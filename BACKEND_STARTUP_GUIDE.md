# Backend Startup Guide

## Current Issue

The frontend is showing **"Error: Request failed 404"** when trying to fetch the trainer dashboard. This happens because the **backend server is not running on port 3000**.

## What We've Fixed

1. ✅ **Fixed dashboard.service.ts** - Changed from `findOne()` to `createQueryBuilder()` to properly query the `user_id` field with `@RelationId` decorator
2. ✅ **Fixed frontend API calls** - Updated `TrainerBookingsPage`, `TrainerSessionsPage`, and `TrainerDashboard` to use the centralized `getJson()` function from `api.ts`
3. ✅ **Exported API functions** - Made `getJson` and `postJson` exportable so trainer pages can use them

## Configuration Status

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:3000  ✅ Correct
```

### Backend (.env)

```
PORT=3000  ✅ Correct
DB_HOST=localhost
DB_PORT=5434
```

## How to Start the Backend

### Option 1: Using npm (Recommended)

1. Open PowerShell or Command Prompt
2. Navigate to the backend folder:
   ```powershell
   cd "c:\Users\user\Desktop\atara\atarabackend"
   ```
3. Make sure Node.js is installed and in PATH:
   ```powershell
   node --version
   ```
4. If node command doesn't work, install Node.js from https://nodejs.org
5. Install dependencies (if needed):
   ```powershell
   npm install
   ```
6. Run the backend in watch mode (auto-reloads on changes):
   ```powershell
   npm run start:dev
   ```

### Option 2: Using pnpm

If you already have pnpm installed:

```powershell
cd "c:\Users\user\Desktop\atara\atarabackend"
pnpm install
pnpm start:dev
```

### Option 3: Using node_modules directly

If npm is not in PATH but node_modules exists:

```powershell
cd "c:\Users\user\Desktop\atara\atarabackend"
.\node_modules\.bin\nest start --watch
```

## Expected Startup Output

When the backend starts successfully, you should see:

```
[Nest] 12345  - 11/04/2025, 1:00:00 PM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 11/04/2025, 1:00:00 PM     LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] 12345  - 11/04/2025, 1:00:00 PM     LOG [RoutesResolver] DashboardController {/dashboard}:
[Nest] 12345  - 11/04/2025, 1:00:00 PM     LOG [RoutesResolver] GET /dashboard/client
[Nest] 12345  - 11/04/2025, 1:00:00 PM     LOG [RoutesResolver] GET /dashboard/trainer
[Nest] 12345  - 11/04/2025, 1:00:00 PM     LOG [NestApplication] Nest application successfully started
```

## Verifying Backend is Running

Open another terminal and run:

```powershell
curl http://localhost:3000/health
```

Or navigate to `http://localhost:3000` in your browser - you should see a response (not 404).

## Troubleshooting

### Error: "Port 3000 is already in use"

Another process is using port 3000. Either:

- Close the other application
- Change the PORT in .env to a different port (e.g., 3001)
- Kill the process: `Get-Process | Where-Object {$_.Name -like "*node*"} | Stop-Process`

### Error: "Cannot find module..."

Run `npm install` to restore dependencies

### Error: "Database connection failed"

Ensure PostgreSQL is running on localhost:5434 with the correct credentials in .env

### Error: "Cannot find nest command"

Node.js is not properly installed. Reinstall from https://nodejs.org

## Running Both Frontend and Backend

You need two terminal windows:

**Terminal 1 - Backend:**

```powershell
cd "c:\Users\user\Desktop\atara\atarabackend"
npm run start:dev
```

**Terminal 2 - Frontend:**

```powershell
cd "c:\Users\user\Desktop\atara\atarabackend\frontend"
npm run dev
```

Then access the frontend at `http://localhost:5173`

## Testing the Fix

Once both are running:

1. Login as a trainer
2. Go to Dashboard or My Sessions
3. The page should load without 404 errors
4. Data should display from the trainer's dashboard
5. New trainers should see empty data (clean slate)

## API Endpoints

These endpoints are now properly configured:

- `GET /dashboard/trainer` - Trainer dashboard (requires JWT token with role=trainer)
- `GET /dashboard/client` - Client dashboard (requires JWT token with role=client)
- `GET /dashboard/manager` - Manager dashboard
- `GET /dashboard/admin` - Admin dashboard
