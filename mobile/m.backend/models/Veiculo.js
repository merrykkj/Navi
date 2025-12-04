import { read, update, deleteRecord } from '../config/database.js';

export const getVeiculoById = async (id) => {
    try {
        return await read('veiculos', `id = ?`, [id])
    } catch (error) {
        console.error(`Erro ao obter o veiculo id: ${id}`, error)
        throw error
    }
}

export const getVeiculosByUsuarioId = async (usuarioId) => {
    try {
        return await read('veiculos', `usuario_id = ?`, [usuarioId])
    } catch (error) {
        console.error(`Erro ao obter os veiculos do usuario id: ${usuarioId}`, error)
        throw error
    }
}

export const postEstacionamento = async (veiculoData) => {
    try {
        return await create('veiculos', veiculoData)
    } catch (error) {
        console.error('Erro ao criar estacionamento: ', error)
        throw error
    }
}

export const putEstacionamento = async (id, veiculoData) => {
    try {
        return await update('veiculos', veiculoData, `usuario_id = ?`, [id])
    } catch (error) {
        console.error('Erro ao atualizar estacionamento: ', error)
        throw error
    }
}

export const deleteEstacionamento = async (id) => {
    try {
        return await deleteRecord('veiculos', `id = ?`, [id])
    } catch (error) {
        console.error('Erro ao excluir estacionamento: ', error)
        throw error
    }
}

