const Sequelize = require("sequelize");

module.exports = function(sequelize, db) {
  return sequelize.define("prism_submission", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: { type: Sequelize.STRING, allowNull: false },
    lastName: { type: Sequelize.STRING, allowNull: false },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    jobTitle: { type: Sequelize.STRING, allowNull: true },
    company: { type: Sequelize.STRING, allowNull: false },
    country: { type: Sequelize.STRING, allowNull: true },
    state: { type: Sequelize.STRING, allowNull: true },
    reason: { type: Sequelize.STRING, allowNull: true },
    otherReason: { type: Sequelize.STRING, allowNull: true },
    tellUsMore: { type: Sequelize.TEXT, allowNull: true },
    consent: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    expiresAt: { type: Sequelize.DATE, allowNull: true },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    tableName: "prism_submissions",
    timestamps: false
  });
};
