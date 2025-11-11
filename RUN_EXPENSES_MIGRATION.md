# Run Expenses Table Migration

Execute this command to create the expenses table in your production database:

```powershell
$env:DATABASE_URL="postgresql://atara_user:FIcASg3dYt6vKdvWrLuD0qMvwPxIwXgl@dpg-d46a0igdl3ps738t42sg-a.oregon-postgres.render.com/atara"; node create-expenses-table.js
```

This will:
- Create the `expenses` table with all required fields
- Add database indexes for performance
- Insert sample expense data for testing
- Handle connection errors gracefully

After running this migration, the expenses management feature will be fully functional in your application.