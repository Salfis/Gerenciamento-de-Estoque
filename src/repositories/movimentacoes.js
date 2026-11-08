const { pool } = require('../database');

async function criar(movimentacao, conexao = pool) {
    const [resultado] = await conexao.query(
        'INSERT INTO movimentacao_estoque (id_produto, id_usuario, tipo, quantidade, observacao) VALUES (?, ?, ?, ?, ?)',
        [movimentacao.id_produto, movimentacao.id_usuario, movimentacao.tipo, movimentacao.quantidade, movimentacao.observacao]
    );
    return resultado.insertId;
}

async function listar(filtros) {
    const condicoes = [];
    const valores = [];

    if (filtros.id_produto) {
        condicoes.push('m.id_produto = ?');
        valores.push(filtros.id_produto);
    }
    if (filtros.tipo) {
        condicoes.push('m.tipo = ?');
        valores.push(filtros.tipo);
    }

    const where = condicoes.length > 0 ? ` WHERE ${condicoes.join(' AND ')}` : '';
    const [movimentacoes] = await pool.query(
        `SELECT m.id_movimentacao, m.id_produto, p.nome AS produto, p.sku, m.tipo, m.quantidade,
                m.observacao, m.id_usuario, u.nome AS usuario, m.data_movimentacao
         FROM movimentacao_estoque m
         JOIN produto p ON p.id_produto = m.id_produto
         JOIN usuario u ON u.id_usuario = m.id_usuario
         ${where}
         ORDER BY m.data_movimentacao DESC, m.id_movimentacao DESC`,
        valores
    );
    return movimentacoes;
}

module.exports = { criar, listar };
