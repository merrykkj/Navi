import { create } from '../config/database.js';


export const Cadastro = async (cadastroData) => {
    try {
        return await create('usuarios', cadastroData);
    } catch (error) {
        console.error('Não foi possível fazer o cadastro', error);
        throw error
    }
};