"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Patients", "bloodType", {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Patients", "height", {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Patients", "bloodType");
    await queryInterface.removeColumn("Patients", "height");
  }
};
