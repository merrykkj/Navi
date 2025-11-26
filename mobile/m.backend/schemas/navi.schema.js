import { z } from 'zod';

const historyMessageSchema = z.object({
  role: z.string().min(1),
  parts: z.array(z.object({
    text: z.string().min(1),
  })),
});

export const askNaviAdminSchema = z.object({
  user_question: z.string().min(1, 'A pergunta do utilizador é obrigatória.'),
  history: z.array(historyMessageSchema).optional(),
});

export const askNaviProprietarioSchema = askNaviAdminSchema.extend({
  id_estacionamento: z.union([z.string().cuid(), z.number().int()], {
      invalid_type_error: 'O ID do estacionamento deve ser um número ou CUID válido.',
    }).transform(val => parseInt(val)),
});