
import { z } from 'zod';

const statusContrato = z.enum(['ATIVO', 'INATIVO', 'CANCELADO']);

export const criarContratoSchema = z.object({
  body: z.object({
    id_plano: z.number({ required_error: "O ID do plano é obrigatório." }).int().positive(),
    id_veiculo: z.number({ required_error: "O ID do veículo é obrigatório." }).int().positive(),
    data_inicio: z.string({ required_error: "A data de início é obrigatória." }).regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido. Use AAAA-MM-DD."),
  }),
});

export const atualizarContratoSchema = z.object({
  body: z.object({
    status: statusContrato.optional(),
    data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
});