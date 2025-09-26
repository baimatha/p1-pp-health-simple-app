"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Patient, { foreignKey: "userId" });
      User.hasOne(models.Doctor, { foreignKey: "userId" });
      User.hasMany(models.Message, { foreignKey: "userId" });
    }

    checkPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }

  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [8] }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [["admin", "patient", "doctor"]] }
    }
  }, {
    sequelize,
    modelName: "User",
    hooks: {
      beforeCreate(user) {
        const salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(user.password, salt);
      },
      beforeUpdate(user) {
        if (user.changed("password")) {
          const salt = bcrypt.genSaltSync(10);
          user.password = bcrypt.hashSync(user.password, salt);
        }
      }
    }
  });

  return User;
};