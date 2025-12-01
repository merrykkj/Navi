import pool from '../config/mysql.js'; 

export const ConversaModel = {
  listarPorUsuario: async (userId) => {
    const [rows] = await pool.query(
      "SELECT id_conversa, titulo, data_atualizacao FROM conversa_navi WHERE id_usuario = ? ORDER BY data_atualizacao DESC",
      [userId]
    );
    return rows;
  },

  obterHistorico: async (conversaId, userId) => {
    const [conversaRows] = await pool.query(
      "SELECT * FROM conversa_navi WHERE id_conversa = ? AND id_usuario = ?",
      [conversaId, userId]
    );

    if (conversaRows.length === 0) return null;

    const [mensagemRows] = await pool.query(
      "SELECT * FROM mensagem_navi WHERE id_conversa = ? ORDER BY data_criacao ASC",
      [conversaId]
    );

    const historico = mensagemRows.map((msg) => {
      const contentJson = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
      if (msg.role === 'user') {
        return { role: 'user', parts: [{ text: contentJson }] };
      } else {
        return {
          role: 'model',
          parts: [{ text: contentJson.type === 'chart' ? contentJson.insightText : contentJson.content }],
          chartData: contentJson.type === 'chart' ? contentJson.chartData : null,
          content: contentJson,
        };
      }
    });

    return { ...conversaRows[0], historico };
  },

  salvarOuAtualizar: async (conversaId, userId, titulo, historico) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const ultimaMensagem = historico[historico.length - 1];
      const penultimaMensagem = historico[historico.length - 2];
      const userContent = JSON.stringify(penultimaMensagem.parts[0].text);
      const modelContent = JSON.stringify(ultimaMensagem.content);

      if (conversaId) {
        const conversaIdNum = parseInt(conversaId);
        await connection.query(
          "INSERT INTO mensagem_navi (id_conversa, role, content) VALUES (?, 'user', ?), (?, 'model', ?)",
          [conversaIdNum, userContent, conversaIdNum, modelContent]
        );
        await connection.query(
          "UPDATE conversa_navi SET data_atualizacao = NOW() WHERE id_conversa = ? AND id_usuario = ?",
          [conversaIdNum, userId]
        );
        await connection.commit();
        return { id_conversa: conversaIdNum };
      } else {
        const novoTitulo = titulo || penultimaMensagem.parts[0].text.substring(0, 60);
        const [result] = await connection.query(
          "INSERT INTO conversa_navi (id_usuario, titulo) VALUES (?, ?)",
          [userId, novoTitulo]
        );
        const novaConversaId = result.insertId;
        await connection.query(
          "INSERT INTO mensagem_navi (id_conversa, role, content) VALUES (?, 'user', ?), (?, 'model', ?)",
          [novaConversaId, userContent, novaConversaId, modelContent]
        );
        await connection.commit();
        return { id_conversa: novaConversaId, titulo: novoTitulo };
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};