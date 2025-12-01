import express from 'express';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import {getEstacionamentosController, getEstacionamentosByIdController, deleteEstacionamentoController} from '../controllers/EstacionamentoController.js';

const router = express.Router();

router.get('/', authMiddleware, getEstacionamentosController);
router.get('/:id', authMiddleware, getEstacionamentosByIdController);
router.delete('/:id', authMiddleware, deleteEstacionamentoController);

export default router