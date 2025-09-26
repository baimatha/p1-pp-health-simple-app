"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Appointments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      appointmentDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: false
      },
      patientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Patients",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      doctorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Doctors",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Appointments");
  }
};