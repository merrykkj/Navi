import pool from '../config/mysql.js'; 

export const NaviDataModel = {
  buscaGlobal: async () => {
    const [[{ total: totalEstacionamentos }]] = await pool.query("SELECT COUNT(*) as total FROM estacionamento WHERE ativo = TRUE");
    const [[{ total: totalUsuarios }]] = await pool.query("SELECT COUNT(*) as total FROM usuario WHERE ativo = TRUE");
    const [contagemPorPapel] = await pool.query("SELECT papel, COUNT(id_usuario) as count FROM usuario WHERE ativo = TRUE GROUP BY papel");
    const [[{ avg_nota: mediaAvaliacao }]] = await pool.query("SELECT AVG(nota) as avg_nota FROM avaliacao");

    return {
      meta: { tipo: "GlobalAdministrador" },
      estacionamentos: { total: totalEstacionamentos },
      usuarios: {
        total: totalUsuarios,
        contagemPorPapel: contagemPorPapel,
      },
      metricasGerais: { mediaAvaliacaoGlobal: mediaAvaliacao },
    };
  },

  buscaEstacionamento: async (id_estacionamento) => {
    const id = parseInt(id_estacionamento);
    const [vagasStatus] = await pool.query("SELECT status, tipo_vaga, COUNT(id_vaga) as count FROM vaga WHERE id_estacionamento = ? GROUP BY status, tipo_vaga", [id]);
    const [[{ total: totalMensalistas }]] = await pool.query(
      "SELECT COUNT(*) as total FROM contrato_mensalista cm JOIN plano_mensal pm ON cm.id_plano = pm.id_plano WHERE cm.status = 'ATIVO' AND pm.id_estacionamento = ?", [id]
    );
    const [[{ total: faturamentoAgregado }]] = await pool.query(
      "SELECT SUM(p.valor_liquido) as total FROM pagamento p JOIN reserva r ON p.id_reserva = r.id_reserva JOIN vaga v ON r.id_vaga = v.id_vaga WHERE p.status = 'APROVADO' AND v.id_estacionamento = ?", [id]
    );

    return {
      meta: { tipo: "ProprietarioEstacionamento", id_estacionamento: id },
      vagas: { detalhes: vagasStatus },
      mensalistas: { totalAtivos: totalMensalistas },
      faturamento: { totalAprovadoGeral: faturamentoAgregado || 0 },
    };
  },
};