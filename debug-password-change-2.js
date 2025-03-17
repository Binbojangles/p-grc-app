const { User, sequelize } = require('./models');
const crypto = require('crypto');

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
    
    // 4. Check if changed method works as expected
    console.log('Before setting password, is password changed?', adminUser.changed('password'));
    
    // Set the password directly
    adminUser.password = newPassword;
    
    console.log('After setting password, is password changed?', adminUser.changed('password'));
    console.log('Current password value:', adminUser.password);
    
    // 5. Update using direct SQL to bypass hooks
    console.log('Updating password directly in database using SQL...');
    await sequelize.query(
      'UPDATE "Users" SET password = :password WHERE email = :email',
      {
        replacements: { 
          password: newHash,
          email: 'admin@example.com'
        },
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    // 6. Verify the update
    const updatedUser = await User.findOne({ where: { email: 'admin@example.com' } });
    console.log('Updated password hash in DB:', updatedUser.password);
    console.log('Does updated hash match new hash?', updatedUser.password === newHash);
    
    // 7. Test the validatePassword method
    console.log('Testing validatePassword with new password...');
    const isValid = updatedUser.validatePassword(newPassword);
    console.log('Is new password valid according to validatePassword?', isValid);
    
    console.log('Debug process completed');
  } catch (error) {
    console.error('Error during debug process:', error);
  } finally {
    await sequelize.close();
  }
}

debugPasswordChange(); 