import { z } from 'zod';

export const paramsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "O ID deve ser um número positivo."), 
  
  }),
});

export const politicaPrecoParamsSchema = z.object({
  params: z.object({
    estacionamentoId: z.string().regex(/^\d+$/, "O ID do estacionamento deve ser um número."),
    politicaId: z.string().regex(/^\d+$/, "O ID da política deve ser um número.").optional(),
  }),
});