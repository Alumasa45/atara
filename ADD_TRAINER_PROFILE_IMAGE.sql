-- Add profile_image column to trainers table
-- Run this SQL command on your database:
ALTER TABLE trainers ADD COLUMN profile_image VARCHAR(255);

-- Verify the column was added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'trainers' AND column_name = 'profile_image';