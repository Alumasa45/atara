const { Client } = require('pg');

async function createNotificationsTableProduction() {
  // Use the production DATABASE_URL from Render
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database');

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

    console.log('🔧 Creating notifications table in production...');

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

    // Create indexes for performance
    await client.query(`
      CREATE INDEX IDX_notifications_user_id ON notifications(user_id);
      CREATE INDEX IDX_notifications_is_read ON notifications(is_read);
      CREATE INDEX IDX_notifications_created_at ON notifications(created_at);
    `);

    console.log('✅ Notifications table created successfully in production');

    // Insert a test notification to verify
    const testUser = await client.query('SELECT user_id FROM users LIMIT 1');
    if (testUser.rows.length > 0) {
      await client.query(`
        INSERT INTO notifications (user_id, type, title, message)
        VALUES ($1, 'new_booking', 'System Ready', 'Notifications system is now active')
      `, [testUser.rows[0].user_id]);
      console.log('✅ Test notification created');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Export for use in other scripts
module.exports = { createNotificationsTableProduction };

// Run if called directly
if (require.main === module) {
  createNotificationsTableProduction()
    .then(() => {
      console.log('🎉 Production notifications table setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}