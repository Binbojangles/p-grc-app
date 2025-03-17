const { User, sequelize } = require('./models');
const crypto = require('crypto');

async function fixUserPassword() {
  try {
    const user = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Found admin user:', user.email);
    console.log('Current password hash:', user.password);
    console.log('Current salt:', user.salt);
    
    // Generate new salt and password hash
    const password = 'admin123';
    
    // Keep the existing salt
    const salt = user.salt;
    
    // Generate password hash
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
      
    console.log('Generated hash for password:', hash);
    
    // Update the password directly in the database to bypass any hooks
    await sequelize.query(
      `UPDATE "Users" SET password = :password WHERE email = :email`,
      {
        replacements: {
          password: hash,
          email: 'admin@example.com'
        },
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    console.log('Password updated successfully!');
    
    // Verify the update
    const updatedUser = await User.findOne({ where: { email: 'admin@example.com' } });
    console.log('Updated password hash:', updatedUser.password);
    
    // Test password validation
    const testHash = crypto
      .pbkdf2Sync(password, updatedUser.salt, 1000, 64, 'sha512')
      .toString('hex');
    
    console.log('Test hash matches stored hash:', testHash === updatedUser.password);
    
    // Close the database connection
    await sequelize.close();
  } catch (error) {
    console.error('Error fixing user password:', error);
    await sequelize.close();
  }
}

fixUserPassword(); 