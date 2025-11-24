import prisma from '../config/prisma.js';

export const adicionarFuncionario = async (id_estacionamento, id_usuario, permissao) => {
    return await prisma.estacionamento_funcionario.create({
        data: {
            id_estacionamento: parseInt(id_estacionamento),
            id_usuario: parseInt(id_usuario),
            permissao: permissao,
        },
    });
};

export const listarFuncionariosPorEstacionamento = async (id_estacionamento) => {
    return await prisma.estacionamento_funcionario.findMany({
        where: { id_estacionamento: parseInt(id_estacionamento) },
        include: {
            usuario: { 
                select: {
                    id_usuario: true,
                    nome: true,
                    email: true,
                    telefone: true,
                },
            },
        },
    });
};

export const atualizarPermissaoFuncionario = async (id_estacionamento, id_usuario, novaPermissao) => {
    return await prisma.estacionamento_funcionario.update({
        where: {
            id_estacionamento_id_usuario: {
                id_estacionamento: parseInt(id_estacionamento),
                id_usuario: parseInt(id_usuario),
            }
        },
        data: {
            permissao: novaPermissao,
        }
    });
};

export const removerFuncionario = async (id_estacionamento, id_usuario) => {
    return await prisma.estacionamento_funcionario.delete({
        where: {
            id_estacionamento_id_usuario: {
                id_estacionamento: parseInt(id_estacionamento),
                id_usuario: parseInt(id_usuario),
            }
        },
    });
};