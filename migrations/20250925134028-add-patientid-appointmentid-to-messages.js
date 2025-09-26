"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Messages", "PatientId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Patients",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    await queryInterface.addColumn("Messages", "AppointmentId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Appointments",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Messages", "PatientId");
    await queryInterface.removeColumn("Messages", "AppointmentId");
  }
};