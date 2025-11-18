const { Client } = require('pg');

async function createNotificationsTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/atara',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if notifications table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log('✅ Notifications table already exists');
      return;
    }

    console.log('Creating notifications table...');

    // Create notifications table
    await client.query(`
      CREATE TABLE notifications (
        notification_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('new_booking', 'booking_cancelled', 'payment_received')),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        booking_id INTEGER,
        is_read BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IDX_notifications_user_id ON notifications(user_id);
      CREATE INDEX IDX_notifications_is_read ON notifications(is_read);
      CREATE INDEX IDX_notifications_created_at ON notifications(created_at);
    `);

    console.log('✅ Notifications table created successfully');

  } catch (error) {
    console.error('❌ Error creating notifications table:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  createNotificationsTable()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createNotificationsTable };