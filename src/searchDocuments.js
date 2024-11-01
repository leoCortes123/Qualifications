import fs from 'fs';
import path from 'path';


// Ruta de la carpeta que deseas leer

// console.log(`path: ${process.env.SENA_PATH}`);
const directoryPath = path.join('c:/sena'); 

// Prefijo que deseas buscar
const prefix = 'logs_P_';

// Función para obtener las rutas de los documentos 
function getDocumentPaths() {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return reject(err);
      }

      // Filtrar archivos que comienzan con el prefijo
      const filteredFiles = files
        .filter(file => file.startsWith(prefix))
        .map(file => path.join(directoryPath, file)
          .replace(/\\/g, '/'));

      resolve(filteredFiles);
    });
  });
}


export default getDocumentPaths; 