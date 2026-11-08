const { ErroApp } = require('../services/erros');

function RotaNaoEncontrada(req, res) {
    return res.status(404).json({ erro: 'Rota não encontrada' });
}

function TratarErros(erro, req, res, next) {
    if (res.headersSent) {
        return next(erro);
    }
    if (erro instanceof ErroApp) {
        return res.status(erro.status).json({ erro: erro.message, ...erro.dados });
    }
    if (erro.type === 'entity.parse.failed') {
        return res.status(400).json({ erro: 'O corpo da requisição não é um JSON válido' });
    }
    if (erro.type === 'entity.too.large') {
        return res.status(413).json({ erro: 'O corpo da requisição é grande demais' });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
}

module.exports = { RotaNaoEncontrada, TratarErros };
