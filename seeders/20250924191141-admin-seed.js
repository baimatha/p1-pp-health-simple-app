"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("admin123", salt);

    await queryInterface.bulkInsert("Users", [{
      username: "SuperAdmin",
      email: "admin@mail.com",
      password: hash,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", {
      email: "admin@mail.com"
    }, {});
  }
};