import express from 'express';
import { obterKpisDashboardController } from '../controllers/RelatorioController.js'; 
import { authMiddleware, authorize } from '../middlewares/AuthMiddlewares.js';

const router = express.Router();

const permissoesDeDashboard = ['ADMINISTRADOR', 'PROPRIETARIO', 'GESTOR', 'OPERADOR'];

router.get('/kpis', authMiddleware, authorize(permissoesDeDashboard), obterKpisDashboardController);


export default router;