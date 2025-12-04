import express from 'express';
import { getVeiculoByIdController, putVeiculoController } from '../controllers/VeiculoController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getVeiculoByIdController);
router.put('/', authMiddleware, putVeiculoController);
export default router;