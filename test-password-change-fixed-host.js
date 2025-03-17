const axios = require('axios');

async function testPasswordChange() {
  try {
    console.log('Starting password change test');
    
    // 1. Login with current password (admin123)
    console.log('Logging in with current password...');
    const loginResponse = await axios.post('http://host.docker.internal:3000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (loginResponse.status !== 200) {
      console.log('Login failed:', loginResponse.status, loginResponse.data);
      return;
    }
    
    console.log('Login successful');
    const token = loginResponse.data.data.token;
    
    // 2. Change password
    console.log('Changing password...');
    const changeResponse = await axios.put(
      'http://host.docker.internal:3000/api/auth/password',
      {
        currentPassword: 'admin123',
        newPassword: 'NewPassword123!'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    if (changeResponse.status !== 200) {
      console.log('Password change failed:', changeResponse.status, changeResponse.data);
      return;
    }
    
    console.log('Password change response:', changeResponse.data);
    
    // 3. Try to login with new password
    console.log('Logging in with new password...');
    const newLoginResponse = await axios.post('http://host.docker.internal:3000/api/auth/login', {
      email: 'admin@example.com',
      password: 'NewPassword123!'
    });
    
    if (newLoginResponse.status !== 200) {
      console.log('Login with new password failed:', newLoginResponse.status, newLoginResponse.data);
      return;
    }
    
    console.log('Login with new password successful');
    console.log('User data:', newLoginResponse.data.data.user);
    
    // 4. Change back to original password
    console.log('Changing back to original password...');
    const changeBackResponse = await axios.put(
      'http://host.docker.internal:3000/api/auth/password',
      {
        currentPassword: 'NewPassword123!',
        newPassword: 'admin123'
      },
      {
        headers: {
          Authorization: `Bearer ${newLoginResponse.data.data.token}`
        }
      }
    );
    
    if (changeBackResponse.status !== 200) {
      console.log('Password change back failed:', changeBackResponse.status, changeBackResponse.data);
      return;
    }
    
    console.log('Password change back response:', changeBackResponse.data);
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error during test:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testPasswordChange(); 