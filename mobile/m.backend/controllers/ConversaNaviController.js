import { ConversaModel } from '../models/ConversaNavi.js';

export const listarConversasController = async (req, res) => {
    try {
        const userId = req.usuario.id_usuario;
        const conversas = await ConversaModel.listarPorUsuario(userId);
        res.status(200).json(conversas);
    } catch (error) {
        console.error("ERRO CONVERSA/LISTAR:", error.message);
        res.status(500).json({ message: "Erro interno ao listar conversas.", debug: error.message });
    }
};

export const obterHistoricoController = async (req, res) => {
    try {
        const userId = req.usuario.id_usuario;
        const conversaId = req.params.conversaId;
        
        const conversa = await ConversaModel.obterHistorico(conversaId); 
        
        if (!conversa) return res.status(404).json({ message: "Conversa não encontrada." });

        if (conversa.id_usuario !== userId && req.usuario.papel !== 'ADMINISTRADOR') {
            return res.status(403).json({ message: "Acesso proibido à esta conversa." });
        }
      
        res.status(200).json(conversa.historico); 
        
    } catch (error) {
        console.error("ERRO CONVERSA/HISTORICO:", error.message);
        res.status(500).json({ message: "Erro interno ao obter histórico.", debug: error.message });
    }
};

export const salvarConversaController = async (req, res) => {
    try {
        const { conversaId, historico, titulo, topico } = req.body;
        const userId = req.usuario.id_usuario; 

        const conversaAtualizada = await ConversaModel.salvarOuAtualizar(
            conversaId, 
            userId, 
            titulo, 
            topico, 
            historico
        );

        res.status(200).json(conversaAtualizada); 
        
    } catch (error) {
        console.error("ERRO CONVERSA/SALVAR:", error.message);
        res.status(500).json({ message: "Erro interno ao salvar conversa no DB.", debug: error.message });
    }
};