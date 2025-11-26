// src/services/logService.js
import prisma from '../config/prisma.js';

/**
 * Registra um evento no log do sistema.
 * Esta função é 'fire-and-forget', significando que não precisamos esperar sua conclusão.
 * @param {object} logData - Os dados do log a serem registrados.
 * @param {number} logData.id_usuario_acao - ID do usuário que realizou a ação.
 * @param {number} logData.id_estacionamento - ID do estacionamento onde a ação ocorreu.
 * @param {string} logData.acao - Descrição da ação (ex: 'CRIAÇÃO DE VAGA').
 * @param {object} logData.detalhes - Objeto JSON com detalhes contextuais.
 */
export const registrarLog = async ({ id_usuario_acao, id_estacionamento, acao, detalhes }) => {
    try {
        await prisma.log.create({
            data: {
                id_usuario_acao: id_usuario_acao ? parseInt(id_usuario_acao) : undefined,
                id_estacionamento: id_estacionamento ? parseInt(id_estacionamento) : undefined,
                acao,
                detalhes: detalhes || {}, // Garante que seja um objeto JSON válido
            },
        });
    } catch (error) {
        // Em um ambiente de produção, este erro deveria ser enviado para um serviço
        // de monitoramento (Sentry, LogRocket, etc.) para não parar a aplicação principal.
        console.error("ERRO CRÍTICO AO REGISTRAR LOG:", error);
    }
};