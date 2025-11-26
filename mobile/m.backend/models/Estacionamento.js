// src/models/Estacionamento.js

import prisma from '../config/prisma.js';


const listarEstacionamentos = async () => {
    // 🚨 NOTA: Se você quer que a listagem de ADMIN mostre INATIVOS, remova o .findMany({ where: { ativo: true } })
    return await prisma.estacionamento.findMany();
};

const obterEstacionamentoPorId = async (id) => {
    
    return await prisma.estacionamento.findUnique({
        where: { id_estacionamento: parseInt(id) },
    });
};

const criarEstacionamento = async (dadosCompletos) => {
    return await prisma.estacionamento.create({
        data: dadosCompletos,
    });
};


const atualizarEstacionamento = async (id, estacionamentoData) => {
    // 🚨 DEBUG CRÍTICO: Log do dado que o Controller está enviando
    console.log(`[EstacionamentoModel] PATCH/PUT - ID: ${id}. Dados Recebidos:`, estacionamentoData);
    
    try {
        const resultado = await prisma.estacionamento.update({
            where: { id_estacionamento: parseInt(id) },
            data: estacionamentoData,
        });
        // 🚨 DEBUG CRÍTICO: Log do resultado do BD
        console.log(`[EstacionamentoModel] Sucesso no Update:`, resultado);
        return resultado;
    } catch (error) {
        console.error(`[EstacionamentoModel] ERRO no Prisma Update:`, error);
        throw error;
    }
};

const excluirEstacionamento = async (id) => {
    return await prisma.estacionamento.delete({
        where: { id_estacionamento: parseInt(id) },
    });
};

export { listarEstacionamentos, obterEstacionamentoPorId, criarEstacionamento, atualizarEstacionamento, excluirEstacionamento };