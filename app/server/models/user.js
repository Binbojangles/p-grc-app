const { DataTypes } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'user'),
      defaultValue: 'user'
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    salt: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  // Hash password before saving
  User.beforeCreate(async (user) => {
    user.salt = crypto.randomBytes(16).toString('hex');
    user.password = crypto
      .pbkdf2Sync(user.password, user.salt, 1000, 64, 'sha512')
      .toString('hex');
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      user.salt = crypto.randomBytes(16).toString('hex');
      user.password = crypto
        .pbkdf2Sync(user.password, user.salt, 1000, 64, 'sha512')
        .toString('hex');
    }
  });

  // Method to validate password
  User.prototype.validatePassword = function(password) {
    const hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
      .toString('hex');
    return this.password === hash;
  };

  // Method to set password
  User.prototype.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
      .toString('hex');
  };

  // Define associations
  User.associate = (models) => {
    User.hasMany(models.Task, {
      foreignKey: 'assignedTo',
      as: 'assignedTasks'
    });
    
    User.hasMany(models.Review, {
      foreignKey: 'reviewerId',
      as: 'reviews'
    });
  };

  return User;
}; 