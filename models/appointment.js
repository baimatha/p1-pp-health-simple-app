"use strict";
const {
  Model
} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.Patient, {
        foreignKey: "patientId"
      });
      Appointment.belongsTo(models.Doctor, {
        foreignKey: "doctorId"
      });
    }
  }

  Appointment.init({
    appointmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterToday(value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const minDate = new Date();
          minDate.setDate(minDate.getDate() + 1);

          if (new Date(value) < minDate) {
            throw new Error("Appointment date must be at least 1 day after today.");
          }
        }
      }
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: "Appointment",
  });

  return Appointment;
};