const { Sequelize, DataTypes, Op } = require('sequelize');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'mysql';

const sequelize = new Sequelize(`mysql://shipping:Roboshop%401@${dbHost}/cities`, {
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  retry: {
    max: 10,
    match: [
      /ETIMEDOUT/,
      /ECONNRESET/,
      /EHOSTUNREACH/,
      /ECONNREFUSED/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
    ],
    backoffBase: 1000,
    backoffExponent: 1.5,
  },
});

// Model for `cities` table
const City = sequelize.define('City', {
  uuid: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  country_code: {
    type: DataTypes.STRING(2),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
}, {
  tableName: 'cities',
  timestamps: false,
});

// Model for `codes` table
const Code = sequelize.define('Code', {
  uuid: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING(2),
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'codes',
  timestamps: false,
});

module.exports = {
  sequelize,
  City,
  Code,
  Op,
};
