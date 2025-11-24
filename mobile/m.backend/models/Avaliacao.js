
import prisma from '../config/prisma.js';

export const criarAvaliacao = async (dadosAvaliacao, usuarioId, estacionamentoId) => {
    return await prisma.avaliacao.create({
        data: {
            ...dadosAvaliacao,
            id_usuario: parseInt(usuarioId),
            id_estacionamento: parseInt(estacionamentoId),
        },
    });
};

export const listarAvaliacoesPorEstacionamento = async (estacionamentoId) => {
    return await prisma.avaliacao.findMany({
        where: { id_estacionamento: parseInt(estacionamentoId) },
        orderBy: { data_postagem: 'desc' }, 
        include: {
            usuario: {
                select: {
                    nome: true,
                    url_foto_perfil: true,
                },
            },
        },
    });
};

export const obterAvaliacaoPorId = async (avaliacaoId) => {
    return await prisma.avaliacao.findUnique({
        where: { id_avaliacao: parseInt(avaliacaoId) },
    });
};

export const atualizarAvaliacao = async (avaliacaoId, dadosAvaliacao) => {
    return await prisma.avaliacao.update({
        where: { id_avaliacao: parseInt(avaliacaoId) },
        data: dadosAvaliacao,
    });
};

export const excluirAvaliacao = async (avaliacaoId) => {
    return await prisma.avaliacao.delete({
        where: { id_avaliacao: parseInt(avaliacaoId) },
    });
};