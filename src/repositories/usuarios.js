const { pool } = require('../database');

async function buscarPorEmail(email) {
    const [usuarios] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    return usuarios[0] ?? null;
}

async function criar(usuario) {
    const [resultado] = await pool.query(
        'INSERT INTO usuario (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)',
        [usuario.nome, usuario.email, usuario.senha_hash, usuario.perfil]
    );
    return resultado.insertId;
}

async function atualizarSenha(idUsuario, senhaHash) {
    await pool.query('UPDATE usuario SET senha_hash = ? WHERE id_usuario = ?', [senhaHash, idUsuario]);
}

module.exports = { buscarPorEmail, criar, atualizarSenha };
