
import prisma from '../config/prisma.js';

export const criarPlanoMensal = async (dadosPlano, estacionamentoId) => {
    return await prisma.plano_mensal.create({
        data: {
            ...dadosPlano,
            id_estacionamento: parseInt(estacionamentoId),
        },
    });
};


export const listarPlanosPorEstacionamento = async (estacionamentoId) => {
    return await prisma.plano_mensal.findMany({
        where: { 
            id_estacionamento: parseInt(estacionamentoId),
            ativo: true // Puxamos apenas os planos que estão ativos
        },
        include: {
            // Esta é a mágica! O Prisma conta as relações para nós.
            _count: {
                select: { 
                    contrato_mensalista: {
                        where: { status: 'ATIVO' } // Conta apenas os contratos ATIVOS
                    }
                }
            }
        },
        orderBy: {
            nome_plano: 'asc'
        }
    });
};

export const obterPlanoPorId = async (planoId) => {
    return await prisma.plano_mensal.findUnique({
        where: { id_plano: parseInt(planoId) },
    });
};

export const atualizarPlanoMensal = async (planoId, dadosPlano) => {
    return await prisma.plano_mensal.update({
        where: { id_plano: parseInt(planoId) },
        data: dadosPlano,
    });
};

export const excluirPlanoMensal = async (planoId) => {
    return await prisma.plano_mensal.delete({
        where: { id_plano: parseInt(planoId) },
    });
};