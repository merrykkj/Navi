// src/controllers/LogController.js
import * as LogModel from '../models/Log.js';
import { obterEstacionamentoPorId } from '../models/Estacionamento.js';

// Função auxiliar de permissão (você pode importá-la de outro controller se a tiver centralizado)
const verificarPermissao = async (estacionamentoId, requisitante) => {
    if (requisitante.papel === 'ADMINISTRADOR') return true;

    if (requisitante.papel === 'PROPRIETARIO') {
        const estacionamento = await obterEstacionamentoPorId(estacionamentoId);
        if (estacionamento && estacionamento.id_proprietario === requisitante.id_usuario) {
            return true;
        }
    }
    
    // Futuramente, permitir que GESTORES vejam logs
    if (requisitante.papel === 'GESTOR') {
        // Lógica para verificar se o gestor está vinculado ao estacionamento
        // const vinculo = await prisma.estacionamento_funcionario.findFirst(...)
        // if (vinculo) return true;
    }

    return false;
};

export const getLogsController = async (req, res) => {
    try {
        const { estacionamentoId } = req.params;
        const requisitante = req.usuario;
        const temPermissao = await verificarPermissao(estacionamentoId, requisitante);
        if (!temPermissao) {
            return res.status(403).json({ message: "Acesso proibido a estes logs." });
        }
        const filtros = {
            estacionamentoId: parseInt(estacionamentoId),
            dataInicio: req.query.dataInicio,
            dataFim: req.query.dataFim
        };
        const logs = await LogModel.buscarLogs(filtros);
        res.status(200).json(logs);
    } catch (error) {
        console.error("Erro ao buscar logs:", error);
        res.status(500).json({ message: "Erro interno ao buscar logs." });
    }
};