import prismaClient from '../config/prisma.js'; 

const prisma = prismaClient; 

export const ConversaModel = {
    salvarOuAtualizar: async (conversaId, userId, titulo, topico, historico) => {
        // Um log pra ajudar a entender melhor se esta dando erro no prisma e conseguir debuggar
        if (!prisma || !prisma.conversaNavi) { 
            console.error("ERRO CRÍTICO (PRISMA): O objeto 'prisma' ou o Model 'conversaNavi' é undefined.");
            throw new Error("Falha de Inicialização do PrismaClient. Você executou npx prisma generate?"); 
        }
        
        const historicoJson = JSON.stringify(historico);
        const parsedUserId = parseInt(userId); 
        const parsedConversaId = conversaId ? parseInt(conversaId) : null;

        const data = {
            historico_json: historicoJson,
            titulo: titulo,
            topico: topico,
            id_usuario: parsedUserId, 
        };

        if (parsedConversaId) {
            // Atualiza
            return prisma.conversaNavi.update({ where: { id: parsedConversaId }, data });
        } else {
            // Cria Nova Conversa 
            return prisma.conversaNavi.create({ data: data });
        }
    },

    listarPorUsuario: async (userId) => {
        return prisma.conversaNavi.findMany({
            where: { id_usuario: parseInt(userId) },
            select: { id: true, titulo: true, topico: true, data_criacao: true },
            orderBy: { data_criacao: 'desc' },
        });
    },

    obterHistorico: async (conversaId) => {
        const conversa = await prisma.conversaNavi.findUnique({
            where: { id: parseInt(conversaId) },
            select: { historico_json: true, id_usuario: true }, 
        });
        
        if (!conversa) return null;
        
        return {
            id_usuario: conversa.id_usuario,
            historico: JSON.parse(conversa.historico_json)
        };
    },
};