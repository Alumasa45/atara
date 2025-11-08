/**
 * FIX: Add missing date_booked column to bookings table
 */

const { Client } = require('pg');

async function fixDateBookedColumn() {
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

    // Add date_booked column if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'date_booked') THEN
              ALTER TABLE "bookings" ADD COLUMN "date_booked" DATE;
          END IF;
      END $$;
    `);

    console.log('✅ date_booked column added to bookings table!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixDateBookedColumn();