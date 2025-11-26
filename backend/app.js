// backend/app.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';

import authRoutes from './routes/authRoutes.js';
import usuarioRoutes from './routes/UsuarioRoutes.js';
import estacionamentoRoutes from './routes/EstacionamentoRoutes.js';
import vagaRoutes from './routes/VagaRoutes.js';
import veiculoRoutes from './routes/VeiculoRoutes.js';
import reservaRoutes from './routes/ReservRoutes.js'; 
import contratoRoutes from './routes/ContratoRoutes.js';
import cupomRoutes from './routes/CupomRoutes.js';
import relatoriosRoutes from './routes/RelatoriosRoutes.js';
import chatRoutes from './routes/ChatRoutes.js';
import naviRoutes from './routes/NaviRoutes.js'; 
import estabelecimentoKpiRoutes from './routes/EstabelecimentoKpiRoutes.js';
import usuarioKpiRoutes from './routes/UsuarioKpiRoutes.js';

import { Server } from 'socket.io';

const port = process.env.PORT || 3000;
const app = express();
const httpServer = http.createServer(app);

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST"]
}));

app.use(express.json());

// ==============================
//  SOCKET.IO CONFIG
// ==============================
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

// Compartilha io para controllers
app.set("io", io);

io.on("connection", (socket) => {
    console.log("🔌 Cliente conectado:", socket.id);

    // 🟡 ENTRAR NA SALA (chat)
    socket.on("entrar-na-sala", (chatId) => {
        socket.join(chatId.toString());
        console.log(`➡️  ${socket.id} entrou na sala ${chatId}`);
    });

    // 🔴 SAIR DA SALA
    socket.on("sair-da-sala", (chatId) => {
        socket.leave(chatId.toString());
        console.log(`⬅️  ${socket.id} saiu da sala ${chatId}`);
    });

    // 🟠 DIGITANDO
    socket.on("digitando", ({ chatId, usuarioId }) => {
        socket.to(chatId.toString()).emit("digitando", { chatId, usuarioId });
    });

    // 🟣 PAROU DE DIGITAR
    socket.on("parou-digitando", ({ chatId, usuarioId }) => {
        socket.to(chatId.toString()).emit("parou-digitando", { chatId, usuarioId });
    });

    // 🟢 LER MENSAGEM
    socket.on("ler-mensagem", ({ chatId, msgId, usuarioId }) => {
        socket.to(chatId.toString()).emit("mensagem-lida", {
            id_mensagem: msgId,
            id_leitor: usuarioId
        });
    });

    socket.on("disconnect", () => {
        console.log("❌ Cliente desconectado:", socket.id);
    });
});

// ==============================
// Rotas
// ==============================
app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/estacionamentos', estacionamentoRoutes);
app.use('/vagas', vagaRoutes);
app.use('/veiculos', veiculoRoutes);
app.use('/reservas', reservaRoutes);
app.use('/contratos', contratoRoutes);
app.use('/cupons', cupomRoutes);
app.use('/relatorios', relatoriosRoutes);
app.use('/chat', chatRoutes);
app.use('/estabelecimentos/kpi', estabelecimentoKpiRoutes);
app.use('/usuarios/kpi', usuarioKpiRoutes);
app.use('/api', naviRoutes); 
app.get('/', (req, res) => {
    res.send('API Navi + WebSocket rodando!');
});

httpServer.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
