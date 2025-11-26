import { adicionarFuncionario, listarFuncionariosPorEstacionamento, atualizarPermissaoFuncionario, removerFuncionario } from "../models/Funcioario.js";
import { obterEstacionamentoPorId } from "../models/Estacionamento.js";
import { adicionarFuncionarioSchema, atualizarFuncionarioSchema, criarEAdicionarFuncionarioSchema } from "../schemas/funcionario.schema.js";
import { iniciarChat } from "../models/Conversas.js";
import { registrarLog } from "../services/logServices.js";
import prisma from "../config/prisma.js";
import bcrypt from 'bcryptjs';

const verificarDonoDoEstacionamento = async (estacionamentoId, requisitanteId) => {
    const estacionamento = await obterEstacionamentoPorId(estacionamentoId);
    if (!estacionamento || estacionamento.id_proprietario !== requisitanteId) {
        return false;
    }
    return true;
};

export const adicionarFuncionarioController = async (req, res) => {
    try {
        const { estacionamentoId } = req.params;
        const { body } = adicionarFuncionarioSchema.parse(req);
        const requisitanteId = req.usuario.id_usuario;

        // ... (sua lógica de permissão e busca do futuroFuncionario)

        // Adiciona o funcionário
        const novoFuncionario = await adicionarFuncionario(estacionamentoId, futuroFuncionario.id_usuario, body.permissao);

        // --- MELHORIA: INICIA O CHAT AUTOMATICAMENTE ---
        // 2. Após adicionar com sucesso, cria o chat entre o proprietário e o funcionário.
        try {
            await iniciarChat(requisitanteId, futuroFuncionario.id_usuario);
            console.log(`Chat iniciado automaticamente entre proprietário ${requisitanteId} e funcionário ${futuroFuncionario.id_usuario}.`);
        } catch (chatError) {
            // Se o chat falhar, não quebramos a requisição principal. Apenas logamos o erro.
            console.error("AVISO: O funcionário foi adicionado, mas falhou ao criar o chat automático.", chatError);
        }
        // --- FIM DA MELHORIA ---

        res.status(201).json({ message: "Funcionário adicionado com sucesso!", funcionario: novoFuncionario });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }

        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Conflito: Este usuário já é funcionário deste estacionamento." });
        }
        console.error("Erro ao adicionar funcionário:", error);
        res.status(500).json({ message: "Erro interno ao adicionar funcionário." });
    }
};

export const listarFuncionariosController = async (req, res) => {
    try {
        const { estacionamentoId } = req.params;
        const requisitante = req.usuario;

        if (requisitante.papel !== 'ADMINISTRADOR') {
            const ehDono = await verificarDonoDoEstacionamento(estacionamentoId, requisitante.id_usuario);
            if (!ehDono) {
                return res.status(403).json({ message: "Acesso proibido." });
            }
        }

        const funcionarios = await listarFuncionariosPorEstacionamento(estacionamentoId);
        res.status(200).json(funcionarios);
    } catch (error) {
        console.error("Erro ao listar funcionários:", error);
        res.status(500).json({ message: "Erro interno ao listar funcionários." });
    }
};

export const removerFuncionarioController = async (req, res) => {
    try {
        const { estacionamentoId, funcionarioId } = req.params;
        const requisitante = req.usuario;

        if (requisitante.papel !== 'ADMINISTRADOR') {
            const ehDono = await verificarDonoDoEstacionamento(estacionamentoId, requisitante.id_usuario);
            if (!ehDono) {
                return res.status(403).json({ message: "Acesso proibido." });
            }
        }

        registrarLog({
            id_usuario_acao: req.usuario.id_usuario,
            id_estacionamento: estacionamentoId,
            acao: 'FUNCIONÁRIO REMOVIDO',
            detalhes: { funcionarioIdRemovido: funcionarioId }
        });

        await removerFuncionario(estacionamentoId, funcionarioId);
        res.status(204).send();

    } catch (error) {

        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Funcionário não encontrado neste estacionamento." });
        }
        console.error("Erro ao remover funcionário:", error);
        res.status(500).json({ message: "Erro interno ao remover funcionário." });
    }
};

export const atualizarPermissaoController = async (req, res) => {
    try {
        const { estacionamentoId, funcionarioId } = req.params;
        const { body } = atualizarFuncionarioSchema.parse(req);
        const requisitante = req.usuario;

        if (requisitante.papel !== 'ADMINISTRADOR') {
            const ehDono = await verificarDonoDoEstacionamento(estacionamentoId, requisitante.id_usuario);
            if (!ehDono) {
                return res.status(403).json({ message: "Acesso proibido. Você não é o proprietário deste estacionamento." });
            }
        }

        const funcionarioAtualizado = await atualizarPermissaoFuncionario(estacionamentoId, funcionarioId, body.permissao);
        res.status(200).json({ message: "Permissão do funcionário atualizada com sucesso.", funcionario: funcionarioAtualizado });

    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }

        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Funcionário não encontrado neste estacionamento." });
        }
        console.error("Erro ao atualizar permissão do funcionário:", error);
        res.status(500).json({ message: "Erro interno ao atualizar permissão." });
    }
};
export const criarEAdicionarFuncionarioController = async (req, res) => {
    try {
        const { estacionamentoId } = req.params;
        const { body } = criarEAdicionarFuncionarioSchema.parse(req);
        const requisitante = req.usuario;

        if (requisitante.papel !== 'ADMINISTRADOR') {
            const ehDono = await verificarDonoDoEstacionamento(estacionamentoId, requisitante.id_usuario);
            if (!ehDono) {
                return res.status(403).json({ message: "Acesso proibido. Você não gerencia este estacionamento." });
            }
        }

        const emailExistente = await prisma.usuario.findUnique({ where: { email: body.email } });
        if (emailExistente) {
            return res.status(409).json({ message: "Este email já pertence a um usuário existente." });
        }


        const novoFuncionarioVinculado = await prisma.$transaction(async (tx) => {
            // Cria um usuário com uma senha temporária aleatória. O funcionário deverá usar o "Esqueci a senha".
            const senhaTemporaria = Math.random().toString(36).slice(-8);
            const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

            const novoUsuario = await tx.usuario.create({
                data: {
                    nome: body.nome,
                    email: body.email,
                    telefone: body.telefone,
                    senha: senhaHash,
                    papel: 'FUNCIONARIO', // Papel base
                }
            });

            const novoVinculo = await tx.estacionamento_funcionario.create({
                data: {
                    id_estacionamento: parseInt(estacionamentoId),
                    id_usuario: novoUsuario.id_usuario,
                    permissao: body.permissao,
                }
            });
            return novoVinculo;
        });
        registrarLog({
            id_usuario_acao: req.usuario.id_usuario,
            id_estacionamento: estacionamentoId,
            acao: 'NOVO FUNCIONÁRIO CONTRATADO',
            detalhes: { emailContratado: body.email, permissao: body.permissao }
        });

        res.status(201).json({ message: "Funcionário criado e vinculado com sucesso!", funcionario: novoFuncionarioVinculado });

    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados inválidos.", errors: error.flatten().fieldErrors });
        }
        console.error("Erro ao criar e adicionar funcionário:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};