import { z } from 'zod';

const tipoDesconto = z.enum(['PERCENTUAL', 'FIXO']);

const cupomBody = {
    codigo: z.string({ required_error: "O código do cupom é obrigatório." })
        .min(3, "O código deve ter no mínimo 3 caracteres.")
        .transform(val => val.toUpperCase()), 

    descricao: z.string().optional(),

    tipo_desconto: tipoDesconto,

    valor: z.number({ required_error: "O valor do desconto é obrigatório." })
        .positive("O valor do desconto deve ser positivo."),

    data_validade: z.string({ required_error: "A data de validade é obrigatória." })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido. Use AAAA-MM-DD."),

    usos_maximos: z.number().int().positive().optional(),
};

export const criarCupomSchema = z.object({
    body: z.object(cupomBody),
});

export const atualizarCupomSchema = z.object({
    body: z.object({
        codigo: z.string().min(3).transform(val => val.toUpperCase()).optional(),
        descricao: z.string().optional(),
        tipo_desconto: tipoDesconto.optional(),
        valor: z.number().positive().optional(),
        data_validade: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        usos_maximos: z.number().int().positive().optional(),
        ativo: z.boolean().optional()
    }),
});