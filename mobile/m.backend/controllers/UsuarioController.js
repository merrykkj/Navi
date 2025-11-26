import { criarUsuario, atualizarUsuario, desativarUsuario, listarUsuarios, obterUsuarioPorId} from "../models/Usuario.js";
import { criarUsuarioSchema, atualizarUsuarioSchema } from '../schemas/usuario.schema.js';
import prisma from "../config/prisma.js";
import { paramsSchema } from '../schemas/params.schema.js';

const removerSenha = (usuario) => {
    if (!usuario) return null;
    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
};


export const criarUsuarioController = async (req, res) => {
    try {
       
        const { body } = criarUsuarioSchema.parse(req);

        if (!body.papel) {
            body.papel = 'MOTORISTA'; // Padrão Motorista
        }

      
        const novoUsuario = await criarUsuario(body);
        res.status(201).json({ message: "Usuário criado com sucesso!", usuario: removerSenha(novoUsuario) });

    } catch (error) {
     
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }
        if (error.code === 'P2002' && error.meta?.target.includes('email')) {
             return res.status(409).json({ message: 'Este email já está em uso.' });
        }
        console.error("Erro ao criar usuário:", error);
        res.status(500).json({ message: "Erro interno ao criar usuário." });
    }
};


export const atualizarUsuarioController = async (req, res) => {
    try {
        const { params } = paramsSchema.parse(req);
        const { body } = atualizarUsuarioSchema.parse(req);
        const idAlvo = parseInt(params.id);       // ID do usuário a ser editado
        const requisitante = req.usuario; // O usuário que está fazendo a requisição (ex: o proprietário)

        let permissaoConcedida = false;
        
        // Regra 1: O próprio usuário pode se editar
        if (requisitante.id_usuario === idAlvo) {
            permissaoConcedida = true;
        }
        
        // Regra 2: Um Administrador pode editar qualquer um
        if (requisitante.papel === 'ADMINISTRADOR') {
            permissaoConcedida = true;
        }

        // --- NOVA REGRA 3: Um Proprietário pode editar um usuário se este for seu funcionário ---
        if (requisitante.papel === 'PROPRIETARIO' && !permissaoConcedida) {
            // Verifica se existe um vínculo na tabela `estacionamento_funcionario`
            const vinculo = await prisma.estacionamento_funcionario.findFirst({
                where: {
                    id_usuario: idAlvo, // O usuário-alvo é o funcionário
                    estacionamento: {
                        id_proprietario: requisitante.id_usuario // E o estacionamento pertence ao requisitante
                    }
                }
            });
            // Se o vínculo existir, a permissão é concedida
            if (vinculo) {
                permissaoConcedida = true;
            }
        }
        
        // Se nenhuma das regras foi atendida, bloqueia o acesso
        if (!permissaoConcedida) {
            return res.status(403).json({ message: "Acesso proibido. Você não tem permissão para editar este usuário." });
        }
        
        // Impede que usuários não-admin alterem seu próprio papel
        if (body.papel && requisitante.papel !== 'ADMINISTRADOR') {
            delete body.papel;
        }

        const usuarioAtualizado = await atualizarUsuario(idAlvo, body);
        res.status(200).json({ message: "Usuário atualizado com sucesso!", usuario: removerSenha(usuarioAtualizado) });

    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }
        if (error.code === 'P2002' && error.meta?.target.includes('email')) {
            return res.status(409).json({ message: 'Conflito: Este email já está em uso por outra conta.' });
        }
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ message: "Erro ao atualizar usuário." });
    }
};

export const excluirUsuarioController = async (req, res) => {
    try {
       
        const { params } = paramsSchema.parse(req);
        const idAlvo = parseInt(params.id);
        const requisitante = req.usuario;

        if (requisitante.id_usuario !== idAlvo && requisitante.papel !== 'ADMINISTRADOR') {
            return res.status(403).json({ message: "Acesso proibido. Você só pode excluir seu próprio perfil." });
        }
        
        await desativarUsuario(idAlvo);
        res.status(204).send();
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados inválidos.", errors: error.flatten().fieldErrors });
        }
        console.error("Erro ao excluir usuário:", error);
        res.status(500).json({ message: "Erro interno ao excluir usuário." });
    }
};

export const listarUsuariosController = async (req, res) => {
    try {
        const usuarios = await listarUsuarios();
        const usuariosSemSenha = usuarios.map(removerSenha);
        res.status(200).json(usuariosSemSenha);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar usuários." });
    }
};

export const obterUsuarioPorIdController = async (req, res) => {
    try {
        const { params } = paramsSchema.parse(req);
        const usuario = await obterUsuarioPorId(params.id);
        
        if (usuario) {
            res.status(200).json(removerSenha(usuario));
        } else {
            res.status(404).json({ message: "Usuário não encontrado." });
        }
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "ID de usuário inválido.", errors: error.flatten().fieldErrors });
        }
        res.status(500).json({ message: "Erro ao obter usuário." });
    }
};