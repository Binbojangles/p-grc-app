const { User, sequelize } = require('./models');
const crypto = require('crypto');

async function checkUser() {
  try {
    const user = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User details:');
    console.log('Email:', user.email);
    console.log('Password:', user.password);
    console.log('Salt:', user.salt);
    console.log('Role:', user.role);
    console.log('Active:', user.active);
    
    // Test if admin123 validates 
    const testPassword = 'admin123';
    const hash1 = crypto
      .pbkdf2Sync(testPassword, user.salt, 1000, 64, 'sha512')
      .toString('hex');
    console.log('\nTesting password "admin123":');
    console.log('Calculated hash:', hash1);
    console.log('Matches stored password:', hash1 === user.password);

    // Test if NewPassword123! validates
    const testPassword2 = 'NewPassword123!';
    const hash2 = crypto
      .pbkdf2Sync(testPassword2, user.salt, 1000, 64, 'sha512')
      .toString('hex');
    console.log('\nTesting password "NewPassword123!":');
    console.log('Calculated hash:', hash2);
    console.log('Matches stored password:', hash2 === user.password);
    
    // Close the database connection
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    await sequelize.close();
  }
}

checkUser(); 