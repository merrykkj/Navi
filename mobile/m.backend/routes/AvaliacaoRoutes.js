
import express from 'express';
import {  criarAvaliacaoController,  listarAvaliacoesController,  atualizarAvaliacaoController,   excluirAvaliacaoController} from '../controllers/AvaliacaoController.js';
import { authMiddleware } from '../middlewares/AuthMiddlewares.js';

const router = express.Router({ mergeParams: true }); 

// Rota pública para listar as avaliações de um estacionamento
router.get('/', listarAvaliacoesController);

// A partir daqui, todas as rotas exigem que o usuário esteja logado.
router.use(authMiddleware);

// Rota para um usuário autenticado postar uma avaliação
router.post('/', criarAvaliacaoController);

// Rotas para o autor da avaliação (ou um admin) atualizar ou excluir
router.put('/:avaliacaoId', atualizarAvaliacaoController);
router.delete('/:avaliacaoId', excluirAvaliacaoController);

export default router;