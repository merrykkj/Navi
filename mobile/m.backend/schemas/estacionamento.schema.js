import { z } from 'zod';

export const criarEstacionamentoSchema = z.object({
  body: z.object({
    nome: z.string({ required_error: "O nome do estacionamento é obrigatório." }).min(3, "O nome deve ter no mínimo 3 caracteres."),
    cnpj: z.string({ required_error: "O CNPJ é obrigatório." }),
    cep: z.string({ required_error: "O CEP é obrigatório." }).regex(/^\d{5}-\d{3}$/, "Formato de CEP inválido. Use XXXXX-XXX."),
    numero: z.string({ required_error: "O número do endereço é obrigatório." }),
    latitude: z.number({ required_error: "A latitude é obrigatória." }),
    longitude: z.number({ required_error: "A longitude é obrigatória." }),
    horario_abertura: z.string().optional(),
    horario_fechamento: z.string().optional(),
    dias_funcionamento: z.string().optional(),
  }),
});

export const atualizarEstacionamentoSchema = z.object({
  body: z.object({
    nome: z.string().min(3).optional(),
    horario_abertura: z.string().optional(),
    horario_fechamento: z.string().optional(),
    dias_funcionamento: z.string().optional(),
    // 🚨 CORREÇÃO: Adicionando o campo 'ativo' para ativação/inativação
   ativo: z.boolean().optional(),
  }),
});