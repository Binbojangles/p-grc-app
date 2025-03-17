const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    controlId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Controls',
        key: 'id'
      }
    },
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    reviewDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('compliant', 'non-compliant', 'partially-compliant'),
      allowNull: false
    },
    evidence: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    evidenceFile: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Path to uploaded evidence file'
    },
    findings: {
      type: DataTypes.TEXT
    },
    recommendations: {
      type: DataTypes.TEXT
    },
    nextReviewDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  Review.associate = (models) => {
    Review.belongsTo(models.Control, { foreignKey: 'controlId' });
    Review.belongsTo(models.User, { foreignKey: 'reviewerId' });
  };

  return Review;
}; 