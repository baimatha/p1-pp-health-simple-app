"use strict";
const { Model } = require("sequelize");
const { generateCode } = require("../helpers/generateCode");

module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    static associate(models) {
      Patient.belongsTo(models.User, { foreignKey: "userId" });
      Patient.hasMany(models.Appointment, { foreignKey: "patientId" });
    }
  }
  Patient.init(
    {
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      dateOfBirth: DataTypes.DATE,
      gender: DataTypes.STRING,
      patientCode: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      bloodType: DataTypes.STRING,
      height: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "Patient",
    }
  );

  Patient.afterCreate(async (patient, options) => {
    const code = generateCode("PAT", patient.id);
    await patient.update({ patientCode: code }, { transaction: options.transaction });
  });

  return Patient;
};