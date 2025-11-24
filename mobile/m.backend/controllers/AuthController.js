import * as bcrypt from 'bcryptjs';

const loginController = async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Verificar se o usuário existe no banco de dados
        const usuario = await read('usuarios', `email = '${email}'`);

        if (!usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }

        // Verificar se a senha está correta (comparar a senha enviada com o hash armazenado)
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: 'Senha incorreta' });
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ mensagem: 'Erro ao fazer login' });
    }
};

export { loginController };