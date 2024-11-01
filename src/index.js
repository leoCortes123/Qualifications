import {sequelize} from '../config/dataBase.js'; // Importar la instancia de Sequelize
import procesRegistration  from './ReadDocuments.js'; './ReadDocuments';
import getDocumentPaths from './searchDocuments.js'; 
import fetchRegistrations from '../dataBase/obtainPending.js';



(async () => {
  try {
    // Autenticar la conexión
    await sequelize.authenticate();

    // Sincronizar el modelo con la base de datos
    await sequelize.sync(); 
    console.log('Modelo sincronizado');

    const paths = await getDocumentPaths();
    
    for (const path of paths) {
      console.log(`Documento a analizar: ${path}`);
      await procesRegistration(path);
    }

    await fetchRegistrations();


  } catch (error) {
    console.error('Error general:', error); 
  } finally {
    // Cerrar la conexión a la base de datos
    await sequelize.close();
    console.log('Conexión cerrada.');
  }
})();
