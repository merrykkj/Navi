
import prisma from '../config/prisma.js';

export const criarCupom = async (dadosCupom) => {
    return await prisma.cupom.create({
        data: {
            ...dadosCupom,
            data_validade: new Date(dadosCupom.data_validade), 
        },
    });
};


export const listarTodosCupons = async () => {
    return await prisma.cupom.findMany();
};

export const obterCupomPorCodigo = async (codigo) => {
    return await prisma.cupom.findUnique({
        where: { codigo: codigo.toUpperCase() }, 
    });
};

export const obterCupomPorId = async (cupomId) => {
    return await prisma.cupom.findUnique({
        where: { id_cupom: parseInt(cupomId) },
    });
};

export const atualizarCupom = async (cupomId, dadosCupom) => {
    if (dadosCupom.data_validade) {
        dadosCupom.data_validade = new Date(dadosCupom.data_validade);
    }
    return await prisma.cupom.update({
        where: { id_cupom: parseInt(cupomId) },
        data: dadosCupom,
    });
};

export const desativarCupom = async (cupomId) => {
    return await prisma.cupom.update({
        where: { id_cupom: parseInt(cupomId) },
        data: { ativo: false },
    });
};