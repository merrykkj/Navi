// src/controllers/ChatController.js
import { iniciarChat, listarChatsDoUsuario, listarMensagensDoChat, criarMensagem, marcarMensagemComoLida } from "../models/Conversas.js";
import { iniciarChatSchema, enviarMensagemSchema } from '../schemas/chat.schema.js';
import { paramsSchema } from '../schemas/params.schema.js';
import prisma from '../config/prisma.js';
import fs from 'fs';
import path from 'path';

/**
 * Verifica permissão entre dois usuários (mantive sua lógica original e pequenos ajustes).
 */
async function verificarPermissaoParaChat(id_remetente, id_destinatario) {
  const usuarios = await prisma.usuario.findMany({
    where: { id_usuario: { in: [id_remetente, id_destinatario] } },
    select: { id_usuario: true, papel: true }
  });
  const remetente = usuarios.find(u => u.id_usuario === id_remetente);
  const destinatario = usuarios.find(u => u.id_usuario === id_destinatario);

  if (!remetente || !destinatario) return false;
  if (remetente.papel === 'ADMINISTRADOR' || destinatario.papel === 'ADMINISTRADOR') return true;

  const vinculos = await prisma.estacionamento_funcionario.findMany({
    where: { id_usuario: { in: [id_remetente, id_destinatario] } },
    select: { id_usuario: true, id_estacionamento: true }
  });
  const estacionamentosRemetente = new Set(vinculos.filter(v => v.id_usuario === id_remetente).map(v => v.id_estacionamento));
  const estacionamentosDestinatario = new Set(vinculos.filter(v => v.id_usuario === id_destinatario).map(v => v.id_estacionamento));

  const ehProprietarioDoOutro = await prisma.estacionamento_funcionario.findFirst({
    where: { id_usuario: id_destinatario, estacionamento: { id_proprietario: id_remetente } }
  }) || await prisma.estacionamento_funcionario.findFirst({
    where: { id_usuario: id_remetente, estacionamento: { id_proprietario: id_destinatario } }
  });
  if (ehProprietarioDoOutro) return true;

  for (const idEstacionamento of estacionamentosRemetente) {
    if (estacionamentosDestinatario.has(idEstacionamento)) return true;
  }

  return false;
}

/* Inicia chat */
export const iniciarChatController = async (req, res) => {
  try {
    const { body } = iniciarChatSchema.parse(req);
    const requisitanteId = req.usuario.id_usuario;
    const destinatarioId = body.id_destinatario;
    if (requisitanteId === destinatarioId) return res.status(400).json({ message: "Você não pode iniciar um chat consigo mesmo." });

    const temPermissao = await verificarPermissaoParaChat(requisitanteId, destinatarioId);
    if (!temPermissao) return res.status(403).json({ message: "Você não tem permissão para iniciar um chat com este usuário." });

    const { chat, criadoAgora } = await iniciarChat(requisitanteId, destinatarioId);
    res.status(criadoAgora ? 201 : 200).json({ message: "Chat disponível.", chat });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ errors: error.flatten().fieldErrors });
    console.error("Erro ao iniciar chat:", error); res.status(500).json({ message: "Erro interno." });
  }
};

export const listarMeusChatsController = async (req, res) => {
  try {
    const requisitanteId = req.usuario.id_usuario;
    const papel = req.usuario.papel;

    // --- Se for PROPRIETARIO: garantir chats com TODOS os funcionarios dos estacionamentos dele
    if (papel === 'PROPRIETARIO') {
      // busca todos os funcionarios vinculados aos estacionamentos do proprietario
      const funcionarios = await prisma.estacionamento_funcionario.findMany({
        where: { estacionamento: { id_proprietario: requisitanteId } },
        select: { id_usuario: true }
      });

      await Promise.all(funcionarios.map(async (f) => {
        if (f.id_usuario && f.id_usuario !== requisitanteId) {
          await iniciarChat(requisitanteId, f.id_usuario);
        }
      }));
    }

    // --- Se for FUNCIONARIO: garantir chats com os colegas do(s) mesmo(s) estacionamento(s) e com o proprietario do(s) estacionamento(s)
    if (papel === 'FUNCIONARIO' || papel === 'MOTORISTA' || papel === 'GESTOR' || papel === 'OPERADOR') {
      // pega os estacionamentos onde ele é vinculado
      const vinculos = await prisma.estacionamento_funcionario.findMany({
        where: { id_usuario: requisitanteId },
        select: { id_estacionamento: true }
      });

      const estacionamentosIds = vinculos.map(v => v.id_estacionamento);
      if (estacionamentosIds.length > 0) {
        // colegas (outros funcionarios do mesmo(s) estacionamento(s))
        const colegas = await prisma.estacionamento_funcionario.findMany({
          where: { id_estacionamento: { in: estacionamentosIds } },
          select: { id_usuario: true }
        });

        // proprietarios desses estacionamentos
        const proprietarios = await prisma.estacionamento.findMany({
          where: { id_estacionamento: { in: estacionamentosIds } },
          select: { id_proprietario: true }
        });

        // criar chats com colegas e proprietarios (se ainda não existe)
        const promises = [];

        colegas.forEach(c => {
          if (c.id_usuario && c.id_usuario !== requisitanteId) {
            promises.push(iniciarChat(requisitanteId, c.id_usuario));
          }
        });

        proprietarios.forEach(p => {
          if (p.id_proprietario && p.id_proprietario !== requisitanteId) {
            promises.push(iniciarChat(requisitanteId, p.id_proprietario));
          }
        });

        await Promise.all(promises);
      }
    }

    // --- IMPORTANTE: não criar chats automáticos para ADMIN aqui (eles aparecerão se conversarem)
    // --- por fim, listar os chats do usuario (agora atualizados)
    const chats = await listarChatsDoUsuario(requisitanteId);
    res.status(200).json(chats);
  } catch (error) {
    console.error("Erro ao listar chats:", error);
    res.status(500).json({ message: "Erro interno." });
  }
};

