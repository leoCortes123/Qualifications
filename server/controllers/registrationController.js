import nodemon from 'nodemon';
import { getNotQualified } from '../dataBase/RegistrationDB.js';
import  Registration  from '../dataBase/models/Registration.js';
import  User  from '../dataBase/models/User.js';


export const getRegistration = async (req, res) => {

  try {
    
    const regist = await getNotQualified();
    //const regist = await Registration.findAll();
    res.status(200).json(regist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadRegistration = async (req, res) => {
  try {
    
    let rows = [];
    const data = req.body;
    const group = req.headers['group'];
    let totalRows = 0;
    
    
    // Validar si el JSON es un arreglo
    if (Array.isArray(data)) {
      
      // const transaction = await sequelize.transaction(); // Iniciar transacción
      for (const element of data) {

        const { contextodelevento, substate, date, time, user, userAfected } = element;
        const { ga, aa, ev, code } = parseActivity(contextodelevento);
        
        const userVerif = await getOrCreateUser(user);
        const userAfectedVerif = userAfected !== '-' ? await getOrCreateUser(userAfected) : null;

        const exist = await Registration.findOne({ where: { date: date, time: time, group: group, ga: ga, aa: aa, ev: ev, code: code, substate : substate} });

        if (exist) {
          continue;
        }

        // Crear registro en la tabla Registration
        const row = {
          date: date,
          time: time,
          group: group,
          ga: ga,
          aa: aa,
          ev: ev,
          code: code,
          contextodelevento: contextodelevento,
          idUser: userVerif.id,
          idUserAfected: userAfectedVerif ? userAfectedVerif.id : null,
          substate: substate // se ha calificado = 1, se ha enviado = 2
        };

        rows.push(row);
        await Registration.create(row);
        totalRows ++;
      }

    };
    //await transaction.commit(); // Confirmar la transacción si todo sale bien
    console.log('_________Transacción Completada ________');
    res.status(201).json({
      message: `Se han registrado ${totalRows} registros`,
      created: rows
    });
  } catch (error) {
    console.log(`uploadRegistration error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};  


const parseActivity = (contextodelevento) => {
  const regex = /GA(\d{1,2})-(\d{9})-AA(\d{1,2})-EV(\d{1,2})/i;
  const match = contextodelevento.match(regex);
  if (match) {
    return {
      ga: match[1],
      code: match[2],
      aa: match[3],
      ev: match[4]
    };
  } else {
    throw new Error('Invalid code format');
  }
};


// Función para validar o crear un usuario
const getOrCreateUser = async (nombre) => {
  try {
    let user = await User.findOne({ where: { name: nombre }});
    if (!user) {
      user = await User.create({ name: nombre });
    }
    return user;
  } catch (error) {
    console.error(`Error creando usuario: ${error}`);
    throw error;
  }
};

