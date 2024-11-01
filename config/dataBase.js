import { Sequelize, DataTypes, Op, literal } from 'sequelize';
import path from 'path';

const databasePath = path.resolve('./dataBase/dataBase.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: databasePath 
});

export const authenticate = () => sequelize.authenticate();
export const sync = () => sequelize.sync();
export const close = () => sequelize.close();

export { sequelize, Op, DataTypes, literal };