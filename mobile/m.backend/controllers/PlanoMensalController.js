// src/controllers/PlanoMensalController.js

import { criarPlanoMensal, listarPlanosPorEstacionamento, obterPlanoPorId, atualizarPlanoMensal, excluirPlanoMensal } from "../models/PlanoMensal.js";
import { obterEstacionamentoPorId } from "../models/Estacionamento.js";
import { criarPlanoMensalSchema, atualizarPlanoMensalSchema } from "../schemas/planoMensal.schema.js";
import prisma from "../config/prisma.js";

// --- Função auxiliar de permissão ---
const verificarPermissao = async (estacionamentoId, requisitante) => {
    if (requisitante.papel === 'ADMINISTRADOR') return true;
    const estacionamento = await obterEstacionamentoPorId(estacionamentoId);
    if (!estacionamento || estacionamento.id_proprietario !== requisitante.id_usuario) {
        return false;
    }
    return true;
};


// --- CRUD Controllers ---
export const criarPlanoMensalController = async (req, res) => {
    try {
        const { estacionamentoId } = req.params;
        const { body } = criarPlanoMensalSchema.parse(req);
        const requisitante = req.usuario;

        const temPermissao = await verificarPermissao(estacionamentoId, requisitante);
        if (!temPermissao) {
            return res.status(403).json({ message: "Acesso proibido. Você não gerencia este estacionamento." });
        }

        const novoPlano = await criarPlanoMensal(body, estacionamentoId);
        res.status(201).json({ message: "Plano mensal criado com sucesso!", plano: novoPlano });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Conflito: Já existe um plano com este nome para o estacionamento." });
        }
        console.error("Erro ao criar plano mensal:", error);
        res.status(500).json({ message: "Erro interno ao criar plano mensal." });
    }
};

export const listarPlanosController = async (req, res) => {
    try {
        const { estacionamentoId } = req.params;
        const planos = await listarPlanosPorEstacionamento(estacionamentoId);
        res.status(200).json(planos);
    } catch (error) {
        console.error("Erro ao listar planos:", error);
        res.status(500).json({ message: "Erro interno ao listar planos." });
    }
};

export const atualizarPlanoController = async (req, res) => {
    try {
        const { planoId } = req.params;
        const { body } = atualizarPlanoMensalSchema.parse(req);
        const requisitante = req.usuario;

        const planoAlvo = await obterPlanoPorId(planoId);
        if (!planoAlvo) {
            return res.status(404).json({ message: "Plano mensal não encontrado." });
        }

        const temPermissao = await verificarPermissao(planoAlvo.id_estacionamento, requisitante);
        if (!temPermissao) {
            return res.status(403).json({ message: "Acesso proibido. Você не pode alterar este plano." });
        }

        const planoAtualizado = await atualizarPlanoMensal(planoId, body);
        res.status(200).json({ message: "Plano mensal atualizado com sucesso!", plano: planoAtualizado });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }
        console.error("Erro ao atualizar plano:", error);
        res.status(500).json({ message: "Erro interno ao atualizar plano." });
    }
};

export const excluirPlanoController = async (req, res) => {
    try {
        const { planoId } = req.params;
        const requisitante = req.usuario;

        const planoAlvo = await obterPlanoPorId(planoId);
        if (!planoAlvo) {
            return res.status(404).json({ message: "Plano mensal не encontrado." });
        }

        const temPermissao = await verificarPermissao(planoAlvo.id_estacionamento, requisitante);
        if (!temPermissao) {
            return res.status(403).json({ message: "Acesso proibido. Você não pode excluir este plano." });
        }
        
        const contratosAtivos = await prisma.contrato_mensalista.count({
            where: { id_plano: parseInt(planoId), status: 'ATIVO' },
        });

        if (contratosAtivos > 0) {
            return res.status(409).json({ message: `Conflito: Este plano não pode ser excluído pois possui ${contratosAtivos} mensalista(s) ativo(s).` });
        }
        
        await excluirPlanoMensal(planoId);
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao excluir plano:", error);
        res.status(500).json({ message: "Erro interno ao excluir plano." });
    }
};