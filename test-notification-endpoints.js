const axios = require('axios');

const BASE_URL = 'https://atara-dajy.onrender.com';

async function testNotificationEndpoints() {
  try {
    console.log('🔍 Testing Notification Endpoints...\n');

    // Login as admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Test notification endpoints
    console.log('\n1. Testing GET /notifications...');
    try {
      const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`✅ GET /notifications works - returned ${notificationsResponse.data.length} notifications`);
    } catch (error) {
      console.error('❌ GET /notifications failed:', error.response?.data?.message);
    }

    console.log('\n2. Testing GET /notifications/unread-count...');
    try {
      const unreadResponse = await axios.get(`${BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`✅ GET /notifications/unread-count works - count: ${unreadResponse.data.count}`);
    } catch (error) {
      console.error('❌ GET /notifications/unread-count failed:', error.response?.data?.message);
    }

    // Test database connectivity by checking if we can create an expense (which should trigger notifications)
    console.log('\n3. Testing expense creation (should trigger manager notifications)...');
    try {
      const expenseResponse = await axios.post(`${BASE_URL}/admin/expenses`, {
        name: "Test Notification Expense",
        date: new Date().toISOString().split('T')[0],
        cost: 25.00,
        status: "approved"
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Expense created successfully:', expenseResponse.data.expense_id);
      
      // Wait for notification processing
      console.log('⏳ Waiting for notification processing...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check notifications again
      console.log('\n4. Checking notifications after expense creation...');
      const finalNotificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`📋 Notifications after expense: ${finalNotificationsResponse.data.length}`);
      
      if (finalNotificationsResponse.data.length > 0) {
        console.log('\n📋 Found notifications:');
        finalNotificationsResponse.data.forEach((notif, index) => {
          console.log(`${index + 1}. [${notif.type}] ${notif.title}: ${notif.message}`);
        });
      } else {
        console.log('⚠️ No notifications found after expense creation');
      }
      
    } catch (expenseError) {
      console.error('❌ Expense creation failed:', expenseError.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testNotificationEndpoints();