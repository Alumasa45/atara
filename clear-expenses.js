const { Client } = require('pg');

async function clearExpenses() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    query_timeout: 30000,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Clearing all expenses...');
    const result = await client.query('DELETE FROM expenses');
    console.log(`Deleted ${result.rowCount} expenses`);
    
    console.log('Resetting expense_id sequence...');
    await client.query('ALTER SEQUENCE expenses_expense_id_seq RESTART WITH 1');
    
    console.log('✅ All expenses cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing expenses:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

clearExpenses();