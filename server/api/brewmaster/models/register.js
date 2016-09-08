'use strict';

module.exports = function (mysql, DataTypes) {
  return mysql.define('register', {

    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    area_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: '86'
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },

    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    links: {
      type: DataTypes.STRING,
      allowNull: true
    },
    default_project_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    domain_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    paranoid: false,
    charset: 'utf8'
  });
};
