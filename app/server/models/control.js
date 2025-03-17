const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Control = sequelize.define('Control', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    controlId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    requirements: {
      type: DataTypes.TEXT
    },
    guidance: {
      type: DataTypes.TEXT
    },
    implementationStatus: {
      type: DataTypes.ENUM('not-implemented', 'partially-implemented', 'implemented', 'not-applicable'),
      defaultValue: 'not-implemented'
    },
    reviewFrequency: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'semi-annually', 'annually'),
      defaultValue: 'annually'
    },
    nextReviewDate: {
      type: DataTypes.DATE
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isIn: [[1, 2]]
      }
    }
  }, {
    timestamps: true
  });

  Control.associate = (models) => {
    Control.hasMany(models.Task, { foreignKey: 'controlId' });
    Control.hasMany(models.Review, { foreignKey: 'controlId' });
  };

  return Control;
}; 