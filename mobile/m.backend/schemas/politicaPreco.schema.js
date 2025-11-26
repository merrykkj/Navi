import { z } from 'zod';

// Schema para a criação de uma nova política.
export const politicaPrecoSchema = z.object({
  body: z.object({
    descricao: z.string({ required_error: "A descrição é obrigatória." }).min(3, "A descrição deve ter no mínimo 3 caracteres."),
    preco_primeira_hora: z.coerce.number({ required_error: "O preço da primeira hora é obrigatório.", invalid_type_error: "Valor inválido para a primeira hora" }).min(0, "O preço não pode ser negativo."),
    preco_horas_adicionais: z.coerce.number({ invalid_type_error: "Valor inválido para horas adicionais" }).min(0).optional().nullable(),
    preco_diaria: z.coerce.number({ invalid_type_error: "Valor inválido para diária" }).min(0).optional().nullable(),
  }),
});

// Schema para a atualização, onde todos os campos são opcionais.
export const atualizarPoliticaPrecoSchema = z.object({
    body: z.object({
        descricao: z.string().min(3, "A descrição deve ter no mínimo 3 caracteres.").optional(),
        preco_primeira_hora: z.coerce.number({ invalid_type_error: "Valor inválido para a primeira hora" }).min(0).optional(),
        preco_horas_adicionais: z.coerce.number({ invalid_type_error: "Valor inválido para horas adicionais" }).min(0).optional().nullable(),
        preco_diaria: z.coerce.number({ invalid_type_error: "Valor inválido para diária" }).min(0).optional().nullable(),
    })
});

// Schema para validar os parâmetros da URL, como /:estacionamentoId/ e /:politicaId
export const politicaPrecoParamsSchema = z.object({
  params: z.object({
    estacionamentoId: z.string().regex(/^\d+$/, "O ID do estacionamento deve ser um número."),
    politicaId: z.string().regex(/^\d+$/, "O ID da política deve ser um número.").optional(),
  }),
});