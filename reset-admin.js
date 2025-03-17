const { User, sequelize } = require('./models');
const crypto = require('crypto');

const resetAdmin = async () => {
  try {
    // Find admin user
    const admin = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!admin) {
      console.log('Admin user not found');
      return;
    }
    
    // Generate new salt and password
    const salt = crypto.randomBytes(16).toString('hex');
    const password = 'Admin123!';
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    
    // Update admin user
    admin.salt = salt;
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('Admin password reset successfully');
    console.log('Email: admin@example.com');
    console.log('Password: Admin123!');
    console.log('Salt:', salt);
    console.log('Hashed Password:', hashedPassword);
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
};

resetAdmin(); 