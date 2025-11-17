const { execSync } = require('child_process');

console.log('🔄 Running database migrations...');

try {
  execSync('npm run migration:run', { stdio: 'inherit' });
  console.log('✅ Migrations completed successfully');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  // Don't exit - let the app start anyway in case tables exist
}