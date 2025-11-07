const axios = require('axios');

async function testBookingsEndpoint() {
  const baseURL = 'https://atara-dajy.onrender.com';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjUyNzU3MSwiZXhwIjoxNzYyNTMxMTcxfQ.2Zkm9-aZHCxSlS9VbCL79xn-kS4pJEcrZ13ONc6Spao';

  console.log('🧪 Testing admin bookings endpoint...');

  try {
    // Test database connectivity first
    console.log('1. Testing database connectivity...');
    const dbTestResponse = await axios.get(`${baseURL}/admin/debug/db-test`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Database test result:', dbTestResponse.data);

    // Test bookings endpoint
    console.log('2. Testing bookings endpoint...');
    const bookingsResponse = await axios.get(`${baseURL}/admin/bookings?page=1&limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Bookings endpoint result:', bookingsResponse.data);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testBookingsEndpoint();