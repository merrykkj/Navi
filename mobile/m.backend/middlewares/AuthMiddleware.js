import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js'; // Importar a chave secreta

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensagem: 'Não autorizado: Token não fornecido' });
  }

  const [ , token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuarioId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ mensagem: 'Não autorizado: Token inválido' });
  }
};

export default authMiddleware;

// Middleware para verificar se o usuário está AUTORIZADO (verificação de papel/role)
// export const authorize = (papeisPermitidos = []) => {
//     return (req, res, next) => {
        
//         if (papeisPermitidos.length === 0) {
//             return res.status(403).json({ message: 'Permissões não configuradas para esta rota.' });
//         }

//         const papelDoUsuario = req.usuario.papel;

        
//         if (!papeisPermitidos.includes(papelDoUsuario)) {
           
//             return res.status(403).json({ message: 'Acesso proibido. Você não tem a permissão necessária.' });
//         }

//         next(); 
//     };
// };