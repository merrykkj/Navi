import { criarContrato, obterContratoPorId, listarContratosPorUsuario, listarContratosPorEstacionamento, atualizarContrato } from "../models/Contrato.js";
import { criarContratoSchema, atualizarContratoSchema } from "../schemas/contrato.schema.js";
import { registrarLog } from "../services/logServices.js";
import prisma from "../config/prisma.js";


export const criarContratoController = async (req, res) => {
    try {
        const { body } = criarContratoSchema.parse(req);
        const requisitanteId = req.usuario.id_usuario;

        const veiculo = await prisma.veiculo.findUnique({ where: { id_veiculo: body.id_veiculo } });
        if (!veiculo || veiculo.id_usuario !== requisitanteId) {
            return res.status(403).json({ message: "Acesso proibido. O veículo informado não pertence a você." });
        }
        const contratoExistente = await prisma.contrato_mensalista.findFirst({
            where: { id_veiculo: body.id_veiculo, status: 'ATIVO' }
        });
        if (contratoExistente) {
            return res.status(409).json({ message: "Conflito: Este veículo já possui um contrato de mensalista ativo." });
        }

        
        const novoContrato = await criarContrato(body, requisitanteId);
                registrarLog({
            id_usuario_acao: requisitanteId,
            id_estacionamento: contratoCompleto.plano_mensal.id_estacionamento,
            acao: 'NOVO CONTRATO DE MENSALISTA',
            detalhes: { contratoId: novoContrato.id_contrato, plano: contratoCompleto.plano_mensal.nome_plano }
        });


        res.status(201).json({ message: "Contrato de mensalista criado com sucesso!", contrato: novoContrato });

    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Dados de entrada inválidos.", errors: error.flatten().fieldErrors });
        }
        console.error("Erro ao criar contrato:", error);
        res.status(500).json({ message: "Erro interno ao criar contrato." });
    }
};

export const listarMeusContratosController = async (req, res) => {
    try {
        const requisitanteId = req.usuario.id_usuario;
        const contratos = await listarContratosPorUsuario(requisitanteId);
        res.status(200).json(contratos);
    } catch (error) {
        console.error("Erro ao listar seus contratos:", error);
        res.status(500).json({ message: "Erro interno ao listar contratos." });
    }
};

export const cancelarMeuContratoController = async (req, res) => {
    try {
        const { contratoId } = req.params;
        const requisitante = req.usuario;

        const contratoAlvo = await obterContratoPorId(contratoId);
        if (!contratoAlvo) {
            return res.status(404).json({ message: "Contrato не encontrado." });
        }

        if (contratoAlvo.id_usuario !== requisitante.id_usuario) {
            return res.status(403).json({ message: "Acesso proibido. Você não pode cancelar este contrato." });
        }

        if (contratoAlvo.status !== 'ATIVO') {
            return res.status(400).json({ message: "Ação inválida: este contrato não está mais ativo." });
        }

        const dadosAtualizacao = { status: 'CANCELADO', data_fim: new Date() };
              registrarLog({
            id_usuario_acao: requisitante.id_usuario,
            id_estacionamento: contratoAlvo.plano_mensal.id_estacionamento,
            acao: 'CONTRATO DE MENSALISTA CANCELADO',
            detalhes: { contratoId: contratoAlvo.id_contrato }
        });
        const contratoCancelado = await atualizarContrato(contratoId, dadosAtualizacao);

        res.status(200).json({ message: "Contrato cancelado com sucesso.", contrato: contratoCancelado });
    } catch (error) {
        console.error("Erro ao cancelar contrato:", error);
        res.status(500).json({ message: "Erro interno ao cancelar contrato." });
    }
};


export const listarContratosDeEstacionamentoController = async (req, res) => {
    try {

        const { estacionamentoId } = req.params;
        const contratos = await listarContratosPorEstacionamento(estacionamentoId);
        res.status(200).json(contratos);
    } catch (error) {
        console.error("Erro ao listar contratos do estacionamento:", error);
        res.status(500).json({ message: "Erro interno ao listar contratos do estacionamento." });
    }
};