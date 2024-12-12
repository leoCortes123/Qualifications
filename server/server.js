import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import fileUpload from 'express-fileupload';
import mainRoutes from './routes/index.js'; 
import { authenticate, sync } from './dataBase/config/dataBase.js';

const app = express();
const port = 3001;

// Configurar body-parser con un límite de tamaño mayor
app.use(bodyParser.json({ limit: '50mb' }));

app.use(cors());

app.use('/api', mainRoutes);

// Ruta de prueba
app.get('/test', (req, res) => {
  res.send('El servidor está funcionando correctamente');
});

// Autenticar y sincronizar la base de datos
authenticate()
  .then(() => {
    console.log('Database authenticated successfully');
    return sync();
  })
  .then(() => {
    console.log('Database synchronized successfully');
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
