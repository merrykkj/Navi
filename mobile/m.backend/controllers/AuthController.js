import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Schema Zod
const loginSchema = z.object({
  email: z.string().email("Formato de email inválido."),
  senha: z.string().min(1, "A senha é obrigatória."),
});

// Função de Login
export const login = async (req, res) => {
    try {
    
        const { email, senha } = loginSchema.parse(req.body);
    
        const usuario = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!usuario || !usuario.ativo) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, papel: usuario.papel },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        const { senha: _, ...usuarioSemSenha } = usuario;
        
        res.status(200).json({
            message: 'Login realizado com sucesso!',
            token: token,
            usuario: usuarioSemSenha
        });

    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }
        
        console.error('Erro detalhado no processo de login:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
};

// Função Esqueci a Senha
export const EsqueceuSenha = async (req, res) => {
    try {
        const { email } = req.body;

          if (!email) {
            return res.status(400).json({ message: "O email é obrigatório." });
        }

        const usuario = await prisma.usuario.findUnique({ where: { email } });

        if (usuario) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

            await prisma.usuario.update({
                where: { email },
                data: { resetToken: hashedToken, resetTokenExpires: tokenExpiry },
            });

            enviarEmailResetSenha(usuario.email, resetToken)
                .then(() => console.log(`LOG: Processo de envio de email para ${usuario.email} iniciado em segundo plano.`))
                .catch(err => console.error(`ERRO EM SEGUNDO PLANO: Falha ao enviar email para ${usuario.email}:`, err));

        }
        
        // A resposta para o usuário é ENVIADA IMEDIATAMENTE, não espera o email.
        res.status(200).json({ message: "Email Confirmado, um link de recuperação foi enviado." });

    } catch (error) {
        console.error("Erro na solicitação de redefinição de senha:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};


// Função para Resetar Senha
export const ResetarSenha = async (req, res) => {
    try {
        const { token } = req.params;
        const { novaSenha } = req.body;
        
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const usuario = await prisma.usuario.findFirst({
            where: {
                resetToken: hashedToken,
                resetTokenExpires: { gte: new Date() },
            },
        });

        if (!usuario) {
            return res.status(400).json({ message: "Token inválido ou expirado." });
        }
        
        if (!novaSenha || novaSenha.length < 8) {
            return res.status(400).json({ message: "A nova senha precisa ter no mínimo 8 caracteres." });
        }

        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

        await prisma.usuario.update({
            where: { id_usuario: usuario.id_usuario },
            data: {
                senha: novaSenhaHash,
                resetToken: null,
                resetTokenExpires: null,
            },
        });

        res.status(200).json({ message: "Senha redefinida com sucesso! Você já pode fazer login." });

    } catch (error) {
        console.error("Erro ao redefinir a senha:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};