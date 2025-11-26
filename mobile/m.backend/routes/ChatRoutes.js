// backend/routes/ChatRoutes.js

import express from 'express';
import { upload } from '../middlewares/upload.js';

import {
    iniciarChatController,
    listarMeusChatsController,
    listarMensagensController,
    enviarMensagemController
} from '../controllers/ChatController.js';

import { authMiddleware } from '../middlewares/AuthMiddlewares.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/iniciar', iniciarChatController);

router.get('/', listarMeusChatsController);

router.get('/:id/mensagens', listarMensagensController);

router.post(
    '/:id/mensagens',
    upload.array("anexos", 5), // 👈 até 10 arquivos por mensagem
    enviarMensagemController
);

export default router;
