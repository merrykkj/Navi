import prisma from '../config/prisma.js';

/**
 * Retorna a contagem de usuários ativos por cada tipo de papel.
 * @returns {Promise<Array<{papel: string, count: number}>>}
 */
export const getDistribuicaoPapeis = async () => {
    return await prisma.usuario.groupBy({
        by: ['papel'],
        where: { ativo: true }, // Apenas usuários ativos
        _count: {
            papel: true,
        },
    });
};

/**
 * Retorna a contagem total de veículos ativos cadastrados na plataforma.
 * @returns {Promise<number>}
 */
export const getTotalVeiculos = async () => {
    return await prisma.veiculo.count({
        where: { ativo: true }, // Contamos apenas veículos ativos
    });
};