import { getVeiculosByUsuarioId, postEstacionamento, putEstacionamento, deleteEstacionamento } from "../models/Veiculo.js";

export const getVeiculoByIdController = async (req, res) => {
    try {
        const usuarioId = req.usuarioId;
        const veiculo = await getVeiculosByUsuarioId(usuarioId);
        if (veiculo) {
            res.status(200).json(veiculo);
        } else {
            res.status(404).json({ message: 'Veículo não encontrado' });
        }

    } catch (error) {
        console.error('Erro ao obter o veículo:', error);
        res.status(500).json({ message: 'Erro ao obter o veículo' });
        
    }
}