// src/routes/estacionamentoRoutes.js
import express from 'express';

// --- CONTROLLERS ---
import {
    listarEstacionamentoController,  
    obterEstacionamentoPorIdController,  
    criarEstacionamentoController,  
    atualizarEstacionamentoController,
    excluirEstacionamentoController,
    listarMeusEstacionamentosController
} from '../controllers/EstacionamentoController.js';
import { listarVagasPorEstacionamentoController } from '../controllers/VagaController.js';
import { listarReservasDeEstacionamentoController } from '../controllers/ReservaController.js';
import { listarContratosDeEstacionamentoController } from '../controllers/ContratoController.js'; 
import { getDashboardProprietario } from '../controllers/RelatorioController.js';

// --- MIDDLEWARES ---
import { authMiddleware, authorize } from '../middlewares/AuthMiddlewares.js';

// --- ROTEADORES FILHOS ---
import politicaPrecoRoutes from './PoliticaPrecoRoutes.js';
import planoMensalRoutes from './PlanoMensalRoutes.js';
import avaliacaoRoutes from './AvaliacaoRoutes.js';
import funcionarioRoutes from './FuncionariosRoutes.js';
import logRoutes from './logRoutes.js';

const router = express.Router();

// --- DEFINIÇÃO DE PAPÉIS ---
const permissoesDeGestao = ['PROPRIETARIO', 'ADMINISTRADOR'];
const permissoesDeVisualizacao = ['PROPRIETARIO', 'ADMINISTRADOR', 'GESTOR', 'OPERADOR'];

// =========================================================================
//  ORDEM DE ROTAS ESTRITA: DO MAIS ESPECÍFICO PARA O MAIS GENÉRICO
// =========================================================================

// ---- 1. Rotas GET Específicas ----
router.get('/', listarEstacionamentoController); // Rota raiz (pública)
router.get('/meus', authMiddleware, authorize(permissoesDeVisualizacao), listarMeusEstacionamentosController);

// ---- 2. Rotas com ID na Raiz (/estacionamentos/:id) ----
router.get('/:id', obterEstacionamentoPorIdController); // Rota genérica com ID
router.put('/:id', authMiddleware, authorize(permissoesDeGestao), atualizarEstacionamentoController);
router.delete('/:id', authMiddleware, authorize(permissoesDeGestao), excluirEstacionamentoController);

// ---- 3. Rota de Criação ----
router.post('/', authMiddleware, authorize(permissoesDeGestao), criarEstacionamentoController);


// ---- 4. Rotas Aninhadas Diretas (um nível de profundidade) ----
router.get('/:estacionamentoId/dashboard', authMiddleware, authorize(permissoesDeVisualizacao), getDashboardProprietario);
router.get('/:estacionamentoId/vagas', authMiddleware, authorize(permissoesDeVisualizacao), listarVagasPorEstacionamentoController);
router.get('/:estacionamentoId/reservas', authMiddleware, authorize(permissoesDeGestao), listarReservasDeEstacionamentoController);
router.get('/:estacionamentoId/contratos', authMiddleware, authorize(permissoesDeGestao), listarContratosDeEstacionamentoController);


// ---- 5. Roteadores Aninhados Delegados (CRUDs completos de filhos) ----
router.use('/:estacionamentoId/politicas', politicaPrecoRoutes);
router.use('/:estacionamentoId/planos', planoMensalRoutes);
router.use('/:estacionamentoId/avaliacoes', avaliacaoRoutes);
router.use('/:estacionamentoId/funcionarios', funcionarioRoutes);
router.use('/:estacionamentoId/logs', logRoutes);

export default router;