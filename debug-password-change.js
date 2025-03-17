const { User, sequelize } = require('./models');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function debugPasswordChange() {
  try {
    console.log('Starting password change debug process');
    
    // 1. Find the admin user
    const adminUser = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user found:', adminUser.id);
    console.log('Current password hash:', adminUser.password);
    console.log('Current salt:', adminUser.salt);
    
    // 2. Test the current password (should be admin123)
    const currentPassword = 'admin123';
    const currentHash = crypto
      .pbkdf2Sync(currentPassword, adminUser.salt, 1000, 64, 'sha512')
      .toString('hex');
    
    console.log('Calculated hash for current password:', currentHash);
    console.log('Does current password match?', adminUser.password === currentHash);
    
    // 3. Generate a new password hash
    const newPassword = 'NewPassword123!';
    const newHash = crypto
      .pbkdf2Sync(newPassword, adminUser.salt, 1000, 64, 'sha512')
      .toString('hex');
    
    console.log('New password hash:', newHash);
    
    // 4. Update the password directly in the database
    console.log('Updating password directly in database...');
    adminUser.password = newHash;
    await adminUser.save();
    
    // 5. Verify the update
    const updatedUser = await User.findOne({ where: { email: 'admin@example.com' } });
    console.log('Updated password hash in DB:', updatedUser.password);
    console.log('Does updated hash match new hash?', updatedUser.password === newHash);
    
    // 6. Test the validatePassword method
    console.log('Testing validatePassword with new password...');
    const isValid = updatedUser.validatePassword(newPassword);
    console.log('Is new password valid according to validatePassword?', isValid);
    
    // 7. Test the old password
    console.log('Testing validatePassword with old password...');
    const isOldValid = updatedUser.validatePassword(currentPassword);
    console.log('Is old password still valid?', isOldValid);
    
    // 8. Try to login with the API
    try {
      console.log('Attempting to login with new password via API...');
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'admin@example.com',
        password: newPassword
      });
      console.log('Login successful:', response.status === 200);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('Login failed:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    console.log('Debug process completed');
  } catch (error) {
    console.error('Error during debug process:', error);
  } finally {
    await sequelize.close();
  }
}

debugPasswordChange(); 