const { User, sequelize } = require('./models');
const crypto = require('crypto');

const createAdmin = async () => {
  try {
    // Generate salt and hash password
    const salt = crypto.randomBytes(16).toString('hex');
    const password = 'Admin123!';
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    
    // Create new admin user
    const newAdmin = await User.create({
      email: 'admin2@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      active: true,
      salt: salt
    });
    
    console.log('New admin user created:');
    console.log('Email: admin2@example.com');
    console.log('Password: Admin123!');
    console.log('Salt:', salt);
    console.log('Hashed Password:', hashedPassword);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await sequelize.close();
  }
};

createAdmin(); 