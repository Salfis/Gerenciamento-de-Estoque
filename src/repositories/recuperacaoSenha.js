const { pool } = require('../database');

async function criar(idUsuario, tokenHash) {
    await pool.query(
        'INSERT INTO recuperacao_senha (id_usuario, token_hash, expira_em) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))',
        [idUsuario, tokenHash]
    );
}

async function buscarValida(tokenHash) {
    const [recuperacoes] = await pool.query(
        'SELECT * FROM recuperacao_senha WHERE token_hash = ? AND usado = FALSE AND expira_em > NOW()',
        [tokenHash]
    );
    return recuperacoes[0] ?? null;
}

async function marcarComoUsada(id) {
    await pool.query('UPDATE recuperacao_senha SET usado = TRUE WHERE id = ?', [id]);
}

module.exports = { criar, buscarValida, marcarComoUsada };
