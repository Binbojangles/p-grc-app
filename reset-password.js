const { User, sequelize } = require('./models');
const crypto = require('crypto');

async function resetPassword() {
  try {
    // Find the admin user
    const user = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Found admin user:', user.email);
    
    // New password to set
    const newPassword = 'Admin123!';
    
    // Generate a new salt
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Hash the password with the new salt
    const hashedPassword = crypto
      .pbkdf2Sync(newPassword, salt, 1000, 64, 'sha512')
      .toString('hex');
    
    // Update the user's password and salt
    user.password = hashedPassword;
    user.salt = salt;
    
    // Save the changes
    await user.save();
    
    console.log('Password reset successful');
    console.log('New password:', newPassword);
    console.log('New salt:', salt);
    console.log('New hashed password:', hashedPassword);
    
    // Close the database connection
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    await sequelize.close();
  }
}

resetPassword(); 