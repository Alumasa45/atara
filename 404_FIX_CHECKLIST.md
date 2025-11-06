# 404 Error Resolution Checklist

## ✅ What Has Been Fixed (Code Changes Complete)

- [x] Backend: Fixed dashboard.service.ts query builder for `@RelationId` fields
- [x] Frontend: Exported getJson and postJson from api.ts
- [x] Frontend: Updated TrainerBookingsPage to use centralized API
- [x] Frontend: Updated TrainerSessionsPage to use centralized API
- [x] Frontend: Updated TrainerDashboard to use centralized API
- [x] Frontend configuration is correct (VITE_API_BASE_URL set)
- [x] Backend configuration is correct (PORT=3000)

## ⚠️ What Still Needs To Be Done (Server Status)

- [ ] **CRITICAL**: Start the backend server
  - Option 1 (Recommended): `npm run start:dev`
  - Option 2: `pnpm start:dev`
  - Option 3: `.\node_modules\.bin\nest start --watch`
- [ ] Verify backend is running (should see messages about routes)
- [ ] Check that PostgreSQL is running on localhost:5434
- [ ] Reload frontend in browser after backend starts

## Quick Start (Copy & Paste)

### Terminal 1 - Backend Server

```powershell
cd "c:\Users\user\Desktop\atara\atarabackend"
npm run start:dev
```

### Terminal 2 - Frontend (if not already running)

```powershell
cd "c:\Users\user\Desktop\atara\atarabackend\frontend"
npm run dev
```

Then open http://localhost:5173

## Verification Steps

Once backend is running, you'll see:

1. ✅ No more 404 errors
2. ✅ Trainer dashboard page loads
3. ✅ Data displays correctly
4. ✅ Browser Network tab shows successful requests to http://localhost:3000/dashboard/trainer

## Error Codes & What They Mean

| Status           | Meaning                           | Solution                               |
| ---------------- | --------------------------------- | -------------------------------------- |
| 404 Not Found    | Backend not running or wrong port | Start backend with `npm run start:dev` |
| 403 Forbidden    | User doesn't have trainer role    | Login with a trainer account           |
| 401 Unauthorized | No/invalid token                  | Login first                            |
| 500 Server Error | Backend error                     | Check backend console for details      |

## Common Issues

**Q: Still getting 404?**
A: Backend is not running. Check terminal for startup messages.

**Q: Getting 403 Forbidden?**
A: Logged in as wrong role. Use a trainer account.

**Q: Getting 500 error?**
A: Backend crashed. Check the backend terminal for error messages.

**Q: "Cannot find module" error on backend?**
A: Run `npm install` to restore dependencies.

**Q: "Port 3000 already in use"?**
A: Kill existing process or change PORT in .env

## Files Modified

1. `src/dashboards/dashboard.service.ts` - Query builder fix
2. `frontend/src/api.ts` - Export getJson and postJson
3. `frontend/src/pages/TrainerBookingsPage.tsx` - Use getJson
4. `frontend/src/pages/TrainerSessionsPage.tsx` - Use getJson
5. `frontend/src/pages/TrainerDashboard.tsx` - Use getJson

All changes are backward compatible and don't break existing functionality.

## Support

For detailed information, see:

- `BACKEND_STARTUP_GUIDE.md` - How to start the backend
- `API_FIX_DOCUMENTATION.md` - Technical details of what was fixed
