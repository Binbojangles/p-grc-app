const axios = require('axios');
const crypto = require('crypto');
const { User, sequelize } = require('./models');

// Function to get a JWT token by logging in
async function login(email, password) {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email,
      password
    });
    
    return response.data.data.token;
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to change password
async function changePassword(token, currentPassword, newPassword) {
  try {
    const response = await axios.put(
      'http://localhost:3000/api/auth/password',
      {
        currentPassword,
        newPassword
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Password change error:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to check if the user's salt changed
async function checkUserSalt(email, beforeSalt) {
  try {
    const user = await User.findOne({ where: { email } });
    console.log('User salt after password change:', user.salt);
    console.log('Salt changed:', user.salt !== beforeSalt);
    
    return {
      saltBefore: beforeSalt,
      saltAfter: user.salt,
      changed: user.salt !== beforeSalt
    };
  } catch (error) {
    console.error('Error checking user salt:', error);
    throw error;
  }
}

// Main function to test password change
async function testPasswordChange() {
  const email = 'admin@example.com';
  const currentPassword = 'admin123';
  const newPassword = 'NewPassword123!';
  
  try {
    // Get the initial salt
    const user = await User.findOne({ where: { email } });
    console.log('Initial user salt:', user.salt);
    const initialSalt = user.salt;
    
    // Login to get token
    console.log(`Logging in with ${email} and password ${currentPassword}...`);
    const token = await login(email, currentPassword);
    console.log('Login successful, got token');
    
    // Change password
    console.log(`Changing password from ${currentPassword} to ${newPassword}...`);
    const result = await changePassword(token, currentPassword, newPassword);
    console.log('Password change result:', result);
    
    // Check if salt changed
    const saltCheck = await checkUserSalt(email, initialSalt);
    
    if (saltCheck.changed) {
      console.error('ISSUE DETECTED: Salt changed during password update!');
      console.error('This will cause login problems after password change.');
    } else {
      console.log('SUCCESS: Salt remained the same during password update!');
    }
    
    // Try logging in with new password
    console.log(`Trying to log in with new password ${newPassword}...`);
    try {
      const newToken = await login(email, newPassword);
      console.log('Login with new password successful!');
    } catch (error) {
      console.error('Login with new password failed!');
    }
    
    // Reset back to original password
    console.log('Resetting back to original password...');
    try {
      await changePassword(token, newPassword, currentPassword);
      console.log('Password reset to original successful');
    } catch (error) {
      console.error('Failed to reset password, may need to use reset script again');
    }
    
    // Close database connection
    await sequelize.close();
    
  } catch (error) {
    console.error('Test failed:', error);
    await sequelize.close();
  }
}

// Run the test
testPasswordChange(); 