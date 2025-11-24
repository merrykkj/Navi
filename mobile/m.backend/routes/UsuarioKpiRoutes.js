import express from 'express';
import { getUserSummaryKpis } from '../controllers/UsuarioKpiController.js';
import { authMiddleware } from '../middlewares/AuthMiddlewares.js';


const router = express.Router();

// Rota protegida por autenticação e autorização de ADMIN
router.get('/summary', authMiddleware, getUserSummaryKpis);

export default router;