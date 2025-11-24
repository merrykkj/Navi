import prisma from '../config/prisma.js';

/**
 * Retorna as métricas de vagas para o cálculo de KPIs de ocupação.
 * @returns {Promise<Array<{status: string, count: number}>>}
 */
export const getVagaKpis = async () => {
    // 1. Total de Vagas por Status (LIVRE, OCUPADA, RESERVADA)
    const vagasPorStatus = await prisma.vaga.groupBy({
        by: ['status'],
        _count: {
            status: true,
        },
    });

    // 2. Retorna a contagem total de todas as vagas (necessário para total)
    const totalVagas = await prisma.vaga.count();

    return {
        total: totalVagas,
        status: vagasPorStatus.map(item => ({
            status: item.status,
            count: item._count.status,
        })),
    };
};


/**
 * Retorna a nota média da plataforma para o cálculo de KPIs.
 * @returns {Promise<{media: number}>}
 */
export const getMediaAvaliacaoPlataforma = async () => {
    const resultado = await prisma.avaliacao.aggregate({
        _avg: {
            nota: true,
        },
        // Você pode adicionar um 'where' aqui para filtrar avaliações muito antigas
    });

    const media = resultado._avg.nota ? parseFloat(resultado._avg.nota.toFixed(1)) : 0.0;
    
    return { media };
};

// NOTA: Para calcular a Receita Média, você precisaria de uma consulta complexa
// na tabela 'pagamento' filtrada por 'status: APROVADO' e agrupada.
// Por hora, usaremos um valor placeholder até que essa query seja implementada.