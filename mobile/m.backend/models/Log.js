// src/models/Log.js
import prisma from '../config/prisma.js';

export const buscarLogs = async (filtros) => {
    const { estacionamentoId, dataInicio, dataFim } = filtros;
    
    const whereClause = {};

    if (estacionamentoId) {
        whereClause.id_estacionamento = parseInt(estacionamentoId);
    }
    
    if (dataInicio || dataFim) {
        whereClause.data_log = {};
        if (dataInicio) {
            const inicio = new Date(dataInicio);
            inicio.setUTCHours(0, 0, 0, 0);
            whereClause.data_log.gte = inicio;
        }
        if (dataFim) {
            const fim = new Date(dataFim);
            fim.setUTCHours(23, 59, 59, 999);
            whereClause.data_log.lte = fim;
        }
    }
    
    // Remove o objeto data_log se estiver vazio para evitar erros do Prisma
    if (Object.keys(whereClause.data_log || {}).length === 0) {
        delete whereClause.data_log;
    }

    return prisma.log.findMany({
        where: whereClause,
        include: { 
            usuario: { 
                select: { nome: true } 
            } 
        },
        orderBy: { data_log: 'desc' },
        take: 500,
    });
};