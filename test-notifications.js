const axios = require('axios');

const BASE_URL = 'https://atara-dajy.onrender.com';
// const BASE_URL = 'http://localhost:3000';

const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MzQ2MjA2MiwiZXhwIjoxNzYzNDY1NjYyfQ.Ns5uAm8bNr8JiYbwYGprQ0pNWda9-Yx_YaebBjXS9_o';

async function testNotifications() {
  try {
    console.log('🔔 Testing Notification System...\n');

    // 1. Test getting notifications
    console.log('1. Getting current notifications...');
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Found ${notificationsResponse.data.length} notifications`);
    
    // 2. Test getting unread count
    console.log('\n2. Getting unread count...');
    const unreadResponse = await axios.get(`${BASE_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Unread count: ${unreadResponse.data.count}`);

    // 3. Test creating a booking (should trigger notifications)
    console.log('\n3. Creating a test booking to trigger notifications...');
    try {
      const bookingResponse = await axios.post(`${BASE_URL}/bookings`, {
        time_slot_id: 9,
        guest_name: "Test Notification User",
        guest_phone: "+1234567890",
        guest_email: "test@notifications.com",
        payment_reference: "TEST-NOTIFICATION-123"
      });
      console.log('✅ Booking created successfully');
    } catch (error) {
      console.log('⚠️ Booking creation failed (expected if time slot not available)');
    }

    // 4. Test creating an expense (should trigger manager notifications)
    console.log('\n4. Creating a test expense to trigger manager notifications...');
    try {
      const expenseResponse = await axios.post(`${BASE_URL}/admin/expenses`, {
        name: "Test notification expense",
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        cost: 50.00,
        status: "approved"
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Expense created successfully');
    } catch (error) {
      console.log('⚠️ Expense creation failed:', error.response?.data?.message || error.message);
    }

    // 5. Check notifications again
    console.log('\n5. Checking notifications after actions...');
    const finalNotificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Now have ${finalNotificationsResponse.data.length} notifications`);
    
    if (finalNotificationsResponse.data.length > 0) {
      console.log('\n📋 Recent notifications:');
      finalNotificationsResponse.data.slice(0, 3).forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title}: ${notif.message}`);
      });
    }

    console.log('\n🎉 Notification system test completed!');

  } catch (error) {
    console.error('❌ Error testing notifications:', error.response?.data || error.message);
  }
}

testNotifications();