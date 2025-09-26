"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Patients", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dateOfBirth: Sequelize.DATE,
      gender: Sequelize.STRING,
      phone: Sequelize.STRING,
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      patientCode: {
        type: Sequelize.STRING,
        unique: true
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
    await queryInterface.dropTable("Patients");
  }
};