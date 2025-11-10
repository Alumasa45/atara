const fetch = require('node-fetch');

async function testAuthRoutes() {
  const baseUrl = 'https://atara-backend.onrender.com';
  
  console.log('Testing auth routes...\n');
  
  // Test auth/test endpoint
  try {
    console.log('1. Testing POST /auth/test');
    const testResponse = await fetch(`${baseUrl}/auth/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`Status: ${testResponse.status}`);
    const testData = await testResponse.text();
    console.log(`Response: ${testData}\n`);
  } catch (error) {
    console.log(`Error: ${error.message}\n`);
  }
  
  // Test auth/login endpoint
  try {
    console.log('2. Testing POST /auth/login');
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' })
    });
    console.log(`Status: ${loginResponse.status}`);
    const loginData = await loginResponse.text();
    console.log(`Response: ${loginData}\n`);
  } catch (error) {
    console.log(`Error: ${error.message}\n`);
  }
  
  // Test health endpoint
  try {
    console.log('3. Testing GET /health');
    const healthResponse = await fetch(`${baseUrl}/health`);
    console.log(`Status: ${healthResponse.status}`);
    const healthData = await healthResponse.text();
    console.log(`Response: ${healthData}\n`);
  } catch (error) {
    console.log(`Error: ${error.message}\n`);
  }
}

testAuthRoutes();