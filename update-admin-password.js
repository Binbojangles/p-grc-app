const { User, sequelize } = require('./models');
const crypto = require('crypto');

async function updateAdminPassword() {
  try {
    // Find the admin user
    const user = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Found admin user:', user.email);
    
    // Password to set
    const password = 'Admin123!';
    const salt = '0f9e2e272552ab5bcb1320f6042ff389'; // Keep the existing salt
    
    // Calculate the hash using the same method as in validatePassword
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    
    console.log('Calculated hash:', hash);
    
    // Update the user's password directly in the database
    user.password = hash;
    await user.save();
    
    console.log('Password updated successfully');
    console.log('Password:', password);
    console.log('Salt:', salt);
    console.log('Hash:', hash);
    
    // Close the database connection
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    await sequelize.close();
  }
}

updateAdminPassword(); 