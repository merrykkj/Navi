import { Cadastro } from "../models/Cadastro.js";
import { generateHashedPassword } from '../utils/senhaHash.js'

export const cadastroController = async (req, res) => {
    try {
        const { nome, email, senha, telefone } = req.body;

        const senhaHasheada = await generateHashedPassword(senha)

        const cadastroData = {
            nome: nome,
            email: email,
            senha: senhaHasheada,
            telefone: telefone
        }
        const cadastroId = await Cadastro(cadastroData)
        res.status(201).json({ message: 'Cadastrado com sucesso', cadastroId })
    } catch (error) {
        console.error('Não foi possível cadastrar o usuário: ', error)
        res.status(500).json({ message: 'Erro ao cadastrar usuário' })
    }
}