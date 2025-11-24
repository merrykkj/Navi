import prisma from '../config/prisma.js';

/**
 * Salva uma nova conversa ou atualiza uma existente.
 */
export const salvarOuAtualizarConversa = async (conversaId, userId, titulo, topico, historico) => {
    // Transforma o array de histórico em um formato JSON que o Prisma pode salvar
    const historicoJson = JSON.stringify(historico);

    if (conversaId) {
        // Atualiza
        return prisma.conversaNavi.update({
            where: { id: parseInt(conversaId) },
            data: {
                historico_json: historicoJson,
                titulo: titulo,
            },
        });
    } else {
        // Cria Nova Conversa
        return prisma.conversaNavi.create({
            data: {
                id_usuario: parseInt(userId),
                titulo: titulo,
                topico: topico,
                historico_json: historicoJson,
            },
        });
    }
};

/**
 * Lista todas as conversas de um usuário.
 */
export const listarConversasPorUsuario = async (userId) => {
    return prisma.conversaNavi.findMany({
        where: { id_usuario: parseInt(userId) },
        select: {
            id: true,
            titulo: true,
            topico: true,
            data_criacao: true,
        },
        orderBy: { data_criacao: 'desc' },
    });
};

/**
 * Obtém o histórico completo de uma conversa específica.
 */
export const obterHistoricoPorId = async (conversaId) => {
    const conversa = await prisma.conversaNavi.findUnique({
        where: { id: parseInt(conversaId) },
        select: { historico_json: true, id_usuario: true },
    });
    
    if (!conversa) return null;
    
    // Retorna o histórico parseado
    return JSON.parse(conversa.historico_json);
};