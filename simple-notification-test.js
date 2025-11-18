const axios = require('axios');

const BASE_URL = 'https://atara-dajy.onrender.com';

async function testNotifications() {
  try {
    console.log('🔍 Simple Notification Test...\n');

    // Try to create a guest booking (no login required)
    console.log('1. Creating guest booking to trigger notifications...');
    
    try {
      const bookingResponse = await axios.post(`${BASE_URL}/bookings`, {
        time_slot_id: 9, // Using the time slot from your test
        guest_name: "Notification Test User",
        guest_phone: "+1234567890",
        guest_email: "notif-test@example.com",
        payment_reference: "NOTIF-TEST-" + Date.now()
      });
      console.log('✅ Guest booking created:', bookingResponse.data.booking_id);
      
      // Wait for notifications to be processed
      console.log('\n2. Waiting for notifications to be processed...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('\n✅ Booking created successfully. Check server logs for notification creation messages.');
      console.log('🔔 If notifications were created, they should appear for:');
      console.log('   - The trainer assigned to the session');
      console.log('   - All admin users');
      console.log('   - All manager users');
      
    } catch (bookingError) {
      console.error('❌ Booking creation failed:', bookingError.response?.data || bookingError.message);
      
      // Let's try a different time slot
      console.log('\n🔄 Trying with a different approach...');
      
      // Get available schedules first
      try {
        const schedulesResponse = await axios.get(`${BASE_URL}/schedule`);
        console.log(`📅 Found ${schedulesResponse.data.length} schedules`);
        
        if (schedulesResponse.data.length > 0) {
          const schedule = schedulesResponse.data[0];
          if (schedule.timeSlots && schedule.timeSlots.length > 0) {
            const timeSlot = schedule.timeSlots[0];
            console.log(`⏰ Trying with time slot: ${timeSlot.slot_id}`);
            
            const retryBookingResponse = await axios.post(`${BASE_URL}/bookings`, {
              time_slot_id: timeSlot.slot_id,
              guest_name: "Retry Notification Test",
              guest_phone: "+1234567890",
              guest_email: "retry-notif@example.com",
              payment_reference: "RETRY-NOTIF-" + Date.now()
            });
            console.log('✅ Retry booking created:', retryBookingResponse.data.booking_id);
          }
        }
      } catch (scheduleError) {
        console.error('❌ Could not get schedules:', scheduleError.response?.data || scheduleError.message);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.response?.data || error.message);
  }
}

testNotifications();