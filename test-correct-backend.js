const fetch = require('node-fetch');

async function testCorrectBackend() {
  // Test the URL from render.yaml
  const correctUrl = 'https://atara-dajy.onrender.com';
  
  console.log('Testing correct backend URL from render.yaml...\n');
  
  // Test health endpoint
  try {
    console.log('1. Testing GET /health');
    const healthResponse = await fetch(`${correctUrl}/health`);
    console.log(`Status: ${healthResponse.status}`);
    const healthData = await healthResponse.text();
    console.log(`Response: ${healthData}\n`);
  } catch (error) {
    console.log(`Error: ${error.message}\n`);
  }
  
  // Test auth/test endpoint
  try {
    console.log('2. Testing POST /auth/test');
    const testResponse = await fetch(`${correctUrl}/auth/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`Status: ${testResponse.status}`);
    const testData = await testResponse.text();
    console.log(`Response: ${testData}\n`);
  } catch (error) {
    console.log(`Error: ${error.message}\n`);
  }
}

testCorrectBackend();