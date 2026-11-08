const { pool } = require('../database');

const SELECT_PRODUTO = `
    SELECT p.id_produto, p.sku, p.codigo_barras, p.nome, p.marca, p.id_categoria, c.nome AS categoria,
           p.preco_venda, p.quantidade_estoque, p.quantidade_minima, p.data_criacao
    FROM produto p
    JOIN categoria c ON c.id_categoria = p.id_categoria`;

async function listar(filtros) {
    const condicoes = [];
    const valores = [];

    if (filtros.busca) {
        const termo = `%${filtros.busca}%`;
        condicoes.push('(p.nome LIKE ? OR p.marca LIKE ? OR p.sku LIKE ? OR p.codigo_barras LIKE ?)');
        valores.push(termo, termo, termo, termo);
    }
    if (filtros.id_categoria) {
        condicoes.push('p.id_categoria = ?');
        valores.push(filtros.id_categoria);
    }
    if (filtros.disponivel === true) {
        condicoes.push('p.quantidade_estoque > 0');
    }
    if (filtros.disponivel === false) {
        condicoes.push('p.quantidade_estoque = 0');
    }
    if (filtros.estoque_baixo === true) {
        condicoes.push('p.quantidade_minima IS NOT NULL AND p.quantidade_estoque <= p.quantidade_minima');
    }

    const where = condicoes.length > 0 ? ` WHERE ${condicoes.join(' AND ')}` : '';
    const [produtos] = await pool.query(`${SELECT_PRODUTO}${where} ORDER BY p.nome`, valores);
    return produtos;
}

async function buscarPorId(id) {
    const [produtos] = await pool.query(`${SELECT_PRODUTO} WHERE p.id_produto = ?`, [id]);
    return produtos[0] ?? null;
}

async function buscarParaMovimentar(id, conexao) {
    const [produtos] = await conexao.query(
        'SELECT id_produto, quantidade_estoque FROM produto WHERE id_produto = ? FOR UPDATE',
        [id]
    );
    return produtos[0] ?? null;
}

async function buscarPorSku(sku) {
    const [produtos] = await pool.query('SELECT id_produto, sku FROM produto WHERE sku = ?', [sku]);
    return produtos[0] ?? null;
}

async function buscarPorCodigoBarras(codigoBarras) {
    const [produtos] = await pool.query('SELECT id_produto, codigo_barras FROM produto WHERE codigo_barras = ?', [codigoBarras]);
    return produtos[0] ?? null;
}

async function contarPorCategoria(idCategoria) {
    const [linhas] = await pool.query('SELECT COUNT(*) AS total FROM produto WHERE id_categoria = ?', [idCategoria]);
    return linhas[0].total;
}

async function criar(produto, conexao = pool) {
    const [resultado] = await conexao.query(
        'INSERT INTO produto (sku, codigo_barras, nome, marca, id_categoria, preco_venda, quantidade_estoque, quantidade_minima) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [produto.sku, produto.codigo_barras, produto.nome, produto.marca, produto.id_categoria, produto.preco_venda, produto.quantidade_estoque, produto.quantidade_minima]
    );
    return resultado.insertId;
}

async function atualizar(id, campos) {
    const colunas = Object.keys(campos).map((coluna) => `${coluna} = ?`);
    await pool.query(
        `UPDATE produto SET ${colunas.join(', ')} WHERE id_produto = ?`,
        [...Object.values(campos), id]
    );
}

async function atualizarEstoque(id, quantidade, conexao) {
    await conexao.query('UPDATE produto SET quantidade_estoque = ? WHERE id_produto = ?', [quantidade, id]);
}

async function excluir(id) {
    await pool.query('DELETE FROM produto WHERE id_produto = ?', [id]);
}

module.exports = {
    listar,
    buscarPorId,
    buscarParaMovimentar,
    buscarPorSku,
    buscarPorCodigoBarras,
    contarPorCategoria,
    criar,
    atualizar,
    atualizarEstoque,
    excluir,
};
