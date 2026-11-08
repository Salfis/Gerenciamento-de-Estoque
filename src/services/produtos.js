const produtoRepository = require('../repositories/produtos');
const categoriaRepository = require('../repositories/categoria');
const { ErroConflito, ErroNaoEncontrado } = require('./erros');
const validar = require('./validacao');

async function listar() {
    return produtoRepository.listar();
}

async function criar(dados = {}) {
    const produto = {
        sku: validar.texto(dados.sku, 'sku'),
        nome: validar.texto(dados.nome, 'nome'),
        marca: validar.texto(dados.marca, 'marca'),
        id_categoria: validar.inteiro(dados.id_categoria, 'id_categoria', { min: 1 }),
        preco_venda: validar.decimal(dados.preco_venda, 'preco_venda', { obrigatorio: false }),
        quantidade_estoque: validar.inteiro(dados.quantidade_estoque, 'quantidade_estoque', { obrigatorio: false }) ?? 0,
        quantidade_minima: validar.inteiro(dados.quantidade_minima, 'quantidade_minima', { obrigatorio: false }),
    };

    if (!(await categoriaRepository.buscarPorId(produto.id_categoria))) {
        throw new ErroNaoEncontrado('Categoria não encontrada');
    }
    if (await produtoRepository.buscarPorSku(produto.sku)) {
        throw new ErroConflito('Já existe um produto com esse SKU');
    }

    const id_produto = await produtoRepository.criar(produto);
    return { id_produto, ...produto };
}

module.exports = { listar, criar };
