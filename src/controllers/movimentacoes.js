const movimentacaoService = require('../services/movimentacoes');

async function RegistrarMovimentacao(req, res) {
    const movimentacao = await movimentacaoService.registrar(req.body, req.usuario.id);
    return res.status(201).json(movimentacao);
}

async function ListarMovimentacoes(req, res) {
    const movimentacoes = await movimentacaoService.listar(req.query);
    return res.status(200).json(movimentacoes);
}

async function ListarMovimentacoesDoProduto(req, res) {
    const movimentacoes = await movimentacaoService.listarPorProduto(req.params.id);
    return res.status(200).json(movimentacoes);
}

module.exports = { RegistrarMovimentacao, ListarMovimentacoes, ListarMovimentacoesDoProduto };
