import { PrismaClient } from "../../backend/generated/prisma/index.js";
import { getDistribuicaoPapeis, getTotalVeiculos } from "../models/UsuarioKpiModel.js";

const prisma = new PrismaClient();

export const getUserSummaryKpis = async (req, res) => {
    try {
        const [distribuicaoPapeis, totalVeiculos] = await Promise.all([
            getDistribuicaoPapeis(),
            getTotalVeiculos(),
        ]);

        const totalUsuariosAtivos = distribuicaoPapeis.reduce(
            (sum, item) => sum + item._count.papel,
            0
        );

        const distribuicaoFormatada = distribuicaoPapeis.map(item => ({
            role: item.papel,
            count: item._count.papel,
        }));

        const veiculosBase = 50;
        const totalVeiculosChange =
            totalVeiculos > 0
                ? parseFloat(
                      (((totalVeiculos - veiculosBase) / veiculosBase) * 100).toFixed(1)
                  )
                : 0;

        res.status(200).json({
            usuarios: {
                ativos: totalUsuariosAtivos,
                inativos: (await prisma.usuario.count()) - totalUsuariosAtivos,
            },
            veiculos: {
                totalAtivos: totalVeiculos,
                variacao: totalVeiculosChange,
            },
            distribuicaoPapeis: distribuicaoFormatada,
        });
    } catch (error) {
        console.error("Erro ao buscar KPIs de Usuário:", error);
        res.status(500).json({ message: "Erro interno ao calcular KPIs de usuário." });
    }
};
