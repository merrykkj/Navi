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

export const putVeiculoController = async (req, res) => {
    try {
        const usuario_id = req.usuarioId;
        const { modelo, placa, cor } = req.body;

        const veiculoData = {
            modelo: modelo,
            placa: placa,
            cor: cor
        }
        
        if(!modelo || !placa || !cor){
            return res.status(400).json({message: 'Todos os campos são obrigatórios'});
        }

        const veiculoAtualizado = await putEstacionamento(usuario_id, veiculoData);
        if (veiculoAtualizado) {
            res.status(200).json({ message: 'Veículo atualizado com sucesso' });
        } else {
            res.status(404).json({ message: 'Veículo não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao atualizar o veículo:', error);
        res.status(500).json({ message: 'Erro ao atualizar o veículo' });
    }
}