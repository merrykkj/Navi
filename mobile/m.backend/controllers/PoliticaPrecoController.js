// src/controllers/PoliticaPrecoController.js

import {
    criarOuReativarPoliticaPreco,
    listarPoliticasAtivas,
    listarPoliticasHistorico,
    obterPoliticaPorId,
    atualizarPoliticaPreco,
    desativarPoliticaPreco,
    reativarPoliticaPreco
} from "../models/PoliticaPreco.js";
import { obterEstacionamentoPorId } from "../models/Estacionamento.js";
import { politicaPrecoSchema, atualizarPoliticaPrecoSchema, politicaPrecoParamsSchema } from '../schemas/politicaPreco.schema.js';
import { registrarLog } from '../services/logServices.js';


// Função auxiliar para garantir que o usuário é admin ou o dono do estacionamento em questão.
const verificarPermissao = async (estacionamentoId, requisitante) => {
    if (!estacionamentoId || isNaN(parseInt(estacionamentoId))) return false;
    if (requisitante.papel === 'ADMINISTRADOR') return true;
    const estacionamento = await obterEstacionamentoPorId(estacionamentoId);
    if (!estacionamento || estacionamento.id_proprietario !== requisitante.id_usuario) return false;
    return true;
};

// MODIFICADO: Agora cria uma nova ou reativa e atualiza uma do histórico
export const criarPoliticaPrecoController = async (req, res) => {
    try {
        const { params } = politicaPrecoParamsSchema.parse(req);
        const { body } = politicaPrecoSchema.parse(req);
        const requisitante = req.usuario;

        const temPermissao = await verificarPermissao(params.estacionamentoId, requisitante);
        if (!temPermissao) return res.status(403).json({ message: "Acesso proibido." });
        registrarLog({
            id_usuario_acao: req.usuario.id_usuario,
            id_estacionamento: params.estacionamentoId,
            acao: 'CRIAÇÃO/REATIVAÇÃO DE POLÍTICA DE PREÇO',
            detalhes: { descricao: body.descricao }
        });

        const novaPolitica = await criarOuReativarPoliticaPreco(body, params.estacionamentoId);
        res.status(201).json({ message: "Política de preço salva com sucesso!", politica: novaPolitica });
    } catch (error) {
        if (error.name === 'ZodError') return res.status(400).json({ message: "Dados inválidos.", errors: error.flatten().fieldErrors });
        console.error("Erro ao salvar política de preço:", error);
        res.status(500).json({ message: "Erro interno ao salvar política de preço." });
    }
};

// MODIFICADO: Agora busca apenas as políticas ATIVAS. A rota é pública.
export const listarPoliticasController = async (req, res) => {
    try {
        const { params } = politicaPrecoParamsSchema.parse(req);
        const politicas = await listarPoliticasAtivas(params.estacionamentoId);
        res.status(200).json(politicas);
    } catch (error) {
        if (error.name === 'ZodError') return res.status(400).json({ message: "ID inválido." });
        console.error("Erro ao listar políticas ativas:", error);
        res.status(500).json({ message: "Erro interno." });
    }
};

// NOVA FUNÇÃO: Rota protegida que busca apenas as políticas INATIVAS (histórico).
export const listarHistoricoController = async (req, res) => {
    try {
        const { params } = politicaPrecoParamsSchema.parse(req);
        const requisitante = req.usuario;
        const temPermissao = await verificarPermissao(params.estacionamentoId, requisitante);
        if (!temPermissao) return res.status(403).json({ message: "Acesso proibido." });

        const historico = await listarPoliticasHistorico(params.estacionamentoId);
        res.status(200).json(historico);
    } catch (error) {
        if (error.name === 'ZodError') return res.status(400).json({ message: "ID inválido." });
        console.error("Erro ao listar histórico:", error);
        res.status(500).json({ message: "Erro interno." });
    }
};

export const atualizarPoliticaController = async (req, res) => {
    try {
        const { params } = politicaPrecoParamsSchema.parse(req);
        const { body } = atualizarPoliticaPrecoSchema.parse(req);
        const requisitante = req.usuario;

        const politicaAlvo = await obterPoliticaPorId(params.politicaId);
        if (!politicaAlvo) return res.status(404).json({ message: "Política não encontrada." });

        const temPermissao = await verificarPermissao(politicaAlvo.id_estacionamento, requisitante);
        if (!temPermissao) return res.status(403).json({ message: "Acesso proibido." });

        const politicaAtualizada = await atualizarPoliticaPreco(params.politicaId, body);
        res.status(200).json({ message: "Política atualizada!", politica: politicaAtualizada });
    } catch (error) {
        if (error.name === 'ZodError') return res.status(400).json({ message: "Dados inválidos.", errors: error.flatten().fieldErrors });
        console.error("Erro ao atualizar política:", error);
        res.status(500).json({ message: "Erro interno." });
    }
};

// MODIFICADO: Em vez de excluir permanentemente, apenas desativa (soft delete).
export const desativarPoliticaController = async (req, res) => {
    try {
        const { params } = politicaPrecoParamsSchema.parse(req);
        const requisitante = req.usuario;

        const politicaAlvo = await obterPoliticaPorId(params.politicaId);
        if (!politicaAlvo) return res.status(404).json({ message: "Política não encontrada." });

        const temPermissao = await verificarPermissao(politicaAlvo.id_estacionamento, requisitante);
        if (!temPermissao) return res.status(403).json({ message: "Acesso proibido." });

        registrarLog({
            id_usuario_acao: req.usuario.id_usuario,
            id_estacionamento: politicaAlvo.id_estacionamento,
            acao: 'DESATIVAÇÃO DE POLÍTICA DE PREÇO',
            detalhes: { descricao: politicaAlvo.descricao }
        });

        await desativarPoliticaPreco(params.politicaId);
        res.status(204).send();
    } catch (error) {
        if (error.name === 'ZodError') return res.status(400).json({ message: "ID inválido." });
        console.error("Erro ao desativar política:", error);
        res.status(500).json({ message: "Erro interno." });
    }
};

// NOVA FUNÇÃO: Restaura uma política do histórico, tornando-a ativa.
export const restaurarPoliticaController = async (req, res) => {
    try {
        const { params } = politicaPrecoParamsSchema.parse(req);
        const requisitante = req.usuario;

        const politicaAlvo = await obterPoliticaPorId(params.politicaId);
        if (!politicaAlvo) return res.status(404).json({ message: "Política não encontrada." });

        const temPermissao = await verificarPermissao(politicaAlvo.id_estacionamento, requisitante);
        if (!temPermissao) return res.status(403).json({ message: "Acesso proibido." });

        const politicaRestaurada = await reativarPoliticaPreco(params.politicaId);
        res.status(200).json({ message: "Política restaurada!", politica: politicaRestaurada });
    } catch (error) {
        if (error.name === 'ZodError') return res.status(400).json({ message: "ID inválido." });
        console.error("Erro ao restaurar política:", error);
        res.status(500).json({ message: "Erro interno." });
    }
};