-- Create session_groups table
CREATE TABLE IF NOT EXISTS "session_groups" (
  "id" SERIAL NOT NULL,
  "schedule_id" integer NOT NULL,
  "group_number" integer NOT NULL DEFAULT 0,
  "capacity" integer NOT NULL,
  "current_count" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_session_groups" PRIMARY KEY ("id"),
  CONSTRAINT "FK_session_groups_schedule" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE CASCADE
);

-- Create schedule_time_slots table if it doesn't exist
CREATE TABLE IF NOT EXISTS "schedule_time_slots" (
  "slot_id" SERIAL NOT NULL,
  "schedule_id" integer NOT NULL,
  "session_id" integer NOT NULL,
  "start_time" time NOT NULL,
  "end_time" time NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_schedule_time_slots" PRIMARY KEY ("slot_id"),
  CONSTRAINT "FK_schedule_time_slots_schedule" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE CASCADE,
  CONSTRAINT "FK_schedule_time_slots_session" FOREIGN KEY ("session_id") REFERENCES "sessions"("session_id") ON DELETE RESTRICT
);

-- Update bookings table to include new columns if they don't exist
DO $$ 
BEGIN
    -- Add time_slot_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'time_slot_id') THEN
        ALTER TABLE "bookings" ADD COLUMN "time_slot_id" integer;
        ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_time_slot" FOREIGN KEY ("time_slot_id") REFERENCES "schedule_time_slots"("slot_id") ON DELETE CASCADE;
    END IF;
    
    -- Add group_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'group_id') THEN
        ALTER TABLE "bookings" ADD COLUMN "group_id" integer;
        ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_group" FOREIGN KEY ("group_id") REFERENCES "session_groups"("id") ON DELETE SET NULL;
    END IF;
    
    -- Add guest columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'guest_name') THEN
        ALTER TABLE "bookings" ADD COLUMN "guest_name" character varying(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'guest_email') THEN
        ALTER TABLE "bookings" ADD COLUMN "guest_email" character varying(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'guest_phone') THEN
        ALTER TABLE "bookings" ADD COLUMN "guest_phone" character varying(15);
    END IF;
    
    -- Add payment_reference column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_reference') THEN
        ALTER TABLE "bookings" ADD COLUMN "payment_reference" character varying(100);
    END IF;
END $$;