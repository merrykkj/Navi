
import express from 'express';
import {  adicionarFuncionarioController,  listarFuncionariosController, removerFuncionarioController, atualizarPermissaoController, criarEAdicionarFuncionarioController} from '../controllers/FuncionariosController.js';
import { authMiddleware, authorize } from '../middlewares/AuthMiddlewares.js';

const router = express.Router({ mergeParams: true });

// Todas as rotas de gerenciamento de funcionários são protegidas
const permissoesDeGestao = ['PROPRIETARIO', 'ADMINISTRADOR'];
router.use(authMiddleware, authorize(permissoesDeGestao));

// Rota para listar todos os funcionários de um estacionamento
router.get('/', listarFuncionariosController);

// Rota para adicionar um novo funcionário a um estacionamento
router.post('/', adicionarFuncionarioController);

// Rota para atualizar a permissão do funcionário
router.patch('/:funcionarioId', atualizarPermissaoController);

// Rota para remover um funcionário. O ID do funcionário é passado na URL
router.delete('/:funcionarioId', removerFuncionarioController);

// Rota para criar e adicionar a um estacionamento 
router.post('/novo', criarEAdicionarFuncionarioController);

export default router;