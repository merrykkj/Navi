import express from 'express';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import {estacionamentoController} from '../models/Estacionamento.js'

const router = express.Router();

router.get('/', estacionamentoController)

export default router