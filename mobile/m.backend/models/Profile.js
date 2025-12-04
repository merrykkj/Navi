import { read, update } from '../config/database.js';

export const getProfileById = async (id) => {
    try {
        return await read('usuarios', 'id = ?', [id])
    } catch (error) {
        console.error(`Não foi possível obter o perfil do usuário ${id}`, error);
        throw error;
    }
}

export const putProfile = async (id, profileData) => {
    try {
        return await update('usuarios', profileData, 'id = ?', [id]);
    } catch (error) {
        console.error(`Não foi possível atualizar o perfil do usuário ${id}`, error);
        throw error;
    }
}