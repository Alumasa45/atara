const https = require('https');

const BASE_URL = 'https://atara-backend.onrender.com';

function testRoute(path, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`${method} ${path}: ${res.statusCode} - ${body.substring(0, 100)}`);
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (err) => {
      console.log(`${method} ${path}: ERROR - ${err.message}`);
      resolve({ error: err.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAll() {
  console.log('Testing backend routes...\n');
  
  await testRoute('/health');
  await testRoute('/auth/test', 'POST');
  await testRoute('/auth/login', 'POST', { email: 'test@test.com', password: 'test' });
  await testRoute('/auth/google', 'POST', { idToken: 'test' });
}

testAll();