import express from 'express';
import { naviAdminController, naviProprietarioController } from '../controllers/NaviAskController.js'; 
import { 
    listarConversasController, 
    obterHistoricoController, 
    salvarConversaController 
} from '../controllers/ConversaNaviController.js';

import { authMiddleware, authorize } from '../middlewares/AuthMiddlewares.js'; 

const router = express.Router();

router.use(authMiddleware);

// Rota do Admin (Global)
router.post('/navi/admin/ask', authorize(['ADMINISTRADOR']), naviAdminController);

// Rota do Proprietario
router.post('/navi/proprietario/ask', authorize(['PROPRIETARIO', 'FUNCIONARIO']), naviProprietarioController);

// Rotas de persistencia 
// Para listar os metadados das conversas (Sidebar dos chats)
router.get('/conversas-navi', listarConversasController);

// Salva ou Atualiza uma conversa
router.post('/conversas-navi/salvar', salvarConversaController);

// Pega o histórico de uma conversa específica
router.get('/conversas-navi/:conversaId/historico', obterHistoricoController);

export default router;