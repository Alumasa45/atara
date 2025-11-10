const axios = require('axios');

async function testTrainerDashboard() {
  try {
    console.log('🧪 Testing Trainer Dashboard Endpoint...\n');
    
    // First, login as trainer to get a valid token
    console.log('1. Logging in as trainer...');
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'ataratrainer@gmail.com',
      password: 'Trainer@1234'
    });
    
    if (!loginResponse.data.access_token) {
      console.error('❌ Login failed - no access token received');
      return;
    }
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful, token received');
    console.log('   User:', loginResponse.data.user?.username);
    console.log('   Role:', loginResponse.data.user?.role);
    
    // Test the trainer dashboard endpoint
    console.log('\n2. Testing /dashboard/trainer endpoint...');
    const dashboardResponse = await axios.get('http://localhost:3000/dashboard/trainer', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Dashboard endpoint successful!');
    console.log('   Response keys:', Object.keys(dashboardResponse.data));
    console.log('   Trainer:', dashboardResponse.data.trainer?.name || 'No trainer name');
    console.log('   Sessions count:', dashboardResponse.data.sessions?.length || 0);
    console.log('   Upcoming schedules:', dashboardResponse.data.upcomingSchedules?.length || 0);
    console.log('   Bookings count:', dashboardResponse.data.bookings?.length || 0);
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.message || error.response.statusText);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received');
      console.error('   Request:', error.request);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

// Run the test
testTrainerDashboard();