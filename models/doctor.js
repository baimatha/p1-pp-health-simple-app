"use strict";
const {
  Model
} = require("sequelize");
const {
  generateCode
} = require("../helpers/generateCode");

module.exports = (sequelize, DataTypes) => {
  class Doctor extends Model {
    static associate(models) {
      Doctor.belongsTo(models.User, {
        foreignKey: "userId"
      });
      Doctor.hasMany(models.Appointment, {
        foreignKey: "doctorId"
      });
    }
  }

  Doctor.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    specialty: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[0-9+\-()\s]*$/i
      }
    },
    license_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    doctorCode: DataTypes.STRING,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: "Doctor"
  });

  Doctor.afterCreate(async (doctor, options) => {
    const code = generateCode("DOC", doctor.id);
    await doctor.update({
      doctorCode: code
    }, {
      transaction: options.transaction
    });
  });

  return Doctor;
};