import express from 'express';
import { 
    naviAdminController, 
    naviProprietarioController,
    naviDownloadController 
} from '../controllers/NaviAskController.js'; 

import { 
    listarConversasController, 
    obterHistoricoController, 
    salvarConversaController 
} from '../controllers/ConversaNaviController.js'; 

import { authMiddleware, authorize } from '../middlewares/AuthMiddlewares.js'; 

const router = express.Router();


router.use(authMiddleware);

// =======================================================
// 1. ROTAS DE INTERAÇÃO COM A IA
// =======================================================

// Rota Admin (Visão Global)
router.post('/navi/admin/ask', authorize(['ADMINISTRADOR']), naviAdminController);

// Rota Proprietário
router.post('/navi/proprietario/ask', authorize(['PROPRIETARIO', 'FUNCIONARIO']), naviProprietarioController);


// =======================================================
// 2. ROTAS DE PERSISTÊNCIA (HISTÓRICO)
// =======================================================

// Lista todas as conversas do usuário (para a Sidebar)
router.get('/conversas-navi', listarConversasController);

// Salva ou Atualiza uma conversa no banco
router.post('/conversas-navi/salvar', salvarConversaController);

// Obtém o histórico de uma conversa específica
router.get('/conversas-navi/:conversaId/historico', obterHistoricoController);

export default router;