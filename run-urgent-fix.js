/**
 * URGENT FIX: Run this to create missing session_groups table
 * Usage: node run-urgent-fix.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runUrgentFix() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable not set!');
    console.log('\n📝 Set your DATABASE_URL and run:');
    console.log('$env:DATABASE_URL="your-database-url"; node run-urgent-fix.js');
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

    // Read and execute the SQL fix
    const sqlPath = path.join(__dirname, 'URGENT_FIX_MISSING_TABLES.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔧 Running urgent fix...');
    await client.query(sql);

    console.log('✅ URGENT FIX COMPLETED!');
    console.log('\n🎉 The session_groups table has been created!');
    console.log('🎉 The bookings table has been updated!');
    console.log('\n📝 Your booking API should now work correctly.');
    console.log('📝 Restart your application to test.');

  } catch (error) {
    console.error('❌ Error running urgent fix:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runUrgentFix();