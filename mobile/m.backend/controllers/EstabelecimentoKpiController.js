import { getVagaKpis, getMediaAvaliacaoPlataforma } from "../models/EstabelecimentoKpiModel.js";
import { listarEstacionamentos } from "../models/Estacionamento.js"; 

export const getEstablishmentSummaryKpis = async (req, res) => {
    try {
        const [vagasKpis, mediaAvaliacao, todosEstacionamentos] = await Promise.all([
            getVagaKpis(),
            getMediaAvaliacaoPlataforma(),
            listarEstacionamentos(),
        ]);

        const totalVagas = vagasKpis.total;
        const ocupadas = vagasKpis.status.find(s => s.status === 'OCUPADA')?.count || 0;
        const reservadas = vagasKpis.status.find(s => s.status === 'RESERVADA')?.count || 0;
        const totalOcupado = ocupadas + reservadas;
        const ocupacaoMedia = totalVagas > 0 ? parseFloat(((totalOcupado / totalVagas) * 100).toFixed(1)) : 0.0;
        const totalEstabs = todosEstacionamentos.length;
        const activeEstabs = todosEstacionamentos.filter(e => e.ativo).length;
        
        // Placeholder: Este cálculo tem que ser feito em um Model real contra a tabela Pagamento !!LEMBRAR DE FAZER
        const receitaMediaPorVaga = 155.50; 
        const receitaMediaChange = 10.1; 

        res.status(200).json({
            vagas: {
                total: totalVagas,
                ocupacaoMedia: ocupacaoMedia,
                ocupadas: ocupadas,
                reservadas: reservadas,
            },
            estabelecimentos: {
                total: totalEstabs,
                ativos: activeEstabs,
            },
            desempenho: {
                receitaMediaPorVaga: { value: receitaMediaPorVaga, change: receitaMediaChange, unit: 'R$' },
                mediaAvaliacaoPlataforma: { value: mediaAvaliacao.media, change: 0.0, unit: '★' },
            }
        });

    } catch (error) {
        console.error("Erro ao buscar KPIs de Estabelecimento:", error);
        res.status(500).json({ message: "Erro interno ao calcular KPIs de estacionamento." });
    }
};