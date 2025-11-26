// src/routes/veiculoRoutes.js
import express from 'express';
import {criarVeiculoController, listarVeiculosController, obterVeiculoPorIdController, atualizarVeiculoController, excluirVeiculoController } from '../controllers/VeiculoController.js';
import { authMiddleware } from '../middlewares/AuthMiddlewares.js';

const router = express.Router();

// O middleware de autenticação é aplicado a TODAS as rotas de veículos.
// O usuário deve estar logado para qualquer ação.
router.use(authMiddleware);

// Rota para listar os veículos do usuário logado.
router.get('/', listarVeiculosController);

// Rota para cadastrar um novo veículo para o usuário logado.
router.post('/', criarVeiculoController);

// Rotas para uma ação em um veículo específico (obter, atualizar, excluir).
router.get('/:id', obterVeiculoPorIdController);
router.put('/:id', atualizarVeiculoController);
router.delete('/:id', excluirVeiculoController);

export default router;