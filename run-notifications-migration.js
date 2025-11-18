const { DataSource } = require('typeorm');
const path = require('path');

// Create DataSource configuration matching your app
const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: true,
  entities: [path.join(__dirname, 'src', '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'src', 'migrations', '*.{ts,js}')],
});

async function runNotificationsMigration() {
  try {
    console.log('🚀 Initializing DataSource...');
    await dataSource.initialize();
    console.log('✅ DataSource initialized');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      console.log('🔍 Checking if notifications table exists...');
      
      // Check if table exists
      const tableExists = await queryRunner.hasTable('notifications');
      
      if (tableExists) {
        console.log('✅ Notifications table already exists');
        return { success: true, message: 'Table already exists' };
      }

      console.log('📝 Creating notifications table...');

      // Create notifications table
      await queryRunner.query(`
        CREATE TABLE notifications (
          notification_id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('new_booking', 'booking_cancelled', 'payment_received')),
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          booking_id INTEGER,
          is_read BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          CONSTRAINT fk_notifications_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
        );
      `);

      console.log('✅ Notifications table created');

      // Create indexes
      console.log('📝 Creating indexes...');
      
      await queryRunner.query('CREATE INDEX IDX_notifications_user_id ON notifications(user_id);');
      await queryRunner.query('CREATE INDEX IDX_notifications_is_read ON notifications(is_read);');
      await queryRunner.query('CREATE INDEX IDX_notifications_created_at ON notifications(created_at);');

      console.log('✅ Indexes created');

      // Insert migration record
      await queryRunner.query(`
        INSERT INTO migrations (timestamp, name) 
        VALUES (1764100000000, 'CreateNotificationsTable1764100000000')
        ON CONFLICT (timestamp) DO NOTHING;
      `);

      console.log('✅ Migration record inserted');

      return { success: true, message: 'Notifications table created successfully' };

    } finally {
      await queryRunner.release();
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 DataSource connection closed');
    }
  }
}

// Run the migration
runNotificationsMigration()
  .then((result) => {
    console.log('🎉 Migration completed:', result.message);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  });