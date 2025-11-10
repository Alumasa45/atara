const { execSync } = require('child_process');

console.log('🔧 Deploying auth route fixes...\n');

try {
  console.log('1. Building and copying frontend...');
  execSync('node scripts/build-and-copy-frontend.js', { stdio: 'inherit' });
  
  console.log('\n2. Building backend...');
  execSync('pnpm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Build complete! Ready for deployment.');
  console.log('\nChanges made:');
  console.log('- Fixed Cross-Origin-Opener-Policy for Google OAuth');
  console.log('- Removed ServeStaticModule conflicts');
  console.log('- Added proper static file serving');
  console.log('- Added request logging for debugging');
  console.log('- Added debug logging to auth endpoints');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}