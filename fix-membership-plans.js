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

    // Add classes_included column if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'membership_plans' AND column_name = 'classes_included') THEN
              ALTER TABLE "membership_plans" ADD COLUMN "classes_included" integer NOT NULL DEFAULT 0;
          END IF;
      END $$;
    `);

    console.log('✅ classes_included column added to membership_plans table!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixMembershipPlans();