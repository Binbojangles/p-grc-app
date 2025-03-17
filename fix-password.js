const { User, sequelize } = require('./models');
const crypto = require('crypto');

async function fixPassword() {
  try {
    // Find the admin user
    const user = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Found admin user:', user.email);
    console.log('Current salt:', user.salt);
    console.log('Current password hash:', user.password);
    
    // Password to set - this is what you want to use to login
    const password = 'password';
    
    // Keep the existing salt
    const salt = user.salt;
    
    // Hash the password with the existing salt
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    
    console.log('Calculated hash for "password":', hashedPassword);
    
    // Update the user's password directly in the database
    await sequelize.query(
      `UPDATE "Users" SET "password" = :password WHERE "email" = :email`,
      {
        replacements: { 
          password: hashedPassword,
          email: 'admin@example.com'
        },
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    console.log('Password updated successfully');
    console.log('New password: "password"');
    console.log('Salt (unchanged):', salt);
    console.log('New hashed password:', hashedPassword);
    
    // Close the database connection
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    await sequelize.close();
  }
}

fixPassword(); 