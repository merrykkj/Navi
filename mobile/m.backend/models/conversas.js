// src/models/Conversas.js
import prisma from '../config/prisma.js';

/**
 * Inicia (ou retorna) um chat entre dois usuários.
 * Correção: a busca de chat existente usa apenas `some` para verificar que
 * ambos estão presentes no chat — evita matches com chat consigo mesmo.
 */
export const iniciarChat = async (id_usuario1, id_usuario2) => {
  return prisma.$transaction(async (tx) => {
    // Busca chat que contenha ambos os participantes (não necessariamente exclusivamente)
    const chatExistente = await tx.chat.findFirst({
      where: {
        AND: [
          { chatparticipante: { some: { id_usuario: id_usuario1 } } },
          { chatparticipante: { some: { id_usuario: id_usuario2 } } }
        ]
      },
      include: {
        chatparticipante: { include: { usuario: true } },
        mensagem: { orderBy: { data_envio: 'desc' }, take: 1 }
      }
    });

    if (chatExistente) return { chat: chatExistente, criadoAgora: false };

    const novoChat = await tx.chat.create({
      data: {
        chatparticipante: {
          create: [{ id_usuario: id_usuario1 }, { id_usuario: id_usuario2 }]
        }
      },
      include: {
        chatparticipante: { include: { usuario: true } },
        mensagem: { orderBy: { data_envio: 'desc' }, take: 1 }
      }
    });

    return { chat: novoChat, criadoAgora: true };
  });
};

/**
 * Lista chats do usuário.
 * Inclui: participantes (com dados do usuário) e última mensagem.
 */
export const listarChatsDoUsuario = async (usuarioId) => {
  return prisma.chat.findMany({
    where: { chatparticipante: { some: { id_usuario: parseInt(usuarioId) } } },
    include: {
      chatparticipante: { include: { usuario: { select: { id_usuario: true, nome: true, url_foto_perfil: true, papel: true } } } },
      mensagem: { orderBy: { data_envio: 'desc' }, take: 1 }
    },
    orderBy: { mensagem: { _count: 'desc' } } // tentativa de priorizar chats com mensagens; opcional
  });
};

/**
 * Lista mensagens de um chat (ordenadas asc).
 * Inclui dados do remetente (usuario) e anexos (se houver).
 */
export const listarMensagensDoChat = async (chatId) => {
  return prisma.mensagem.findMany({
    where: { id_chat: parseInt(chatId) },
    include: {
      usuario: { select: { id_usuario: true, nome: true, url_foto_perfil: true } },
      anexos: { select: { id: true, url: true, tipo: true, nome_arquivo: true } } // exige model mensagem_anexo
    },
    orderBy: { data_envio: 'asc' }
  });
};

/**
 * Cria uma mensagem. Pode incluir urlAnexo (string) e meta de arquivo.
 * Retorna a mensagem com o relacionamento usuario e anexos.
 */
export const criarMensagem = async (chatId, remetenteId, conteudo, anexos = []) => {
  return prisma.$transaction(async (tx) => {
    const novaMensagem = await tx.mensagem.create({
      data: {
        id_chat: parseInt(chatId),
        id_remetente: parseInt(remetenteId),
        conteudo
      },
      include: {
        usuario: { select: { id_usuario: true, nome: true, url_foto_perfil: true } },
        anexos: true
      }
    });

    if (anexos && Array.isArray(anexos) && anexos.length > 0) {
      const createAnexos = anexos.map(a => ({
        id_mensagem: novaMensagem.id,
        url: a.url,
        tipo: a.tipo || 'ARQUIVO',
        nome_arquivo: a.nome || null
      }));
      await tx.mensagem_anexo.createMany({ data: createAnexos });
      // Recarrega os anexos
      const mensagemComAnexos = await tx.mensagem.findUnique({
        where: { id: novaMensagem.id },
        include: {
          usuario: { select: { id_usuario: true, nome: true, url_foto_perfil: true } },
          anexos: true
        }
      });
      return mensagemComAnexos;
    }

    return novaMensagem;
  });
};

/**
 * Marca uma mensagem como lida por um usuário (cria registro em leituramensagem).
 * Retorna a leitura criada (ou existente).
 */
export const marcarMensagemComoLida = async (mensagemId, leitorId) => {
  const exist = await prisma.leituramensagem.findUnique({
    where: { id_mensagem_id_leitor: { id_mensagem: parseInt(mensagemId), id_leitor: parseInt(leitorId) } }
  }).catch(() => null);

  if (exist) return exist;

  return prisma.leituramensagem.create({
    data: {
      id_mensagem: parseInt(mensagemId),
      id_leitor: parseInt(leitorId)
    }
  });
};
