-- Create membership_plans table
CREATE TABLE IF NOT EXISTS "membership_plans" (
  "plan_id" SERIAL NOT NULL,
  "name" character varying(50) NOT NULL,
  "description" character varying(255) NOT NULL,
  "classes_included" integer NOT NULL,
  "duration_days" integer NOT NULL,
  "price" numeric(10,2) NOT NULL,
  "benefits" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_membership_plans" PRIMARY KEY ("plan_id")
);

-- Create membership_subscriptions table
CREATE TABLE IF NOT EXISTS "membership_subscriptions" (
  "subscription_id" SERIAL NOT NULL,
  "user_id" integer NOT NULL,
  "plan_id" integer NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "classes_remaining" integer NOT NULL,
  "status" character varying(20) NOT NULL DEFAULT 'active',
  "payment_reference" character varying(255),
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_membership_subscriptions" PRIMARY KEY ("subscription_id"),
  CONSTRAINT "FK_membership_subscriptions_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE,
  CONSTRAINT "FK_membership_subscriptions_plan" FOREIGN KEY ("plan_id") REFERENCES "membership_plans"("plan_id") ON DELETE RESTRICT
);

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

-- Create schedule_time_slots table
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

-- Add missing columns to bookings table
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "time_slot_id" integer;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "group_id" integer;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "guest_name" character varying(100);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "guest_email" character varying(100);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "guest_phone" character varying(15);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "payment_reference" character varying(100);

-- Add foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_bookings_time_slot') THEN
        ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_time_slot" FOREIGN KEY ("time_slot_id") REFERENCES "schedule_time_slots"("slot_id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_bookings_group') THEN
        ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_group" FOREIGN KEY ("group_id") REFERENCES "session_groups"("id") ON DELETE SET NULL;
    END IF;
END $$;

-- Insert sample membership plans
INSERT INTO "membership_plans" ("name", "description", "classes_included", "duration_days", "price", "benefits", "sort_order")
VALUES 
  ('Flow Starter', 'Perfect for your wellness journey', 4, 30, 1500.00, '["4 classes/month", "Email support", "Flexible scheduling"]', 1),
  ('Flow Plus', 'Enhanced wellness experience', 8, 30, 2800.00, '["8 classes/month", "Priority booking", "Email support", "Flexible scheduling"]', 2),
  ('Flow Unlimited', 'Ultimate wellness freedom', 999, 30, 4500.00, '["Unlimited classes", "Priority booking", "Phone support", "Flexible scheduling", "Guest passes"]', 3)
ON CONFLICT DO NOTHING;