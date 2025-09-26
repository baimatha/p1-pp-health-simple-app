"use strict";
const {
  Model
} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {

      Message.belongsTo(models.User, {
        foreignKey: "userId"
      });
      Message.belongsTo(models.Patient, {
        foreignKey: "PatientId"
      });
      Message.belongsTo(models.Appointment, {
        foreignKey: "AppointmentId"
      });
    }
  }

  Message.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    PatientId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    AppointmentId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: "Message",
  });

  return Message;
};