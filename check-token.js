const axios = require('axios');

async function checkToken() {
  try {
    console.log('Logging in to check token format...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (loginResponse.status !== 200) {
      console.log('Login failed:', loginResponse.status, loginResponse.data);
      return;
    }
    
    console.log('Login successful');
    console.log('Full response data:', JSON.stringify(loginResponse.data, null, 2));
    
    // Extract and log the token
    const token = loginResponse.data.data.token;
    console.log('Token:', token);
    
    // Test the token with a GET request to /api/auth/me
    console.log('\nTesting token with GET /api/auth/me...');
    try {
      const meResponse = await axios.get('http://localhost:3000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('GET /api/auth/me successful:', meResponse.status);
      console.log('User data:', meResponse.data);
    } catch (error) {
      console.error('Error accessing /api/auth/me:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }
  } catch (error) {
    console.error('Error during login:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

checkToken(); 