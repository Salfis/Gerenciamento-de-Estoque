const { pool } = require('../database');

async function buscarPorEmail(email) {
    const [usuarios] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    return usuarios[0] ?? null;
}

async function buscarPorId(id) {
    const [usuarios] = await pool.query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);
    return usuarios[0] ?? null;
}

async function listar() {
    const [usuarios] = await pool.query('SELECT * FROM usuario ORDER BY nome');
    return usuarios;
}

async function contarAdminsAtivos() {
    const [linhas] = await pool.query("SELECT COUNT(*) AS total FROM usuario WHERE perfil = 'ADMIN' AND ativo = TRUE");
    return linhas[0].total;
}

async function criar(usuario) {
    const [resultado] = await pool.query(
        'INSERT INTO usuario (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)',
        [usuario.nome, usuario.email, usuario.senha_hash, usuario.perfil]
    );
    return resultado.insertId;
}

async function atualizar(id, campos) {
    const colunas = Object.keys(campos).map((coluna) => `${coluna} = ?`);
    await pool.query(
        `UPDATE usuario SET ${colunas.join(', ')} WHERE id_usuario = ?`,
        [...Object.values(campos), id]
    );
}

async function atualizarSenha(idUsuario, senhaHash, conexao = pool) {
    await conexao.query(
        'UPDATE usuario SET senha_hash = ?, token_versao = token_versao + 1 WHERE id_usuario = ?',
        [senhaHash, idUsuario]
    );
}

module.exports = { buscarPorEmail, buscarPorId, listar, contarAdminsAtivos, criar, atualizar, atualizarSenha };
