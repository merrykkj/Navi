import { criarVaga, atualizarVaga, excluirVaga, listarVagas, obterVagasPorId } from "../models/Vaga.js";
import { criarVagaSchema, atualizarVagaSchema } from "../schemas/vaga.schema.js";
import { paramsSchema } from "../schemas/params.schema.js";
import { registrarLog } from '../services/logServices.js'
import prisma from '../config/prisma.js';

const temPermissaoSobreEstacionamento = async (id_estacionamento, requisitante) => {
    const estacionamento = await prisma.estacionamento.findUnique({
        where: { id_estacionamento: parseInt(id_estacionamento) },
        select: { id_proprietario: true }
    });

    if (!estacionamento) return false;
    if (requisitante.papel === 'ADMINISTRADOR') return true;

    return estacionamento.id_proprietario === requisitante.id_usuario;
};



export const listarVagasController = async (req, res) => {
    try {
        const vagas = await listarVagas();
        res.status(200).json(vagas);
    } catch (error) {
        console.error('Erro ao listar as vagas:', error);
        res.status(500).json({ message: 'Erro interno ao listar vagas.' });
    }
};


export const obterVagasPorIdController = async (req, res) => {
    try {
        const vaga = await obterVagasPorId(req.params.id);
        if (vaga) {
            res.status(200).json(vaga);
        } else {
            res.status(404).json({ message: 'Vaga não encontrada.' });
        }
    } catch (error) {
        console.error('Erro ao obter a vaga pelo ID:', error);
        res.status(500).json({ message: 'Erro interno ao obter vaga.' });
    }
};

export const criarVagaController = async (req, res) => {
    try {

        const { body } = criarVagaSchema.parse(req);

        const temPermissao = await temPermissaoSobreEstacionamento(body.id_estacionamento, req.usuario);
        if (!temPermissao) {
            return res.status(403).json({ message: "Acesso proibido. Você não gerencia o estacionamento informado." });
        }

        const novaVaga = await criarVaga(body);
        res.status(201).json({ message: 'Vaga criada com sucesso!', vaga: novaVaga });
        registrarLog({
            id_usuario_acao: req.usuario.id_usuario,
            id_estacionamento: body.id_estacionamento,
            acao: 'CRIAÇÃO DE VAGA',
            detalhes: { vagaId: novaVaga.id_vaga, identificador: novaVaga.identificador }
        });
    } catch (error) {

        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Conflito: Já existe uma vaga com este identificador neste estacionamento." });
        }
        console.error('Erro ao criar vaga:', error);
        res.status(500).json({ message: 'Erro interno ao criar vaga.' });
    }
};


export const atualizarVagaController = async (req, res) => {
    try {
        const { params } = paramsSchema.parse(req);
        const { body } = atualizarVagaSchema.parse(req);
        const vagaId = parseInt(params.id);

        const vagaAlvo = await obterVagasPorId(vagaId);
        if (!vagaAlvo) {
            return res.status(404).json({ message: "Vaga não encontrada." });
        }

        const temPermissao = await temPermissaoSobreEstacionamento(vagaAlvo.id_estacionamento, req.usuario);
        if (!temPermissao) {
            return res.status(403).json({ message: "Acesso proibido. Você não gerencia o estacionamento desta vaga." });
        }

        const vagaAtualizada = await atualizarVaga(vagaId, body);
        res.status(200).json({ message: 'Vaga atualizada com sucesso!', vaga: vagaAtualizada });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }
        console.error('Erro ao atualizar vaga:', error);
        res.status(500).json({ message: 'Erro ao atualizar vaga.' });
    }
};


export const excluirVagaController = async (req, res) => {
    try {
        const vagaId = parseInt(req.params.id);

        const vagaAlvo = await obterVagasPorId(vagaId);
        if (!vagaAlvo) {
            return res.status(404).json({ message: "Vaga não encontrada." });
        }
        registrarLog({
            id_usuario_acao: req.usuario.id_usuario,
            id_estacionamento: vagaAlvo.id_estacionamento,
            acao: 'EXCLUSÃO DE VAGA',
            detalhes: { vagaId: vagaAlvo.id_vaga, identificador: vagaAlvo.identificador }
        });
        const temPermissao = await temPermissaoSobreEstacionamento(vagaAlvo.id_estacionamento, req.usuario);
        if (!temPermissao) {
            return res.status(403).json({ message: "Acesso proibido. Você não gerencia o estacionamento desta vaga." });
        }

        await excluirVaga(vagaId);
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir vaga:', error);
        res.status(500).json({ message: 'Erro interno ao excluir vaga.' });
    }
};

export const listarVagasPorEstacionamentoController = async (req, res) => {
    try {
        const { estacionamentoId } = req.params;
        const requisitante = req.usuario;

        const idNumerico = parseInt(estacionamentoId);
        if (isNaN(idNumerico)) {
            return res.status(400).json({ message: "ID do estacionamento inválido." });
        }

        const vagas = await prisma.vaga.findMany({
            where: { id_estacionamento: idNumerico },
            orderBy: { identificador: 'asc' }
        });

        res.status(200).json(vagas);

    } catch (error) {
        console.error('Erro ao listar vagas do estacionamento:', error);
        res.status(500).json({ message: 'Erro interno ao buscar as vagas.' });
    }
};