
import prisma from '../config/prisma.js';

export const criarContrato = async (dadosContrato, usuarioId) => {
    return await prisma.contrato_mensalista.create({
        data: {
            id_plano: dadosContrato.id_plano,
            id_veiculo: dadosContrato.id_veiculo,
            id_usuario: parseInt(usuarioId),
            data_inicio: new Date(dadosContrato.data_inicio), 
            status: 'ATIVO', 
        },
    });
};

export const obterContratoPorId = async (contratoId) => {
    return await prisma.contrato_mensalista.findUnique({
        where: { id_contrato: parseInt(contratoId) },
        include: {
            plano_mensal: {
                include: { estacionamento: true } 
            },
            veiculo: true,
            usuario: true
        }
    });
};

export const listarContratosPorUsuario = async (usuarioId) => {
    return await prisma.contrato_mensalista.findMany({
        where: { id_usuario: parseInt(usuarioId) },
        include: { plano_mensal: { include: { estacionamento: true } }, veiculo: true }
    });
};

export const listarContratosPorEstacionamento = async (estacionamentoId) => {
    return await prisma.contrato_mensalista.findMany({
        where: { 
            plano_mensal: { 
                id_estacionamento: parseInt(estacionamentoId)
            }
        },
        include: { usuario: true, veiculo: true, plano_mensal: true }
    });
};

export const atualizarContrato = async (contratoId, dadosContrato) => {
    if (dadosContrato.data_fim) {
        dadosContrato.data_fim = new Date(dadosContrato.data_fim);
    }
    return await prisma.contrato_mensalista.update({
        where: { id_contrato: parseInt(contratoId) },
        data: dadosContrato,
    });
};
