/**
 * EMERGENCY: Create database tables manually
 * Run this with: node scripts/create-tables-emergency.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function createTables() {
  // Get DATABASE_URL from environment or use Render's DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable not set!');
    console.log('\n📝 To fix this:');
    console.log('1. Go to your Render dashboard');
    console.log('2. Copy the Internal Database URL');
    console.log('3. Run: $env:DATABASE_URL="your-database-url"; node scripts/create-tables-emergency.js');
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

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'EMERGENCY_CREATE_TABLES.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📊 Creating tables...');
    await client.query(sql);

    console.log('✅ All tables created successfully!');
    console.log('\n🎉 Your database is now ready!');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your Render service');
    console.log('2. Test your endpoints');
    console.log('3. Your app should work now!');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTables();
