const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const frontendDir = path.join(repoRoot, 'frontend');
const frontendDist = path.join(frontendDir, 'dist');
const publicDir = path.join(repoRoot, 'public');

try {
  console.log('Building frontend (npm build)...');
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

  if (!fs.existsSync(frontendDist)) {
    console.error('Frontend build output not found at', frontendDist);
    process.exit(1);
  }

  // Remove existing public dir
  if (fs.existsSync(publicDir)) {
    console.log('Removing existing public directory:', publicDir);
    fs.rmSync(publicDir, { recursive: true, force: true });
  }

  console.log('Copying frontend build to public directory...');
  // Node 16.7+ has fs.cpSync which supports recursive copy
  if (typeof fs.cpSync === 'function') {
    fs.cpSync(frontendDist, publicDir, { recursive: true });
  } else {
    // fallback copy
    const copyRecursiveSync = (src, dest) => {
      const exists = fs.existsSync(src);
      const stats = exists && fs.statSync(src);
      const isDirectory = exists && stats.isDirectory();
      if (isDirectory) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach((childItemName) => {
          copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    };
    copyRecursiveSync(frontendDist, publicDir);
  }

  console.log('Frontend build copied to', publicDir);
  process.exit(0);
} catch (err) {
  console.error('Error building/copying frontend:', err);
  process.exit(1);
}
