import express from 'express';
import { getRegistration, uploadRegistration } from '../controllers/registrationController.js';

const router = express.Router();


router.get('/', getRegistration);

router.post('/', uploadRegistration);




export default router;