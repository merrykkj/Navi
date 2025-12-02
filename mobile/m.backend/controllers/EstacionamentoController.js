import { getEstacionamentos, getEstacionamentosById } from "../models/Estacionamento.js";

export const getEstacionamentosController = async (req, res) => {
    try {
        const estacionamentos = await getEstacionamentos();
        res.status(200).send(estacionamentos)
    } catch (error) {
        console.error('Erro ao obter os estacionamentos', error)
        res.status(500).json({ message: 'Erro ao obter os estacionamentos' })
    }
}

export const getEstacionamentosByIdController = async (req, res) => {
    try {
        const estacionamento = await getEstacionamentosById(req.params.id)
        if (estacionamento) {
            res.status(200).json(estacionamento)
        } else {
            res.status(404).json({ message: 'Estacionamento não encontrado' })
        }
    } catch (error) {
        console.error('Erro ao obter o estacionamento pelo ID:', error)
        res.status(500).json({ message: 'Erro ao obter o estacionamento' })
    }
}