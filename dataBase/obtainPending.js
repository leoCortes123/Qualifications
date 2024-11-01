import path from 'path';
import fs from 'fs';
import * as csv from 'csv';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import { Op, literal } from '../config/dataBase.js';

const directoryPath = path.join('c:/sena'); 


const fetchRegistrations = async () => {
  try {

    const results = await Registration.findAll({
      attributes: [
        'id',
        'date',
        'group',
        'activity',
        'idUser',
        'idUserAfected',
        'substate'
      ],
      include: [
        {
          model: User,
          as: 'user', // Alias del usuario creador de la inscripción
          attributes: ['name'],
        },
        {
          model: User,
          as: 'affectedUser', // Alias del usuario afectado
          attributes: ['name'],
        },
      ],
      where: {
        substate: 2,
        activity: {
          [Op.and]: [
            { [Op.like]: 'ga%' },
            { [Op.like]: '%220501096%' }
          ],
        },
        // Subconsulta para la fecha máxima
        date: {
          [Op.eq]: literal(`(
            SELECT MAX(e2.date)
            FROM registrations AS e2
            WHERE e2."group" = Registration."group"
              AND e2.activity = Registration.activity
              AND e2.idUser = Registration.idUser
          )`),
        },
        // Usar NOT EXISTS mediante un literal
        [Op.and]: [
          literal(`NOT EXISTS (
            SELECT 1
            FROM registrations AS e3
            WHERE e3."group" = Registration."group"
              AND e3.activity = Registration.activity
              AND e3.idUserAfected = Registration.idUser
              AND e3.substate = 1
              AND e3.date >= Registration.date
          )`),
          literal('SUBSTR(activity, 3, 1) IN (\'6\', \'7\', \'8\', \'9\', \'10\')')
        ]
      },
      order: [
        ['group', 'ASC'],
        ['activity', 'ASC'],
        ['date', 'DESC'],
        ['idUser', 'ASC'],
      ],
    });



    // Preparar datos para CSV
    const csvData = results.map(registration => ({
      id: registration.id,
      date: registration.date,
      group: registration.group,
      activity: registration.activity,
      idUser: registration.idUser,
      userName: registration.user ? registration.user.name : 'No User',
      idUserAfected: registration.idUserAfected,
      affectedUserName: registration.affectedUser ? registration.affectedUser.name : 'No Affected User',
      substate: registration.substate,
    }));

    // Crear un flujo de escritura para el archivo CSV
    const writeStream = fs.createWriteStream(`${directoryPath}/registrations.csv`);

    // Convertir datos a CSV y escribir en el archivo
    csv.stringify(csvData, {
      header: true,
      columns: {
        id: 'ID',
        date: 'Date',
        group: 'Group',
        activity: 'Activity',
        idUser: 'User ID',
        userName: 'User Name',
        idUserAfected: 'Affected User ID',
        affectedUserName: 'Affected User Name',
        substate: 'Substate',
      },
    })
      .pipe(writeStream);

    writeStream.on('finish', () => {
      console.log('CSV file created successfully!');
    });
    -
    writeStream.on('error', (err) => {
      console.error('Error writing to CSV:', err);
    });

    return results;
  } catch (error) {
    console.error('Error fetching registrations:', error);
  }
};

export default fetchRegistrations;
