// src/controllers/ConversaNaviController.js

import { ConversaModel } from '../models/ConversaNaviModel.js';
import { z } from 'zod';

const paramsIdSchema = z.string().regex(/^\d+$/, "O ID deve ser um número.");

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
    const conversaId = req.params.conversaId; // O nome da sua rota usa 'conversaId'
    
    const conversa = await ConversaModel.obterHistorico(conversaId, userId); 
    
    if (!conversa) {
      return res.status(404).json({ message: "Conversa não encontrada ou não pertence a você." });
    }
  
    res.status(200).json(conversa.historico); 
    
  } catch (error) {
    console.error("ERRO CONVERSA/HISTORICO:", error.message);
    res.status(500).json({ message: "Erro interno ao obter histórico.", debug: error.message });
  }
};

export const salvarConversaController = async (req, res) => {
  try {
    const { conversaId, historico, titulo } = req.body;
    const userId = req.usuario.id_usuario; 

    if (!Array.isArray(historico) || historico.length < 2) {
        return res.status(400).json({ message: "Histórico de conversa inválido ou incompleto." });
    }

    const conversaAtualizada = await ConversaModel.salvarOuAtualizar(
        conversaId, 
        userId, 
        titulo, 
        historico
    );

    res.status(200).json(conversaAtualizada); 
    
  } catch (error) {
    console.error("ERRO CONVERSA/SALVAR:", error.message);
    res.status(500).json({ message: "Erro interno ao salvar conversa no DB.", debug: error.message });
  }
};