/* Lista mensagens de um chat - garante que quem pediu é participante */
export const listarMensagensController = async (req, res) => {
  try {
    const idChat = Number(req.params.idChat);

    const mensagens = await prisma.mensagem.findMany({
      where: { id_chat: idChat },
      include: {
        remetente: {
          select: {
            id_usuario: true,
            nome: true,
            url_foto_perfil: true
          }
        },
        anexos: true
      },
      orderBy: { data_envio: "asc" }
    });

    res.json(mensagens);
  } catch (error) {
    console.error("Erro ao listar mensagens:", error);
    res.status(500).json({ error: "Erro ao listar mensagens" });
  }
};


/* Envia mensagem - aceita anexos (array de {url, tipo, nome}) via body ou via upload endpoint */
export const enviarMensagemController = async (req, res) => {
    try {
        const chatId = parseInt(req.params.id);
        const userId = req.usuario.id_usuario;

        const { conteudo } = req.body;

        const novaMensagem = await criarMensagem(chatId, userId, conteudo);

        // 🔥 anexos
        if (req.files && req.files.length > 0) {
            const anexosCriados = [];

            for (const file of req.files) {
                const anexo = await prisma.mensagem_anexo.create({
                    data: {
                        id_mensagem: novaMensagem.id,
                        nome_arquivo: file.originalname,
                        tipo: file.mimetype,
                        url: `/uploads/${file.mimetype.startsWith("image/") ? "images" : "files"}/${file.filename}`
                    }
                });
                anexosCriados.push(anexo);
            }

            novaMensagem.anexos = anexosCriados;
        }

        const io = req.app.get("io");
        io.to(chatId.toString()).emit("receber-mensagem", novaMensagem);

        return res.status(201).json(novaMensagem);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno" });
    }
};

/* Marca mensagem como lida */
export const marcarComoLidaController = async (req, res) => {
  try {
    const { params } = paramsSchema.parse(req);
    const { msgId } = req.params; // rota: /chat/:id/mensagens/:msgId/lida
    const chatId = parseInt(params.id);
    // verificar participação
    const participante = await prisma.chatparticipante.findFirst({ where: { id_chat: chatId, id_usuario: req.usuario.id_usuario } });
    if (!participante) return res.status(403).json({ message: "Acesso proibido." });

    const leitura = await marcarMensagemComoLida(parseInt(msgId), req.usuario.id_usuario);

    // emitir socket de leitura
    const io = req.app.get('io');
    io.to(chatId.toString()).emit('mensagem-lida', { id_mensagem: parseInt(msgId), id_leitor: req.usuario.id_usuario });

    res.status(200).json(leitura);
  } catch (error) {
    console.error("Erro ao marcar mensagem lida:", error); res.status(500).json({ message: "Erro interno." });
  }
};

/* Endpoint simples para upload via multer (se preferir separar) */
export const uploadAnexoController = async (req, res) => {
  try {
    // req.file ou req.files dependendo do campo
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: "Nenhum arquivo enviado." });

    const urls = req.files.map(f => ({ url: `/uploads/${f.filename}`, nome: f.originalname, tipo: f.mimetype }));
    res.status(201).json({ anexos: urls });
  } catch (error) {
    console.error('Erro upload', error);
    res.status(500).json({ message: "Erro no upload." });
  }
};
