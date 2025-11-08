/**
 * URGENT FIX: Run SQL directly in Docker container
 * Usage: node run-fix-docker.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runDockerFix() {
  try {
    console.log('🐳 Running fix directly in Docker container...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'URGENT_FIX_MISSING_TABLES.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Write SQL to temp file
    fs.writeFileSync('temp-fix.sql', sql);
    
    // Copy SQL file to container and execute
    execSync('docker cp temp-fix.sql atara-movement:/tmp/fix.sql', { stdio: 'inherit' });
    execSync('docker exec atara-movement psql -U postgres -d atara -f /tmp/fix.sql', { stdio: 'inherit' });
    
    // Cleanup
    fs.unlinkSync('temp-fix.sql');
    
    console.log('✅ URGENT FIX COMPLETED via Docker!');
    console.log('📝 Restart your application to test.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Make sure Docker is running and container exists:');
    console.log('docker-compose up -d atara-db');
  }
}

runDockerFix();