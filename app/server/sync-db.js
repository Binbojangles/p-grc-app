const { sequelize } = require('./models');

async function syncDatabase() {
  try {
    // Force sync all models
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase(); 