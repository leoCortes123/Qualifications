import { DataTypes } from 'sequelize';
import {sequelize} from '../config/dataBase.js'; 
import User from './User.js';

const Registration = sequelize.define('Registration', {
  date: {
    type: DataTypes.DATEONLY,
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
  activity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  substate: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'registrations',
  timestamps: false,
});

Registration.belongsTo(User, { as: 'user', foreignKey: 'idUser' });
Registration.belongsTo(User, { as: 'affectedUser', foreignKey: 'idUserAfected' });

export default Registration;
