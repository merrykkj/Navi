import { criarCupom, listarTodosCupons, obterCupomPorId, atualizarCupom, desativarCupom } from "../models/Cupom.js";
import { criarCupomSchema, atualizarCupomSchema } from "../schemas/cupom.schema.js";
import { paramsSchema } from '../schemas/params.schema.js';

export const criarCupomController = async (req, res) => {
    try {
        const { body } = criarCupomSchema.parse(req);

        body.codigo = body.codigo.toUpperCase();

        const novoCupom = await criarCupom(body);
        res.status(201).json({ message: "Cupom criado com sucesso!", cupom: novoCupom });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }
        if (error.code === 'P2002' && error.meta?.target.includes('codigo')) {
            return res.status(409).json({ message: "Conflito: Este código de cupom já existe." });
        }
        console.error("Erro ao criar cupom:", error);
        res.status(500).json({ message: "Erro interno ao criar cupom." });
    }
};

export const listarCuponsController = async (req, res) => {
    try {
        const cupons = await listarTodosCupons();
        res.status(200).json(cupons);
    } catch (error) {
        console.error("Erro ao listar cupons:", error);
        res.status(500).json({ message: "Erro interno ao listar cupons." });
    }
};

export const obterCupomPorIdController = async (req, res) => {
    try {
        const { params } = paramsSchema.parse(req);
        const cupom = await obterCupomPorId(params.id);
        
        if (cupom) {
            res.status(200).json(cupom);
        } else {
            res.status(404).json({ message: "Cupom não encontrado." });
        }
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "ID de cupom inválido.", errors: error.flatten().fieldErrors });
        }
        console.error("Erro ao obter cupom:", error);
        res.status(500).json({ message: "Erro interno ao obter cupom." });
    }
};

export const atualizarCupomController = async (req, res) => {
    try {
        const { params } = paramsSchema.parse(req);
        const { body } = atualizarCupomSchema.parse(req);
        
        const cupomAlvo = await obterCupomPorId(params.id);
        if (!cupomAlvo) {
            return res.status(404).json({ message: "Cupom não encontrado." });
        }

        const cupomAtualizado = await atualizarCupom(params.id, body);
        res.status(200).json({ message: "Cupom atualizado com sucesso!", cupom: cupomAtualizado });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }
        console.error("Erro ao atualizar cupom:", error);
        res.status(500).json({ message: "Erro interno ao atualizar cupom." });
    }
};

export const desativarCupomController = async (req, res) => {
    try {
        const { params } = paramsSchema.parse(req);
        const cupomAlvo = await obterCupomPorId(params.id);
        if (!cupomAlvo) {
            return res.status(404).json({ message: "Cupom não encontrado." });
        }
        
        await desativarCupom(params.id);
        res.status(204).send();
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "ID de cupom inválido.", errors: error.flatten().fieldErrors });
        }
        console.error("Erro ao desativar cupom:", error);
        res.status(500).json({ message: "Erro interno ao desativar cupom." });
    }
};