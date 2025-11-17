// Test M-Pesa credentials directly
const consumerKey = '4w3zRfjftSp6sAH913Z5TGlFXgSPJQcqxT0GtQXV8l4VGo8j';
const consumerSecret = 'y8P2Bb6vFkGKjIq1nizNWj4MUiAhuH2fAk0EG42tmMT6K9ndzLJIe7HH4srqGRpc';

async function testCredentials() {
  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    console.log('Testing M-Pesa credentials...');
    console.log('Auth header:', auth.substring(0, 30) + '...');
    
    const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('✅ Credentials valid! Access token received');
      return data.access_token;
    } else {
      console.log('❌ Credentials invalid');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCredentials();