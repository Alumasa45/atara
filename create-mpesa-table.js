const { Client } = require('pg');

async function createMpesaTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    query_timeout: 30000,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Creating mpesa_transactions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS mpesa_transactions (
          id SERIAL PRIMARY KEY,
          checkout_request_id VARCHAR(255) NOT NULL,
          merchant_request_id VARCHAR(255) NOT NULL,
          phone_number VARCHAR(20) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          account_reference VARCHAR(255) NOT NULL,
          transaction_desc VARCHAR(255) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          mpesa_receipt_number VARCHAR(255),
          result_code VARCHAR(10),
          result_desc TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_mpesa_checkout_request ON mpesa_transactions(checkout_request_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_mpesa_status ON mpesa_transactions(status);');

    console.log('✅ M-Pesa table created successfully!');
  } catch (error) {
    console.error('❌ Error creating M-Pesa table:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createMpesaTable();