// src/routes/logRoutes.js
import express from 'express';
import { getLogsController } from '../controllers/LogController.js';
import { authMiddleware, authorize } from '../middlewares/AuthMiddlewares.js';
    
const router = express.Router({ mergeParams: true });
    
const permissoesDeVisualizacao = ['PROPRIETARIO', 'ADMINISTRADOR', 'GESTOR'];

// GET /estacionamentos/:estacionamentoId/logs
router.get('/', authMiddleware, authorize(permissoesDeVisualizacao), getLogsController);

export default router;