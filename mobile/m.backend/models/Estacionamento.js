import { create, readAll, read, update, deleteRecord } from '../config/database.js';

export const getEstacionamentos = async () => {
    try {
        return await readAll('estabelecimentos');
    } catch (error) {
        console.error('Não foi possível obter os estacionamentos', error);
        throw error;
    }
};

export const getEstacionamentosById = async (id) => {
    try {
        return await read('estabelecimentos', 'id = ?', [id]);
    } catch (error) {
        console.error(`Não foi possível obter o estacionamento ${id}`, error);
        throw error
    }
};

export const postEstacionamento = async (estacionamentoData) => {
    try {
        return await create('estabelecimentos', estacionamentoData);
    } catch (error) {
        console.error('Não foi possível criar o estacionamento', error);
        throw error
    }
};

export const putEstacionamento = async (id, estatacionamentoData) => {
    try {
        return await update('estabelecimentos', estatacionamentoData, `id = ?`, [id]);
    } catch (error) {
        console.error('Não foi possível atualizar o estacionamento', error);
        throw error;
    }
}

export const deleteEstacionamento = async (id) => {
    try {
        return await deleteRecord('estabelecimentos', `id = ?`, [id]);
    } catch (error) {
        console.error('Não foi possível excluir o estacionamento', error);
        throw error;
    }
}; 