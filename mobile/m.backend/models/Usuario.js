// src/models/Usuario.js

import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';


const listarUsuarios = async () => {
    return await prisma.usuario.findMany();
};

const obterUsuarioPorId = async (id) => {
    return await prisma.usuario.findUnique({
        where: { 
            id_usuario: parseInt(id),
        }
    });
};

const criarUsuario = async (dadosUsuario) => {

    const senhaHash = await bcrypt.hash(dadosUsuario.senha, 10);
    
    return await prisma.usuario.create({
        data: {
            ...dadosUsuario,
            senha: senhaHash,
        }
    });
};

const atualizarUsuario = async (id, dadosUsuario) => {
    console.log(`[UsuarioModel] PATCH/PUT - ID: ${id}. Dados Recebidos:`, dadosUsuario);

    if (dadosUsuario.senha) {
        dadosUsuario.senha = await bcrypt.hash(dadosUsuario.senha, 10);
    }

    try {
        const resultado = await prisma.usuario.update({
            where: { id_usuario: parseInt(id) },
            data: dadosUsuario,
        });
        console.log(`[UsuarioModel] Sucesso no Update:`, resultado);
        return resultado;
    } catch (error) {
        console.error(`[UsuarioModel] ERRO no Prisma Update:`, error);
        throw error;
    }
};

const desativarUsuario = async (id) => {
    return await prisma.usuario.update({
        where: { id_usuario: parseInt(id) },
        data: { ativo: false },
    });
};

export { listarUsuarios, obterUsuarioPorId, criarUsuario, atualizarUsuario, desativarUsuario };