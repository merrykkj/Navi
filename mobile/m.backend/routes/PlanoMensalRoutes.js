// src/routes/planoMensalRoutes.js
import express from 'express';
import {
    criarPlanoMensalController,
    listarPlanosController,
    atualizarPlanoController,
    excluirPlanoController
} from '../controllers/PlanoMensalController.js';
import { authMiddleware, authorize } from '../middlewares/AuthMiddlewares.js';

const router = express.Router({ mergeParams: true });

// Apenas proprietários e admins podem gerenciar planos
const permissoesDeGestao = ['PROPRIETARIO', 'ADMINISTRADOR'];

// Rota pública para listar os planos de um estacionamento
router.get('/', listarPlanosController);

// Rotas protegidas para criar, atualizar e excluir planos
router.post('/', authMiddleware, authorize(permissoesDeGestao), criarPlanoMensalController);
router.put('/:planoId', authMiddleware, authorize(permissoesDeGestao), atualizarPlanoController);
router.delete('/:planoId', authMiddleware, authorize(permissoesDeGestao), excluirPlanoController);

export default router;