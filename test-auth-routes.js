const fetch = require('node-fetch');

const BASE_URL = 'https://atara-backend.onrender.com';

async function testRoutes() {
  console.log('Testing backend routes...\n');

  // Test health endpoint
  try {
    console.log('1. Testing /health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    console.log(`   Status: ${healthRes.status}`);
    const healthData = await healthRes.text();
    console.log(`   Response: ${healthData}\n`);
  } catch (err) {
    console.log(`   Error: ${err.message}\n`);
  }

  // Test auth/login endpoint
  try {
    console.log('2. Testing /auth/login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' })
    });
    console.log(`   Status: ${loginRes.status}`);
    const loginData = await loginRes.text();
    console.log(`   Response: ${loginData}\n`);
  } catch (err) {
    console.log(`   Error: ${err.message}\n`);
  }

  // Test auth/google endpoint
  try {
    console.log('3. Testing /auth/google...');
    const googleRes = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'test-token' })
    });
    console.log(`   Status: ${googleRes.status}`);
    const googleData = await googleRes.text();
    console.log(`   Response: ${googleData}\n`);
  } catch (err) {
    console.log(`   Error: ${err.message}\n`);
  }
}

testRoutes();