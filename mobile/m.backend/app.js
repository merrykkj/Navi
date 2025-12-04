// Importação dos módulos necessários
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/authRoutes.js';
import cadastroRoutes from './routes/cadastroRoutes.js';
import estacionamentoRoutes from './routes/EstacionamentoRoutes.js';
import authMiddleware from './middlewares/AuthMiddleware.js';
import profileRoutes from './routes/profileRoutes.js';
// import vagaRoutes from './routes/VagaRoutes.js';
import veiculoRoutes from './routes/veiculoRoutes.js';
// import reservaRoutes from './routes/ReservRoutes.js'; 

// Configuração do Express
const app = express();
const port = 3002;
app.use(express.json());

// Rotas
app.get('/', authMiddleware, (req, res) => {
    res.send('API de Estacionamento funcionando!');
});

app.use('/auth', authRoutes);
app.use('/estacionamentos', estacionamentoRoutes);
app.use('/cadastro', cadastroRoutes);
app.use('/profile', profileRoutes);
app.use('/veiculo', veiculoRoutes);
// app.use('/vagas', vagaRoutes);
// app.use('/reservas', reservaRoutes);

//Comunicação com a porta
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta: ${port}`)
});