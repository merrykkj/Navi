import prisma from '../config/prisma.js';

const listarVagas = async () => {
    return await prisma.vaga.findMany();
};

const obterVagasPorId = async (id) => {
   
    return await prisma.vaga.findUnique({
        where: { id_vaga: parseInt(id) } 
    });
};

const criarVaga = async (vagaData) => {
   
    const novaVaga = await prisma.vaga.create({
        data: vagaData
    });
    return novaVaga.id_vaga;
};

const atualizarVaga = async (id, vagaData) => {
    return await prisma.vaga.update({
        where: { id_vaga: parseInt(id) },
        data: vagaData
    });
};

const excluirVaga = async (id) => {
    return await prisma.vaga.delete({
        where: { id_vaga: parseInt(id) }
    });
};

export { listarVagas, obterVagasPorId, criarVaga, atualizarVaga, excluirVaga };