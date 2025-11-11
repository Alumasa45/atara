const { Client } = require('pg');

async function addProfileImageColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Check if column already exists
    console.log('🔍 Checking if profile_image column exists...');
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'trainers' AND column_name = 'profile_image';
    `;
    
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ profile_image column already exists');
      return;
    }

    console.log('➕ Adding profile_image column...');
    // Add the column
    const addColumnQuery = `ALTER TABLE trainers ADD COLUMN profile_image VARCHAR(255);`;
    
    await client.query(addColumnQuery);
    console.log('✅ Successfully added profile_image column to trainers table');

    // Verify the column was added
    console.log('🔍 Verifying column was added...');
    const verifyResult = await client.query(checkQuery);
    if (verifyResult.rows.length > 0) {
      console.log('✅ Column verified - profile_image column exists');
    } else {
      console.log('❌ Column verification failed');
    }

  } catch (error) {
    console.error('❌ Error adding profile_image column:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    throw error;
  } finally {
    try {
      await client.end();
      console.log('🔌 Database connection closed');
    } catch (e) {
      console.log('Connection already closed');
    }
  }
}

addProfileImageColumn()
  .then(() => {
    console.log('🎉 Profile image column setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });