import jwt from 'jsonwebtoken';

// Middleware para verificar se o usuário está autenticado
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    const token = authHeader.substring(7); 

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido ou expirado.' });
        }

        req.usuario = decoded;
        next(); 
    });
};

// Middleware para verificar se o usuário está AUTORIZADO (verificação de papel/role)
export const authorize = (papeisPermitidos = []) => {
    return (req, res, next) => {
        
        if (papeisPermitidos.length === 0) {
            return res.status(403).json({ message: 'Permissões não configuradas para esta rota.' });
        }

        const papelDoUsuario = req.usuario.papel;

        
        if (!papeisPermitidos.includes(papelDoUsuario)) {
           
            return res.status(403).json({ message: 'Acesso proibido. Você não tem a permissão necessária.' });
        }

        next(); 
    };
};