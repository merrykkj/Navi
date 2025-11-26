// src/routes/politicaPrecoRoutes.js
import express from 'express';
import {
    criarPoliticaPrecoController,
    listarPoliticasController,
    listarHistoricoController,
    atualizarPoliticaController,
    desativarPoliticaController,
    restaurarPoliticaController
} from '../controllers/PoliticaPrecoController.js';
import { authMiddleware, authorize } from '../middlewares/AuthMiddlewares.js';

const router = express.Router({ mergeParams: true }); 
const permissoesDeGestao = ['PROPRIETARIO', 'ADMINISTRADOR'];

// ---- ROTA PÚBLICA ----
// Lista apenas as políticas ATIVAS
router.get('/', listarPoliticasController);

// ---- ROTAS PROTEGIDAS ----
router.use(authMiddleware);
router.use(authorize(permissoesDeGestao));

// Cria uma nova política OU reativa/atualiza uma do histórico
router.post('/', criarPoliticaPrecoController);

// Lista as políticas INATIVAS (histórico)
router.get('/historico', listarHistoricoController);

// Atualiza os dados de uma política específica
router.put('/:politicaId', atualizarPoliticaController);

// Restaura uma política do histórico para ativa
router.patch('/:politicaId/restaurar', restaurarPoliticaController);

// DESATIVA uma política (move para o histórico)
router.delete('/:politicaId', desativarPoliticaController);

export default router;