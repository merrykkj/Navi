import { z } from 'zod';

export const criarVagaSchema = z.object({
  body: z.object({
    id_estacionamento: z.number({ required_error: "O ID do estacionamento é obrigatório." }).int().positive(),
    identificador: z.string({ required_error: "O identificador da vaga é obrigatório." }).min(1, "O identificador não pode ser vazio."),
    tipo_vaga: z.enum(['PADRAO', 'PCD', 'IDOSO', 'ELETRICO', 'MOTO']).optional(),
    status: z.enum(['LIVRE', 'OCUPADA', 'RESERVADA', 'MANUTENCAO']).optional(),
  }),
});


export const atualizarVagaSchema = z.object({
  body: z.object({
    identificador: z.string().min(1, "O identificador não pode ser vazio.").optional(),
    tipo_vaga: z.enum(['PADRAO', 'PCD', 'IDOSO', 'ELETRICO', 'MOTO']).optional(),
    status: z.enum(['LIVRE', 'OCUPADA', 'RESERVADA', 'MANUTENCAO']).optional(),
  }),
});