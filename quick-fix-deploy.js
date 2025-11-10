const { execSync } = require('child_process');

console.log('🔧 Quick fix for express dependency issue...\n');

try {
  console.log('1. Building backend...');
  execSync('pnpm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Build successful!');
  console.log('\nFixed issues:');
  console.log('- Removed express import (not needed)');
  console.log('- Used ServeStaticModule with proper API route exclusions');
  console.log('- Kept CORS fixes for Google OAuth');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}