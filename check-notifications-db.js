const axios = require('axios');

const BASE_URL = 'https://atara-dajy.onrender.com';

async function checkNotificationsInDB() {
  try {
    console.log('🔍 Checking notifications in database...\n');

    // Try to register a test user first
    console.log('1. Registering a test user...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        email: 'testuser@example.com',
        username: 'testuser',
        password: 'password123',
        role: 'client'
      });
      console.log('✅ Test user registered');
      
      const token = registerResponse.data.access_token;
      if (token) {
        console.log('✅ Got access token from registration');
        
        // Check notifications for this user
        console.log('\n2. Checking notifications for test user...');
        const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`📋 Notifications for test user: ${notificationsResponse.data.length}`);
        
        // Check unread count
        const unreadResponse = await axios.get(`${BASE_URL}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`🔔 Unread count: ${unreadResponse.data.count}`);
        
        if (notificationsResponse.data.length > 0) {
          console.log('\n📋 Notifications found:');
          notificationsResponse.data.forEach((notif, index) => {
            console.log(`${index + 1}. [${notif.type}] ${notif.title}: ${notif.message}`);
          });
        }
      }
      
    } catch (registerError) {
      console.log('⚠️ Registration failed (user might already exist):', registerError.response?.data?.message);
      
      // Try to login with existing user
      console.log('\n🔄 Trying to login with existing user...');
      try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: 'testuser@example.com',
          password: 'password123'
        });
        
        const token = loginResponse.data.access_token;
        console.log('✅ Login successful');
        
        // Check notifications
        console.log('\n2. Checking notifications...');
        const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`📋 Notifications: ${notificationsResponse.data.length}`);
        
        if (notificationsResponse.data.length > 0) {
          console.log('\n📋 Notifications found:');
          notificationsResponse.data.forEach((notif, index) => {
            console.log(`${index + 1}. [${notif.type}] ${notif.title}: ${notif.message}`);
          });
        }
        
      } catch (loginError) {
        console.error('❌ Login also failed:', loginError.response?.data?.message);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkNotificationsInDB();