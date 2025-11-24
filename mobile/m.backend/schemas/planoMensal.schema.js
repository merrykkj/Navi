import { z } from 'zod';

const planoMensalBody = {
  nome_plano: z.string({ required_error: "O nome do plano é obrigatório." }).min(3, "O nome do plano precisa de no mínimo 3 caracteres."),
  preco_mensal: z.number({ required_error: "O preço mensal é obrigatório." }).positive("O preço mensal deve ser um valor positivo."),
  descricao: z.string().optional(),
};

export const criarPlanoMensalSchema = z.object({
  body: z.object(planoMensalBody),
});

export const atualizarPlanoMensalSchema = z.object({
  body: z.object({
    nome_plano: z.string().min(3).optional(),
    preco_mensal: z.number().positive().optional(),
    descricao: z.string().optional(),
  }),
});