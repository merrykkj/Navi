import { criarAvaliacao, listarAvaliacoesPorEstacionamento, obterAvaliacaoPorId, atualizarAvaliacao, excluirAvaliacao } from "../models/Avaliacao.js";
import { criarAvaliacaoSchema, atualizarAvaliacaoSchema } from "../schemas/avaliacao.schema.js";
import prisma from "../config/prisma.js";

export const criarAvaliacaoController = async (req, res) => {
    try {
        const { estacionamentoId } = req.params;
        const { body } = criarAvaliacaoSchema.parse(req);
        const requisitanteId = req.usuario.id_usuario;

        const avaliacaoExistente = await prisma.avaliacao.findFirst({
            where: {
                id_estacionamento: parseInt(estacionamentoId),
                id_usuario: requisitanteId,
            },
        });
        if (avaliacaoExistente) {
            return res.status(409).json({ message: "Conflito: Você já avaliou este estacionamento." });
        }

        const novaAvaliacao = await criarAvaliacao(body, requisitanteId, estacionamentoId);
        res.status(201).json({ message: "Avaliação publicada com sucesso!", avaliacao: novaAvaliacao });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }
        console.error("Erro ao criar avaliação:", error);
        res.status(500).json({ message: "Erro interno ao criar avaliação." });
    }
};

export const listarAvaliacoesController = async (req, res) => {
    try {
        const { estacionamentoId } = req.params;
        const avaliacoes = await listarAvaliacoesPorEstacionamento(estacionamentoId);
        res.status(200).json(avaliacoes);
    } catch (error) {
        console.error("Erro ao listar avaliações:", error);
        res.status(500).json({ message: "Erro interno ao listar avaliações." });
    }
};

export const atualizarAvaliacaoController = async (req, res) => {
    try {
        const { avaliacaoId } = req.params;
        const { body } = atualizarAvaliacaoSchema.parse(req);
        const requisitante = req.usuario;

        const avaliacaoAlvo = await obterAvaliacaoPorId(avaliacaoId);
        if (!avaliacaoAlvo) {
            return res.status(404).json({ message: "Avaliação não encontrada." });
        }
        if (avaliacaoAlvo.id_usuario !== requisitante.id_usuario && requisitante.papel !== 'ADMINISTRADOR') {
            return res.status(403).json({ message: "Acesso proibido. Você não pode alterar esta avaliação." });
        }

        const avaliacaoAtualizada = await atualizarAvaliacao(avaliacaoId, body);
        res.status(200).json({ message: "Avaliação atualizada com sucesso!", avaliacao: avaliacaoAtualizada });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }
        console.error("Erro ao atualizar avaliação:", error);
        res.status(500).json({ message: "Erro interno ao atualizar avaliação." });
    }
};

export const excluirAvaliacaoController = async (req, res) => {
    try {
        const { avaliacaoId } = req.params;
        const requisitante = req.usuario;

        const avaliacaoAlvo = await obterAvaliacaoPorId(avaliacaoId);
        if (!avaliacaoAlvo) {
            return res.status(404).json({ message: "Avaliação não encontrada." });
        }
        if (avaliacaoAlvo.id_usuario !== requisitante.id_usuario && requisitante.papel !== 'ADMINISTRADOR') {
            return res.status(403).json({ message: "Acesso proibido. Você не pode excluir esta avaliação." });
        }
        
        await excluirAvaliacao(avaliacaoId);
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao excluir avaliação:", error);
        res.status(500).json({ message: "Erro interno ao excluir avaliação." });
    }
};