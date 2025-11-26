
import express from 'express';
import {  criarContratoController,  listarMeusContratosController,cancelarMeuContratoController} from '../controllers/ContratoController.js';
import { authMiddleware } from '../middlewares/AuthMiddlewares.js';

const router = express.Router();

// Todas as rotas de contrato exigem autenticação.
router.use(authMiddleware);

// Rota para o usuário logado listar seus próprios contratos
router.get('/', listarMeusContratosController);

// Rota para o usuário logado criar um novo contrato para si
router.post('/', criarContratoController);

// Rota para o usuário logado cancelar um de seus contratos
router.patch('/:contratoId/cancelar', cancelarMeuContratoController);

export default router;