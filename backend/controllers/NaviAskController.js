import { NaviService } from '../services/navi.service.js';
import { askNaviAdminSchema, askNaviProprietarioSchema } from '../schemas/navi.schema.js';
import { DocumentGenerateNavi } from '../models/DocumentGenerateNavi.js'; 
import prisma from '../config/prisma.js'; 

const verificarAutorizacao = async (estacionamentoId, userId) => {
    const isProprietario = await prisma.estacionamento.count({
        where: { id_estacionamento: estacionamentoId, id_proprietario: userId },
    });
    if (isProprietario > 0) return true;

    const isEmployee = await prisma.estacionamento_funcionario.count({
        where: { id_estacionamento: estacionamentoId, id_usuario: userId },
    });
    return isEmployee > 0;
};

export const naviAdminController = async (req, res) => {
    try {
        const validationResult = askNaviAdminSchema.safeParse(req.body);
        if (!validationResult.success) return res.status(400).json({ error: 'Dados inválidos.' });
        
        const { user_question, history } = validationResult.data;
        const dataContext = await NaviService.buscaDados.buscaGlobal();
        const naviResponse = await NaviService.ask(user_question, dataContext, history);
        res.status(200).json({ 
            ...naviResponse, 
            dataContext: naviResponse.type === 'document' ? dataContext : null 
        });
    } catch (error) {
        console.error('ERRO ADMIN:', error);
        res.status(500).json({ error: 'Erro interno.' });
    }
};

export const naviProprietarioController = async (req, res) => {
    try {
        const validationResult = askNaviProprietarioSchema.safeParse(req.body);
        if (!validationResult.success) return res.status(400).json({ error: 'Dados inválidos.' });
        
        const { id_estacionamento, user_question, history } = validationResult.data;
        const userId = req.usuario.id_usuario; 

        const temPermissao = await verificarAutorizacao(id_estacionamento, userId);
        if (!temPermissao && req.usuario.papel !== 'ADMINISTRADOR') {
            return res.status(403).json({ error: 'Acesso proibido.' });
        }

        const dataContext = await NaviService.buscaDados.buscaEstacionamento(id_estacionamento);
        const naviResponse = await NaviService.ask(user_question, dataContext, history);
        
        res.status(200).json({ 
            ...naviResponse, 
            dataContext: naviResponse.type === 'document' ? dataContext : null 
        });
    } catch (error) {
        console.error('ERRO PROPRIETARIO:', error);
        res.status(500).json({ error: 'Erro interno.' });
    }
};

export const naviDownloadController = async (req, res) => {
    try {
        const { documentType, documentTitle, dataContext, prefixo } = req.body;
        if (!dataContext || !documentType) {
            return res.status(400).json({ error: "Dados insuficientes." });
        }

        return DocumentGenerateNavi.generateAndSend(res, { documentType, documentTitle }, dataContext, prefixo || 'Relatorio');

    } catch (error) {
        console.error("ERRO DOWNLOAD:", error);
        res.status(500).json({ error: "Falha na geração do arquivo." });
    }
};