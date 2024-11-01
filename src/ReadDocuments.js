import fs from 'fs';
import {sequelize}  from '../config/dataBase.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';

// Función para formatear la fecha
const formatDate = (hora) => {
  const [datePart] = hora.split(',');
  const [day, month, year] = datePart.split('/');
  return new Date(`20${year}-${month}-${day}`);
};

// Función para validar o crear un usuario
const getOrCreateUser = async (nombre, transaction) => {
  try {
    let user = await User.findOne({ where: { name: nombre }, transaction });
    if (!user) {
      user = await User.create({ name: nombre }, { transaction });
    }
    return user;
  } catch (error) {
    console.error(`Error creando usuario: ${error}`);
    throw error;
  }
};

const getGroup = (path) => {
  const groupMatch = path.match(/V_(\d+)_R/);
  const group = groupMatch ? groupMatch[1] : null;
  return group;
};


const processRegistration = async (path) => {
  console.log(`path ${path}`);
  
  const transaction = await sequelize.transaction(); // Iniciar transacción

  try {
    // Leer el archivo usando promesas
    const data = await fs.promises.readFile(path, 'utf8');
    const jsonData = JSON.parse(data)[0];

    if (Array.isArray(jsonData)) {
      for (const reg of jsonData) {
        const { hora, componente, nombreevento, contextodelevento } = reg;
        const nombrecompletodelusuario = reg.nombrecompletodelusuario.trim();
        const usuarioafectado = reg.usuarioafectado.trim();

        if (!(componente === 'Evidencia' 
          && ['Se ha enviado una entrega', 'Se ha calificado el envío.'].includes(nombreevento))) continue;

        const date = formatDate(hora);
        const group = getGroup(path);
        const activity = contextodelevento.slice(-23).trimStart();

        // Crear o validar usuarios dentro de la transacción
        const user = await getOrCreateUser(nombrecompletodelusuario, transaction);
        const userAfected = usuarioafectado !== '-' ? await getOrCreateUser(usuarioafectado, transaction) : null;

          
        // Crear registro en la tabla Registration
        const row = {
          date: date,
          group: group,
          activity: activity,
          idUser: user.id,
          idUserAfected: userAfected ? userAfected.id : null,
          substate: nombreevento === 'Se ha calificado el envío.' ? 1 : 2
        };

        await Registration.create(row, { transaction });
        
      }

      await transaction.commit(); // Confirmar la transacción si todo sale bien
      console.log('_________Transacción Completada ________');
    } else {
      throw new Error('El archivo no contiene un array válido.');
    }
  } catch (error) {
    await transaction.rollback(); // Revertir la transacción en caso de error
    console.error('Error cargando los Registros: ', error);
  }
};

export default processRegistration;
