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

-- Insert sample membership plans
INSERT INTO "membership_plans" ("name", "description", "classes_included", "duration_days", "price", "benefits", "sort_order")
VALUES 
  ('Flow Starter', 'Perfect for your wellness journey', 4, 30, 1500.00, '["4 classes/month", "Email support", "Flexible scheduling"]', 1),
  ('Flow Plus', 'Enhanced wellness experience', 8, 30, 2800.00, '["8 classes/month", "Priority booking", "Email support", "Flexible scheduling"]', 2),
  ('Flow Unlimited', 'Ultimate wellness freedom', 999, 30, 4500.00, '["Unlimited classes", "Priority booking", "Phone support", "Flexible scheduling", "Guest passes"]', 3)
ON CONFLICT DO NOTHING;