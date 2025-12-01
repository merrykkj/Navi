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


router.post('/navi/admin/ask', authorize(['ADMINISTRADOR']), naviAdminController);

router.post('/navi/proprietario/ask', authorize(['PROPRIETARIO', 'GESTOR', 'FUNCIONARIO']), naviProprietarioController);

router.post('/navi/download', naviDownloadController);

router.get('/conversas-navi', listarConversasController);

router.post('/conversas-navi/salvar', salvarConversaController);

router.get('/conversas-navi/:id/historico', obterHistoricoController);

export default router;