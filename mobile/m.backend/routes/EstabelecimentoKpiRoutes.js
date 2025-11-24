// src/routes/EstabelecimentoKpiRoutes.js

import express from 'express';
import { getEstablishmentSummaryKpis } from '../controllers/EstabelecimentoKpiController.js';
import { authMiddleware} from '../middlewares/AuthMiddlewares.js';

const router = express.Router();

router.get('/summary', authMiddleware, getEstablishmentSummaryKpis);

export default router;