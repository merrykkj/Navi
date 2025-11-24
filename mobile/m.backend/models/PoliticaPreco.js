// src/models/PoliticaPreco.js
import prisma from '../config/prisma.js';

export const criarOuReativarPoliticaPreco = async (dadosPolitica, estacionamentoId) => {
    return prisma.politica_preco.upsert({
        where: {
            id_estacionamento_descricao: {
                id_estacionamento: parseInt(estacionamentoId),
                descricao: dadosPolitica.descricao,
            }
        },
        update: {
            ativo: true,
            preco_primeira_hora: dadosPolitica.preco_primeira_hora,
            preco_horas_adicionais: dadosPolitica.preco_horas_adicionais,
            preco_diaria: dadosPolitica.preco_diaria,
        },
        create: {
            id_estacionamento: parseInt(estacionamentoId),
            descricao: dadosPolitica.descricao,
            preco_primeira_hora: dadosPolitica.preco_primeira_hora,
            preco_horas_adicionais: dadosPolitica.preco_horas_adicionais,
            preco_diaria: dadosPolitica.preco_diaria,
            ativo: true,
        },
    });
};

export const listarPoliticasAtivas = async (estacionamentoId) => {
    return await prisma.politica_preco.findMany({
        where: { id_estacionamento: parseInt(estacionamentoId), ativo: true },
        orderBy: { descricao: 'asc' },
    });
};

export const listarPoliticasHistorico = async (estacionamentoId) => {
    return await prisma.politica_preco.findMany({
        where: { id_estacionamento: parseInt(estacionamentoId), ativo: false },
        orderBy: { descricao: 'asc' },
    });
};

export const obterPoliticaPorId = async (politicaId) => {
    return await prisma.politica_preco.findUnique({
        where: { id_politica_preco: parseInt(politicaId) },
    });
};

export const atualizarPoliticaPreco = async (politicaId, dadosPolitica) => {
    return await prisma.politica_preco.update({
        where: { id_politica_preco: parseInt(politicaId) },
        data: dadosPolitica,
    });
};

export const desativarPoliticaPreco = async (politicaId) => {
    return await prisma.politica_preco.update({
        where: { id_politica_preco: parseInt(politicaId) },
        data: { ativo: false },
    });
};

export const reativarPoliticaPreco = async (politicaId) => {
    return await prisma.politica_preco.update({
        where: { id_politica_preco: parseInt(politicaId) },
        data: { ativo: true },
    });
};