# Add Profile Image Column to Database

## Command to Run

```bash
$env:DATABASE_URL="postgresql://atara_user:FIcASg3dYt6vKdvWrLuD0qMvwPxIwXgl@dpg-d46a0igdl3ps738t42sg-a.oregon-postgres.render.com/atara"; node add-profile-image-column.js
```

## What This Does

1. **Connects to production database**
2. **Checks if profile_image column exists**
3. **Adds the column if missing**: `ALTER TABLE trainers ADD COLUMN profile_image VARCHAR(255);`
4. **Verifies the column was added**

## After Running This Command

✅ **Profile image upload will work**  
✅ **Trainers can upload images**  
✅ **Images will display on trainer cards**  
✅ **No more database column errors**

## Files Ready

- ✅ `add-profile-image-column.js` - Database script
- ✅ Trainer entity has `profile_image` field
- ✅ Upload endpoint `/trainers/:id/upload-image` exists
- ✅ Service method saves image URL to database

## Test After Running

```http
POST /trainers/1/upload-image
Authorization: Bearer {trainerToken}
Content-Type: multipart/form-data

[Upload image file]
```

Run the command above to add the database column and enable profile image functionality.