const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    controlId: {
      type: DataTypes.UUID,
      references: {
        model: 'Controls',
        key: 'id'
      }
    },
    assignedTo: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    assignedDate: {
      type: DataTypes.DATE
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'in-progress', 'completed', 'overdue'),
      defaultValue: 'pending'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, { foreignKey: 'assignedTo' });
    Task.belongsTo(models.Control, { foreignKey: 'controlId' });
  };

  return Task;
}; 