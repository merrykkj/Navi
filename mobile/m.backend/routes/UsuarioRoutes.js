import express from 'express';
import { listarUsuariosController,  obterUsuarioPorIdController,  criarUsuarioController,  atualizarUsuarioController, excluirUsuarioController} from '../controllers/UsuarioController.js';
import { authMiddleware, authorize } from '../middlewares/AuthMiddlewares.js';

const router = express.Router();

// Rota de Cadastro - PÚBLICA
router.post('/cadastro', criarUsuarioController);

// Apenas ADMINISTRADOR pode listar todos os usuários
router.get('/', authMiddleware, authorize(['ADMINISTRADOR']), listarUsuariosController);

// Apenas ADMINISTRADOR pode buscar um usuário específico por ID
router.get('/:id', authMiddleware, authorize(['ADMINISTRADOR']), obterUsuarioPorIdController);

// Para atualizar, o usuário só precisa estar LOGADO. O controller decide se ele tem permissão.
// ROTA PUT (Atualização completa)
router.put('/:id', authMiddleware, atualizarUsuarioController);

// 🚨 ROTA PATCH ADICIONADA (Para Atualização Parcial, como status 'ativo' ou 'papel')
router.patch('/:id', authMiddleware, atualizarUsuarioController);

// Para excluir, o usuário só precisa estar LOGADO. O controller decide a permissão.
router.delete('/:id', authMiddleware, excluirUsuarioController);

export default router;