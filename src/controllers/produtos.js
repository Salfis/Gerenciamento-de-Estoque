const produtoService = require('../services/produtos');

async function ListarProdutos(req, res) {
    const produtos = await produtoService.listar(req.query);
    return res.status(200).json(produtos);
}

async function BuscarProduto(req, res) {
    const produto = await produtoService.buscar(req.params.id);
    return res.status(200).json(produto);
}

async function AdicionarProdutos(req, res) {
    const produto = await produtoService.criar(req.body, req.usuario.id);
    return res.status(201).json(produto);
}

async function EditarProduto(req, res) {
    const produto = await produtoService.atualizar(req.params.id, req.body);
    return res.status(200).json(produto);
}

async function DeletarProduto(req, res) {
    await produtoService.excluir(req.params.id);
    return res.status(204).send();
}

module.exports = { ListarProdutos, BuscarProduto, AdicionarProdutos, EditarProduto, DeletarProduto };
