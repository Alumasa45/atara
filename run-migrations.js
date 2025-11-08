const { execSync } = require('child_process');

try {
  console.log('Running migrations...');
  execSync('npm run migration:run', { stdio: 'inherit' });
  console.log('Migrations completed successfully!');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}