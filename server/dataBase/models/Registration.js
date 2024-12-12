import { DataTypes } from 'sequelize';
import {sequelize} from '../config/dataBase.js'; 
import User from './User.js';
import moment from 'moment';

const Registration = sequelize.define('Registration', {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  group: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  idUser: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  idUserAfected: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id',
    },
  },
  ga: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  aa: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ev: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  code: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  substate: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  contextodelevento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'registrations',
  timestamps: false,
});

Registration.belongsTo(User, { as: 'user', foreignKey: 'idUser' });
Registration.belongsTo(User, { as: 'affectedUser', foreignKey: 'idUserAfected' });

export default Registration;
