import express from 'express';
import { cadastroController } from '../controllers/cadastroController.js';
const router = express.Router();
router.post('/', cadastroController);

export default router;