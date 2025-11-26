import { z } from 'zod';

export const criarReservaSchema = z.object({
  body: z.object({
    id_vaga: z.number({ required_error: "O ID da vaga é obrigatório." }).int().positive(),
    id_veiculo: z.number().int().positive().optional(),
  }),
});