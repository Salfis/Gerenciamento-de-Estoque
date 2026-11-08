const { pool } = require('../database');

async function criar(idUsuario, tokenHash) {
    await pool.query(
        'INSERT INTO recuperacao_senha (id_usuario, token_hash, expira_em) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))',
        [idUsuario, tokenHash]
    );
}

async function invalidarDoUsuario(idUsuario, conexao = pool) {
    await conexao.query(
        'UPDATE recuperacao_senha SET usado = TRUE WHERE id_usuario = ? AND usado = FALSE',
        [idUsuario]
    );
}

async function buscarValidaParaUso(tokenHash, conexao) {
    const [recuperacoes] = await conexao.query(
        'SELECT * FROM recuperacao_senha WHERE token_hash = ? AND usado = FALSE AND expira_em > NOW() FOR UPDATE',
        [tokenHash]
    );
    return recuperacoes[0] ?? null;
}

module.exports = { criar, invalidarDoUsuario, buscarValidaParaUso };
