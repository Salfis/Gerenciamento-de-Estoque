const { pool } = require('../database');

async function listar() {
    const [categorias] = await pool.query('SELECT id_categoria, nome FROM categoria ORDER BY nome');
    return categorias;
}

async function buscarPorId(id) {
    const [categorias] = await pool.query('SELECT id_categoria, nome FROM categoria WHERE id_categoria = ?', [id]);
    return categorias[0] ?? null;
}

async function buscarPorNome(nome) {
    const [categorias] = await pool.query('SELECT id_categoria, nome FROM categoria WHERE nome = ?', [nome]);
    return categorias[0] ?? null;
}

async function criar(nome) {
    const [resultado] = await pool.query('INSERT INTO categoria (nome) VALUES (?)', [nome]);
    return resultado.insertId;
}

async function atualizar(id, nome) {
    await pool.query('UPDATE categoria SET nome = ? WHERE id_categoria = ?', [nome, id]);
}

async function excluir(id) {
    await pool.query('DELETE FROM categoria WHERE id_categoria = ?', [id]);
}

module.exports = { listar, buscarPorId, buscarPorNome, criar, atualizar, excluir };
