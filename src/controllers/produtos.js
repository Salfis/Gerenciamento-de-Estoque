const produtoService = require('../services/produtos');

async function ListarProdutos(req, res) {
    const produtos = await produtoService.listar();
    return res.status(200).json(produtos);
}

async function AdicionarProdutos(req, res) {
    const produto = await produtoService.criar(req.body);
    return res.status(201).json(produto);
}

module.exports = { ListarProdutos, AdicionarProdutos };
