import express from 'express';
import { login, EsqueceuSenha, ResetarSenha } from '../controllers/AuthController.js';

const router = express.Router();

router.post('/login', login);
router.post('/esqueceu-senha', EsqueceuSenha);
router.post('/resetar-senha/:token', ResetarSenha);

export default router;