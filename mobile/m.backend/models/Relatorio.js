// src/models/Relatorio.js
import prisma from '../config/prisma.js';

// Funções de KPI Genéricas que aceitam um array de IDs de estacionamento.
// Se o array for 'undefined', calcula para o sistema inteiro (caso do Admin).

export const contarVagasNosEstacionamentos = async (estacionamentoIds) => {
    const whereClause = estacionamentoIds ? { id_estacionamento: { in: estacionamentoIds } } : {};

    const [total, livre, ocupada, reservada] = await Promise.all([
        prisma.vaga.count({ where: whereClause }),
        prisma.vaga.count({ where: { ...whereClause, status: 'LIVRE' } }),
        prisma.vaga.count({ where: { ...whereClause, status: 'OCUPADA' } }),
        prisma.vaga.count({ where: { ...whereClause, status: 'RESERVADA' } }),
    ]);
    return { total, livre, ocupada, reservada };
};

export const calcularReceitaNosEstacionamentos = async (estacionamentoIds) => {
    const whereClause = estacionamentoIds ? { reserva: { vaga: { id_estacionamento: { in: estacionamentoIds } } } } : {};
    
    const data30DiasAtras = new Date();
    data30DiasAtras.setDate(data30DiasAtras.getDate() - 30);

    const resultado = await prisma.pagamento.aggregate({
        _sum: { valor_liquido: true },
        where: {
            status: 'APROVADO',
            data_hora: { gte: data30DiasAtras },
            ...whereClause
        },
    });
    return resultado._sum.valor_liquido || 0;
};

export const contarReservasAtivasNosEstacionamentos = async (estacionamentoIds) => {
    const whereClause = estacionamentoIds ? { vaga: { id_estacionamento: { in: estacionamentoIds } } } : {};

    return prisma.reserva.count({
        where: {
            status: 'ATIVA',
            ...whereClause
        }
    });
};
// Busca KPIs para um único estacionamento
export const getKpisForEstacionamento = async (estacionamentoId) => {
    const id = parseInt(estacionamentoId);
    const data30DiasAtras = new Date();
    data30DiasAtras.setDate(data30DiasAtras.getDate() - 30);

    const [vagas, receita, reservasAtivas] = await Promise.all([
        // Contagem de Vagas
        prisma.vaga.groupBy({
            by: ['status'],
            where: { id_estacionamento: id },
            _count: { status: true }
        }),
        // Receita
        prisma.pagamento.aggregate({
            _sum: { valor_liquido: true },
            where: { status: 'APROVADO', data_hora: { gte: data30DiasAtras }, reserva: { vaga: { id_estacionamento: id } } }
        }),
        // Reservas
        prisma.reserva.count({ where: { status: 'ATIVA', vaga: { id_estacionamento: id } } })
    ]);

    // Formata os dados de vagas
    const vagasStatus = { LIVRE: 0, OCUPADA: 0, RESERVADA: 0, MANUTENCAO: 0 };
    vagas.forEach(item => { vagasStatus[item.status] = item._count.status; });
    const totalVagas = Object.values(vagasStatus).reduce((a, b) => a + b, 0);

    return {
        receitaMes: receita._sum.valor_liquido || 0,
        reservasAtivas,
        vagas: { ...vagasStatus, total: totalVagas }
    };
};

// Calcula a média de avaliações de um estacionamento
export const getAvaliacaoMedia = async (estacionamentoId) => {
    const id = parseInt(estacionamentoId);
    const resultado = await prisma.avaliacao.aggregate({
        _avg: { nota: true },
        where: { id_estacionamento: id }
    });
    return resultado._avg.nota || 0;
};