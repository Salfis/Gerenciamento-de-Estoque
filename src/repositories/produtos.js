const pool = require('../database');

async function listar() {
    const [produtos] = await pool.query('SELECT * FROM produto ORDER BY id_produto');
    return produtos;
}

async function buscarPorSku(sku) {
    const [produtos] = await pool.query('SELECT * FROM produto WHERE sku = ?', [sku]);
    return produtos[0] ?? null;
}

async function contarPorCategoria(idCategoria) {
    const [linhas] = await pool.query('SELECT COUNT(*) AS total FROM produto WHERE id_categoria = ?', [idCategoria]);
    return linhas[0].total;
}

async function criar(produto) {
    const [resultado] = await pool.query(
        'INSERT INTO produto (sku, nome, marca, id_categoria, preco_venda, quantidade_estoque, quantidade_minima) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [produto.sku, produto.nome, produto.marca, produto.id_categoria, produto.preco_venda, produto.quantidade_estoque, produto.quantidade_minima]
    );
    return resultado.insertId;
}

module.exports = { listar, buscarPorSku, contarPorCategoria, criar };
