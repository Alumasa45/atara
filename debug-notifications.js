const axios = require('axios');

const BASE_URL = 'https://atara-dajy.onrender.com';

async function debugNotifications() {
  try {
    console.log('🔍 Debugging Notification System...\n');

    // First, let's get a fresh token by logging in
    console.log('1. Logging in to get fresh token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@atara.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful, got token');

    // Check current notifications
    console.log('\n2. Checking current notifications...');
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`📋 Current notifications: ${notificationsResponse.data.length}`);

    // Check unread count
    console.log('\n3. Checking unread count...');
    const unreadResponse = await axios.get(`${BASE_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`🔔 Unread count: ${unreadResponse.data.count}`);

    // Get available time slots
    console.log('\n4. Getting available time slots...');
    const slotsResponse = await axios.get(`${BASE_URL}/schedule`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`📅 Available schedules: ${slotsResponse.data.length}`);
    
    if (slotsResponse.data.length > 0) {
      const schedule = slotsResponse.data[0];
      console.log(`📅 Using schedule: ${schedule.schedule_id}`);
      
      if (schedule.timeSlots && schedule.timeSlots.length > 0) {
        const timeSlot = schedule.timeSlots[0];
        console.log(`⏰ Using time slot: ${timeSlot.slot_id}`);

        // Create a test booking
        console.log('\n5. Creating test booking...');
        try {
          const bookingResponse = await axios.post(`${BASE_URL}/bookings`, {
            time_slot_id: timeSlot.slot_id,
            guest_name: "Debug Test User",
            guest_phone: "+1234567890",
            guest_email: "debug@test.com",
            payment_reference: "DEBUG-TEST-" + Date.now()
          });
          console.log('✅ Booking created:', bookingResponse.data.booking_id);

          // Wait a moment for notifications to be processed
          console.log('\n6. Waiting for notifications to be processed...');
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Check notifications again
          console.log('\n7. Checking notifications after booking...');
          const finalNotificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`📋 Notifications after booking: ${finalNotificationsResponse.data.length}`);
          
          if (finalNotificationsResponse.data.length > 0) {
            console.log('\n📋 Recent notifications:');
            finalNotificationsResponse.data.slice(0, 3).forEach((notif, index) => {
              console.log(`${index + 1}. [${notif.type}] ${notif.title}: ${notif.message}`);
            });
          }

        } catch (bookingError) {
          console.error('❌ Booking creation failed:', bookingError.response?.data || bookingError.message);
        }
      } else {
        console.log('⚠️ No time slots available in schedule');
      }
    } else {
      console.log('⚠️ No schedules available');
    }

    console.log('\n🎉 Debug completed!');

  } catch (error) {
    console.error('❌ Debug error:', error.response?.data || error.message);
  }
}

debugNotifications();