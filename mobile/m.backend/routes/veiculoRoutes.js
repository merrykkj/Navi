import express from 'express';
import { getVeiculoByIdController } from '../controllers/VeiculoController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getVeiculoByIdController);
export default router;