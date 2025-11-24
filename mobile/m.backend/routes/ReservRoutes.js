import express from 'express';
import { criarReservaController, listarMinhasReservasController, obterReservaPorIdController ,cancelarReservaController } from '../controllers/ReservaController.js';
import { authMiddleware } from '../middlewares/AuthMiddlewares.js';

const router = express.Router();

// Todas as rotas de reserva exigem que o usuário esteja logado
router.use(authMiddleware);

// Lista as reservas do usuário logado
router.get('/', listarMinhasReservasController);

// Cria uma nova reserva
router.post('/', criarReservaController);

// Obter uma reserva específica por ID (a permissão é verificada no controller)
router.get('/:reservaId', obterReservaPorIdController);

// Cancela uma reserva específica (a permissão é verificada no controller)
router.delete('/:reservaId', cancelarReservaController);

export default router;