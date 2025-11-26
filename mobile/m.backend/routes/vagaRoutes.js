
// src/routes/vagaRoutes.js
import express from 'express';
import { listarVagasController, obterVagasPorIdController, criarVagaController, atualizarVagaController, excluirVagaController, } from '../controllers/VagaController.js';
import { authMiddleware, authorize } from '../middlewares/AuthMiddlewares.js';

const router = express.Router();

// Rotas públicas - Todos podem ver

// listar todas as vagas
router.get('/', listarVagasController);  

//listar vaga por id
router.get('/:id', obterVagasPorIdController);

// Rotas de gestão - Protegidas para PROPRIETARIO ou ADMINISTRADOR
const permissoesDeGestao = ['PROPRIETARIO', 'ADMINISTRADOR'];

//cadastrar nova vaga
router.post('/', authMiddleware, authorize(permissoesDeGestao), criarVagaController);

//atualizar nova vaga
router.put('/:id', authMiddleware, authorize(permissoesDeGestao), atualizarVagaController);

//deleta uma vaga
router.delete('/:id', authMiddleware, authorize(permissoesDeGestao), excluirVagaController);

export default router;