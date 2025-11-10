/**
 * FIX: Add missing classes_included column to membership_plans table
 */

const { Client } = require('pg');

async function fixMembershipPlans() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable not set!');
    process.exit(1);
  }

  console.log('🔌 Connecting to database...');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database!');

    // Add all missing columns to membership_plans table
    await client.query(`
      DO $$ 
      BEGIN
          -- Add classes_included column
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'membership_plans' AND column_name = 'classes_included') THEN
              ALTER TABLE "membership_plans" ADD COLUMN "classes_included" integer NOT NULL DEFAULT 0;
          END IF;
          
          -- Add is_active column
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'membership_plans' AND column_name = 'is_active') THEN
              ALTER TABLE "membership_plans" ADD COLUMN "is_active" boolean NOT NULL DEFAULT true;
          END IF;
          
          -- Add sort_order column
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'membership_plans' AND column_name = 'sort_order') THEN
              ALTER TABLE "membership_plans" ADD COLUMN "sort_order" integer NOT NULL DEFAULT 1;
          END IF;
      END $$;
    `);

    console.log('✅ All missing columns added to membership_plans table!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixMembershipPlans();