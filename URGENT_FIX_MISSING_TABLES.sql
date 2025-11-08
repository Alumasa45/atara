-- URGENT FIX: Create missing session_groups table and update bookings
-- This fixes the "relation session_groups does not exist" error

-- 1. Create session_groups table
CREATE TABLE IF NOT EXISTS "session_groups" (
  "id" SERIAL PRIMARY KEY,
  "schedule_id" integer NOT NULL,
  "group_number" integer NOT NULL DEFAULT 0,
  "capacity" integer NOT NULL,
  "current_count" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- 2. Add foreign key constraint to schedules table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_session_groups_schedule') THEN
        ALTER TABLE "session_groups" ADD CONSTRAINT "FK_session_groups_schedule" 
        FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Add unique index on schedule_id + group_number
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_session_groups_schedule_group" 
ON "session_groups" ("schedule_id", "group_number");

-- 4. Add group_id column to bookings table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'group_id') THEN
        ALTER TABLE "bookings" ADD COLUMN "group_id" integer;
    END IF;
END $$;

-- 5. Add foreign key constraint from bookings to session_groups
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_bookings_group') THEN
        ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_group" 
        FOREIGN KEY ("group_id") REFERENCES "session_groups"("id") ON DELETE SET NULL;
    END IF;
END $$;

-- 6. Make user_id nullable in bookings (for guest bookings)
ALTER TABLE "bookings" ALTER COLUMN "user_id" DROP NOT NULL;

-- 7. Add guest booking columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'guest_name') THEN
        ALTER TABLE "bookings" ADD COLUMN "guest_name" character varying(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'guest_email') THEN
        ALTER TABLE "bookings" ADD COLUMN "guest_email" character varying(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'guest_phone') THEN
        ALTER TABLE "bookings" ADD COLUMN "guest_phone" character varying(15);
    END IF;
END $$;

-- 8. Create index for better performance
CREATE INDEX IF NOT EXISTS "idx_bookings_group_id" ON "bookings"("group_id");

-- Verify tables were created
SELECT 'session_groups table created successfully!' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'session_groups');

SELECT 'bookings table updated successfully!' as status
WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'group_id');