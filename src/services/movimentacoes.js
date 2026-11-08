const { transacao } = require('../database');
const produtoRepository = require('../repositories/produtos');
const movimentacaoRepository = require('../repositories/movimentacoes');
const { buscarExistente: buscarProduto } = require('./produtos');
const { ErroConflito, ErroNaoEncontrado, ErroValidacao } = require('./erros');
const validar = require('./validacao');

const TIPOS = ['ENTRADA', 'SAIDA'];

function validarTipo(tipo, obrigatorio = true) {
    if (tipo === undefined && !obrigatorio) {
        return null;
    }
    if (!TIPOS.includes(tipo)) {
        throw new ErroValidacao('O campo tipo deve ser ENTRADA ou SAIDA');
    }
    return tipo;
}

async function registrar(dados = {}, idUsuario) {
    const id_produto = validar.inteiro(dados.id_produto, 'id_produto', { min: 1 });
    const tipo = validarTipo(dados.tipo);
    const quantidade = validar.inteiro(dados.quantidade, 'quantidade', { min: 1 });
    const observacao = validar.texto(dados.observacao, 'observacao', { obrigatorio: false, max: 255 });

    // A leitura do produto usa SELECT ... FOR UPDATE dentro da transação, bloqueando a linha
    // até o commit. Isso impede que duas saídas simultâneas leiam o mesmo saldo e deixem o estoque negativo.
    return transacao(async (conexao) => {
        const produto = await produtoRepository.buscarParaMovimentar(id_produto, conexao);
        if (!produto) {
            throw new ErroNaoEncontrado('Produto não encontrado');
        }

        // Regra de negócio: uma saída nunca pode ser maior que o saldo atual.
        // A resposta informa a quantidade máxima disponível para orientar o usuário.
        if (tipo === 'SAIDA' && quantidade > produto.quantidade_estoque) {
            throw new ErroConflito(
                `Estoque insuficiente. A quantidade máxima disponível para saída é ${produto.quantidade_estoque}`,
                { quantidade_disponivel: produto.quantidade_estoque }
            );
        }

        const novoEstoque = tipo === 'ENTRADA'
            ? produto.quantidade_estoque + quantidade
            : produto.quantidade_estoque - quantidade;

        await produtoRepository.atualizarEstoque(id_produto, novoEstoque, conexao);
        const id_movimentacao = await movimentacaoRepository.criar(
            { id_produto, id_usuario: idUsuario, tipo, quantidade, observacao },
            conexao
        );

        return { id_movimentacao, id_produto, tipo, quantidade, observacao, id_usuario: idUsuario, quantidade_estoque: novoEstoque };
    });
}

async function listar(query = {}) {
    return movimentacaoRepository.listar({
        id_produto: query.id_produto === undefined ? null : validar.id(query.id_produto, 'id_produto'),
        tipo: validarTipo(query.tipo, false),
    });
}

async function listarPorProduto(idProduto) {
    const produto = await buscarProduto(idProduto);
    return movimentacaoRepository.listar({ id_produto: produto.id_produto });
}

module.exports = { registrar, listar, listarPorProduto };
