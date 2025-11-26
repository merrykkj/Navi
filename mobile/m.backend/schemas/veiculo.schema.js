import { z } from 'zod';

export const criarVeiculoSchema = z.object({
  body: z.object({
    placa: z.string({ required_error: "A placa é obrigatória." }),
    marca: z.string({ required_error: "A marca é obrigatória." }),
    modelo: z.string({ required_error: "O modelo é obrigatório." }),
    cor: z.string({ required_error: "A cor é obrigatória." }),
    apelido: z.string().optional(),
  }),
});

export const atualizarVeiculoSchema = z.object({
  body: z.object({
    placa: z.string().optional(),
    marca: z.string().optional(),
    modelo: z.string().optional(),
    cor: z.string().optional(),
    apelido: z.string().optional(),
  }),
});