const axios = require('axios');

const BASE_URL = 'https://atara-dajy.onrender.com';

async function testDirectNotification() {
  try {
    console.log('🔍 Testing Direct Notification Creation...\n');

    // Register as admin to get admin token
    console.log('1. Getting admin access...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        email: 'admin@test.com',
        username: 'admintest',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user registered');
    } catch (e) {
      console.log('⚠️ Admin registration failed (might already exist)');
    }

    // Login as admin
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@test.com',
        password: 'admin123'
      });
      
      const adminToken = loginResponse.data.access_token;
      console.log('✅ Admin login successful');

      // Check if we can access admin endpoints
      console.log('\n2. Testing admin access...');
      try {
        const usersResponse = await axios.get(`${BASE_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`👥 Found ${usersResponse.data.data.length} users in system`);
        
        // Look for trainers
        const trainers = usersResponse.data.data.filter(user => user.role === 'trainer');
        console.log(`👨‍🏫 Found ${trainers.length} trainers`);
        
        // Look for managers
        const managers = usersResponse.data.data.filter(user => user.role === 'manager');
        console.log(`👨‍💼 Found ${managers.length} managers`);
        
        // Look for admins
        const admins = usersResponse.data.data.filter(user => user.role === 'admin');
        console.log(`👨‍💻 Found ${admins.length} admins`);

      } catch (adminError) {
        console.error('❌ Admin access failed:', adminError.response?.data?.message);
      }

      // Check notifications for admin
      console.log('\n3. Checking admin notifications...');
      const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`📋 Admin notifications: ${notificationsResponse.data.length}`);
      
      if (notificationsResponse.data.length > 0) {
        console.log('\n📋 Admin notifications:');
        notificationsResponse.data.forEach((notif, index) => {
          console.log(`${index + 1}. [${notif.type}] ${notif.title}: ${notif.message}`);
        });
      }

    } catch (loginError) {
      console.error('❌ Admin login failed:', loginError.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDirectNotification();