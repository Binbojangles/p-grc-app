const { sequelize } = require('./models');

const updateAdmin = async () => {
  try {
    // Known salt and password hash for 'Admin123!'
    const salt = '6b86b273ff34fce19d6b804eff5a3f57';
    const passwordHash = '2ac9cb7dc02b3c0083eb70898e549b63a84fe0d20a89b2d39e5f6b292c9b998f1f3c44f579d9b943d6db98ba510aac3f0dd8b782a0438a8486cce1a0a260b686';
    
    // Update admin user directly in the database
    const result = await sequelize.query(
      `UPDATE "Users" SET "salt" = :salt, "password" = :passwordHash WHERE "email" = 'admin@example.com'`,
      {
        replacements: { salt, passwordHash },
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    console.log('Admin user updated:', result);
    console.log('Email: admin@example.com');
    console.log('Password: Admin123!');
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    await sequelize.close();
  }
};

updateAdmin(); 