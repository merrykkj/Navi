
import { z } from 'zod';

const avaliacaoBody = {
  nota: z.number({ required_error: "A nota é obrigatória." }).int().min(1, "A nota mínima é 1.").max(5, "A nota máxima é 5."),
  comentario: z.string().max(500, "O comentário não pode exceder 500 caracteres.").optional(),
};

export const criarAvaliacaoSchema = z.object({
  body: z.object(avaliacaoBody),
});

export const atualizarAvaliacaoSchema = z.object({
  body: z.object({
    nota: z.number().int().min(1).max(5).optional(),
    comentario: z.string().max(500).optional(),
  }),
});