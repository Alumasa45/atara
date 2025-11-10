const fetch = require('node-fetch');

async function testAuthFinal() {
  const baseUrl = 'https://atara-dajy.onrender.com';
  
  console.log('Testing auth routes with correct URL...\n');
  
  // Test auth/login endpoint
  try {
    console.log('1. Testing POST /auth/login');
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
  
  // Test auth/google endpoint
  try {
    console.log('2. Testing POST /auth/google');
    const googleResponse = await fetch(`${baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        idToken: 'fake-token',
        email: 'test@gmail.com',
        username: 'testuser',
        google_id: '123456789'
      })
    });
    console.log(`Status: ${googleResponse.status}`);
    const googleData = await googleResponse.text();
    console.log(`Response: ${googleData}\n`);
  } catch (error) {
    console.log(`Error: ${error.message}\n`);
  }
}

testAuthFinal();