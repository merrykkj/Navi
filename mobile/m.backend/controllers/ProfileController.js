import { getProfileById, putProfile } from '../models/Profile.js';

export const getProfileController = async (req, res) => {
    try {
        const usuario = await getProfileById(req.usuarioId);
        if (usuario) {
            res.status(200).json(usuario);
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }

    } catch (error) {
        console.error('Erro ao obter o perfil do usuário:', error);
        res.status(500).json({ message: 'Erro ao obter o perfil do usuário' });
    }
}

export const putProfileController = async (req, res) => {
    try {
        const profileId = req.usuarioId;
        const { nome, email, telefone, veiculo } = req.body;

        const profileData = {
            nome: nome,
            email: email,
            telefone: telefone
        };

        const usuarioAtualizado = await putProfile(profileId, profileData);
        if (usuarioAtualizado) {
            res.status(200).json({ message: 'Perfil do usuário atualizado com sucesso' });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // if (veiculo) {
        //     await upsertVeiculo(profileId, veiculo);
        // }

        // res.status(200).json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar o perfil do usuário:', error);
        res.status(500).json({ message: 'Erro ao atualizar o perfil do usuário' });
    }
}