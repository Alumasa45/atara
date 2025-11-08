/**
 * URGENT FIX: Run this to create missing session_groups table (Local DB)
 * Usage: node run-urgent-fix-local.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runUrgentFix() {
  console.log('🔌 Connecting to local database...');
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'aquinattaayo',
    database: 'atara',
    ssl: false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database!');

    const sqlPath = path.join(__dirname, 'URGENT_FIX_MISSING_TABLES.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔧 Running urgent fix...');
    await client.query(sql);

    console.log('✅ URGENT FIX COMPLETED!');
    console.log('📝 Restart your application to test.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Is PostgreSQL running? Check: docker ps');
    console.log('2. Try: docker-compose up -d');
    console.log('3. Or check if DB is on different port');
    process.exit(1);
  } finally {
    await client.end();
  }
}

runUrgentFix();