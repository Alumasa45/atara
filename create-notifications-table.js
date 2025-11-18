const { Client } = require('pg');

async function createNotificationsTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create notifications table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('new_booking', 'booking_cancelled', 'payment_received')),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        booking_id INTEGER REFERENCES bookings(booking_id) ON DELETE CASCADE,
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(createTableQuery);
    console.log('✅ Notifications table created successfully');

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS IDX_notifications_user_id ON notifications(user_id);',
      'CREATE INDEX IF NOT EXISTS IDX_notifications_is_read ON notifications(is_read);',
      'CREATE INDEX IF NOT EXISTS IDX_notifications_created_at ON notifications(created_at);'
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    console.log('✅ Indexes created successfully');

  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
    throw error;
  } finally {
    await client.end();
  }
}

createNotificationsTable()
  .then(() => {
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });