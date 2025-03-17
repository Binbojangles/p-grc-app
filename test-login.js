const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with original password...');
    const loginResponse = await axios.post('http://host.docker.internal:3000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (loginResponse.status !== 200) {
      console.log('Login failed:', loginResponse.status, loginResponse.data);
      return;
    }
    
    console.log('Login successful');
    console.log('User data:', loginResponse.data.data.user);
  } catch (error) {
    console.error('Error during login:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testLogin(); 