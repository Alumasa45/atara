/**
 * FIX: Fix booking_date column mismatch
 */

const { Client } = require('pg');

async function fixBookingDateColumn() {
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

    // Drop the booking_date column and rename date_booked if it exists
    await client.query(`
      DO $$ 
      BEGIN
          -- Make booking_date nullable first
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_date') THEN
              ALTER TABLE "bookings" ALTER COLUMN "booking_date" DROP NOT NULL;
          END IF;
          
          -- Add date_booked column if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'date_booked') THEN
              ALTER TABLE "bookings" ADD COLUMN "date_booked" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          END IF;
          
          -- Update existing records to have date_booked = created_at
          UPDATE "bookings" SET "date_booked" = "created_at" WHERE "date_booked" IS NULL;
          
          -- Drop booking_date column if it exists
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_date') THEN
              ALTER TABLE "bookings" DROP COLUMN "booking_date";
          END IF;
      END $$;
    `);

    console.log('✅ booking_date column fixed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixBookingDateColumn();