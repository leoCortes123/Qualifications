import {sequelize} from './config/dataBase.js'; // Asegúrate de importar sequelize correctamente

export const getNotQualified = async () => {
  try {
    const results = await sequelize.query(`
        SELECT
            e.id,
            e.date,
            e.time,
            e."group",
            e.ga,
            e.aa,
            e.ev,
            e.code,
            e.contextodelevento,
            e.idUser,
            u.name AS userName,
            e.idUserAfected,
            ua.name AS affectedUserName,
            e.substate
        FROM registrations e
        JOIN users u ON u.id = e.idUser
        LEFT JOIN users ua ON ua.id = e.idUserAfected
        WHERE
            e.substate = 2
            AND e.date = (
                SELECT MAX(e2.date)
                FROM registrations e2
                WHERE e2."group" = e."group"
                    AND e2.ga = e.ga
                    AND e2.aa = e.aa
                    AND e2.ev = e.ev 
                    AND e2.code = e.code
                    AND e2.idUser = e.idUser
            )
            AND NOT EXISTS (
                SELECT 1
                FROM registrations e3
                WHERE e3."group" = e."group"
                  AND e3.ga = e.ga
                  AND e3.aa = e.aa
                  AND e3.ev = e.ev
                  AND e3.code = e.code
                  AND e3.idUserAfected = e.idUser
                  AND e3.substate = 1
                  AND e3.date >= e.date
            )
        ORDER BY e."group", e.ga, e.aa, e.ev, e.code ,e.date, e.time DESC, e.idUser;
      `, {
      type: sequelize.QueryTypes.SELECT
    });
  
    const jsonResults = JSON.stringify(results);
  
      
    return jsonResults;
  } catch (error) {
    console.error('Error fetching registrations:', error);
  }
};