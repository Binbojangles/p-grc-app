const { User, sequelize } = require('./models');
const crypto = require('crypto');

async function resetAdminPassword() {
  try {
    // Find the admin user
    const user = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Found admin user:', user.email);
    
    // Default password
    const password = 'admin123';
    
    // Keep the existing salt or generate a new one if none exists
    const salt = user.salt || crypto.randomBytes(16).toString('hex');
    
    // Hash the password with the salt
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    
    // Update the user's password and salt
    user.password = hashedPassword;
    if (!user.salt) {
      user.salt = salt;
    }
    
    // Save the changes - we're using save() since we fixed the beforeUpdate hook
    await user.save();
    
    console.log('Password reset successful');
    console.log('New password:', password);
    console.log('Salt:', user.salt);
    console.log('Hashed password:', hashedPassword);
    
    // Close the database connection
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    await sequelize.close();
  }
}

resetAdminPassword(); 