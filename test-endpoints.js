const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(path, description) {
  try {
    console.log(`Testing ${description}...`);
    const response = await fetch(`${BASE_URL}${path}`);
    const status = response.status;
    const text = await response.text();
    
    console.log(`  ✅ ${path} - Status: ${status}`);
    if (status === 200) {
      try {
        const json = JSON.parse(text);
        console.log(`  📄 Response: ${JSON.stringify(json).substring(0, 100)}...`);
      } catch (e) {
        console.log(`  📄 Response: ${text.substring(0, 100)}...`);
      }
    } else {
      console.log(`  ❌ Error: ${text}`);
    }
  } catch (error) {
    console.log(`  ❌ ${path} - Error: ${error.message}`);
  }
  console.log('');
}

async function runTests() {
  console.log('🧪 Testing Backend Endpoints\n');
  
  await testEndpoint('/health', 'Health Check');
  await testEndpoint('/schedule', 'Schedule Endpoint');
  await testEndpoint('/trainers', 'Trainers Endpoint');
  await testEndpoint('/sessions', 'Sessions Endpoint');
  
  console.log('✅ Test completed!');
}

runTests().catch(console.error);