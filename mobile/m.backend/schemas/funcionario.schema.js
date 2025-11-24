import { z } from 'zod';

const permissaoEnum = z.enum(['GESTOR', 'OPERADOR']);

export const adicionarFuncionarioSchema = z.object({
  body: z.object({
    email_funcionario: z.string({ required_error: "O email do funcionário é obrigatório." }).email("Formato de email inválido."),
    permissao: permissaoEnum,
  }),
});

export const atualizarFuncionarioSchema = z.object({
    body: z.object({
      permissao: permissaoEnum,
    }),
  });

  export const criarEAdicionarFuncionarioSchema = z.object({
  body: z.object({
    nome: z.string().min(3, "O nome é obrigatório."),
    email: z.string().email("Formato de email inválido."),
    telefone: z.string().optional(),
    permissao: z.enum(['GESTOR', 'OPERADOR']),
  }),
});