import express from 'express';
import { criarCupomController, listarCuponsController, obterCupomPorIdController,  atualizarCupomController,  desativarCupomController} from '../controllers/CupomController.js';
import { authMiddleware, authorize } from '../middlewares/AuthMiddlewares.js';

const router = express.Router();

// Middleware: exige autenticação
router.use(authMiddleware);

// Middleware: apenas administradores podem acessar
router.use(authorize(['ADMINISTRADOR']));

// Cria um novo cupom
router.post('/', criarCupomController);

// Lista todos os cupons
router.get('/', listarCuponsController);

// Obtém um cupom pelo ID
router.get('/:id', obterCupomPorIdController);

// Atualiza um cupom existente
router.put('/:id', atualizarCupomController);

// Desativa (soft delete) um cupom
router.delete('/:id', desativarCupomController);

export default router;
