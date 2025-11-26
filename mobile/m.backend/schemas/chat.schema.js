// src/schemas/chat.schema.js
import { z } from 'zod';

export const iniciarChatSchema = z.object({
  body: z.object({
    // O ID do usuário com quem se deseja iniciar a conversa.
    id_destinatario: z.number({ required_error: "O ID do destinatário é obrigatório." }).int().positive(),
  }),
});

export const enviarMensagemSchema = z.object({
  body: z.object({
    conteudo: z.string({ required_error: "O conteúdo da mensagem é obrigatório." }).min(1, "A mensagem não pode estar vazia."),
  }),
});