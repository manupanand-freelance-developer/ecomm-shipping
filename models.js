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

const City = sequelize.define('City', {
  uuid: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING,
    field: 'country_code',
  },
  city: DataTypes.STRING,
  name: DataTypes.STRING,
  region: DataTypes.STRING,
  latitude: DataTypes.DOUBLE,
  longitude: DataTypes.DOUBLE,
}, {
  tableName: 'cities',
  timestamps: false,
});

const Code = sequelize.define('Code', {
  uuid: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  code: DataTypes.STRING,
  name: DataTypes.STRING,
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
