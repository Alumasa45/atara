/**
 * EMERGENCY FIX: Create missing session_groups table
 * Run this with: node fix-session-groups.js
 */

const { Client } = require('pg');

async function createSessionGroupsTable() {
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

    // Check if session_groups table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'session_groups'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log('✅ session_groups table already exists!');
      return;
    }

    console.log('📊 Creating session_groups table...');
    
    // Create session_groups table
    await client.query(`
      CREATE TABLE "session_groups" (
        "id" SERIAL PRIMARY KEY,
        "schedule_id" integer NOT NULL,
        "group_number" integer NOT NULL DEFAULT 0,
        "capacity" integer NOT NULL,
        "current_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // Add foreign key constraint
    await client.query(`
      ALTER TABLE "session_groups" 
      ADD CONSTRAINT "FK_session_groups_schedule" 
      FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE CASCADE;
    `);

    // Add unique index
    await client.query(`
      CREATE UNIQUE INDEX "IDX_session_groups_schedule_group" 
      ON "session_groups" ("schedule_id", "group_number");
    `);

    // Check if bookings table has group_id column
    const hasGroupCol = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'group_id';
    `);

    if (hasGroupCol.rows.length === 0) {
      console.log('📊 Adding group_id column to bookings table...');
      await client.query(`ALTER TABLE "bookings" ADD COLUMN "group_id" integer;`);
      
      await client.query(`
        ALTER TABLE "bookings" 
        ADD CONSTRAINT "FK_bookings_group" 
        FOREIGN KEY ("group_id") REFERENCES "session_groups"("id") ON DELETE SET NULL;
      `);
    }

    // Make user_id nullable in bookings (for guest bookings)
    await client.query(`
      ALTER TABLE "bookings" ALTER COLUMN "user_id" DROP NOT NULL;
    `);

    console.log('✅ session_groups table created successfully!');
    console.log('✅ bookings table updated with group_id column!');
    console.log('✅ Foreign key constraints added!');
    
    console.log('\n🎉 Database is now ready for bookings!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createSessionGroupsTable();