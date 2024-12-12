import express from 'express';
import registrationsRoutes from './registrationRoutes.js';

const router = express.Router();

router.use('/registrations', registrationsRoutes);

export default router;