const axios = require('axios');

const BASE_URL = 'https://atara-dajy.onrender.com';

async function testDirectEndpoint() {
  try {
    console.log('🧪 Testing Direct Notification Endpoint...\n');

    // Login as admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Test direct notification creation
    console.log('\n1. Testing direct notification creation...');
    try {
      const testResponse = await axios.post(`${BASE_URL}/test-notifications/create-test`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Direct test result:', testResponse.data);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check notifications
      console.log('\n2. Checking notifications after direct test...');
      const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`📋 Notifications after direct test: ${notificationsResponse.data.length}`);
      
      if (notificationsResponse.data.length > 0) {
        console.log('\n📋 Found notifications:');
        notificationsResponse.data.forEach((notif, index) => {
          console.log(`${index + 1}. [${notif.type}] ${notif.title}: ${notif.message}`);
        });
      }
      
    } catch (testError) {
      console.error('❌ Direct test failed:', testError.response?.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDirectEndpoint();