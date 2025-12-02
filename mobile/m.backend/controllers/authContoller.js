import jwt from 'jsonwebtoken';
import { read, compare } from '../config/database.js';
import { JWT_SECRET } from '../config/jwt.js';

const loginController = async (req, res) => {
    const { email, senha } = req.body;
    
    try {
        if (!email || !senha) {
            return res.status(400).json({ message: "Por favor insira o email e a senha!" });
        }
        // Verificar se o usuário existe no banco de dados
        const usuario = await read('usuarios', `email = '${email}'`);

        if (!usuario || usuario.length === 0) {
            return res.status(404).json({ message: 'E-mail não encontrado! Tente novamente!' });
        }
        
        // Verificar se a senha está correta (comparar a senha enviada com o hash armazenado)
        const senhaCorreta = await compare(senha, usuario.senha);
        
        if (!senhaCorreta) {
            return res.status(401).json({ message: 'Senha incorreta! Tente novamente!' });
        }
        
        // Gerar o token JWT
        const payload = { id: usuario.id, displayName: usuario.nome, email: usuario.email };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

        // Adicione o objeto user ao retorno
        res.json({
            message: 'Login realizado com sucesso!' + " Bem-vindo de volta, " + usuario.nome + "!",
            token,
            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                url_foto_perfil: usuario.url_foto_perfil
            }
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ mensagem: 'Erro ao fazer login' });
    }
};

export { loginController };