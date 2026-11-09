const { transacao } = require('../database');
const produtoRepository = require('../repositories/produtos');
const categoriaRepository = require('../repositories/categoria');
const movimentacaoRepository = require('../repositories/movimentacoes');
const openFoodFacts = require('./openFoodFacts');
const { ErroConflito, ErroNaoEncontrado, ErroValidacao } = require('./erros');
const validar = require('./validacao');

const CAMPOS_EDITAVEIS = ['sku', 'codigo_barras', 'nome', 'marca', 'id_categoria', 'preco_venda', 'quantidade_minima'];

function comSituacao(produto) {
    return {
        ...produto,
        disponivel: produto.quantidade_estoque > 0,
        estoque_baixo: produto.quantidade_minima !== null && produto.quantidade_estoque <= produto.quantidade_minima,
    };
}

function validarCampo(campo, valor) {
    switch (campo) {
        case 'sku':
        case 'nome':
        case 'marca':
            return validar.texto(valor, campo);
        case 'codigo_barras':
            return validar.codigoBarras(valor, campo, { obrigatorio: false });
        case 'id_categoria':
            return validar.inteiro(valor, campo, { min: 1 });
        case 'preco_venda':
            return validar.decimal(valor, campo, { obrigatorio: false });
        case 'quantidade_minima':
            return validar.inteiro(valor, campo, { obrigatorio: false });
    }
}

async function garantirCategoria(idCategoria) {
    if (!(await categoriaRepository.buscarPorId(idCategoria))) {
        throw new ErroNaoEncontrado('Categoria não encontrada');
    }
}

async function garantirSkuDisponivel(sku, idAtual = null) {
    const existente = await produtoRepository.buscarPorSku(sku);
    if (existente && existente.id_produto !== idAtual) {
        throw new ErroConflito('Já existe um produto com esse SKU');
    }
}

async function garantirCodigoBarrasDisponivel(codigoBarras, idAtual = null) {
    if (!codigoBarras) {
        return;
    }
    const existente = await produtoRepository.buscarPorCodigoBarras(codigoBarras);
    if (existente && existente.id_produto !== idAtual) {
        throw new ErroConflito('Já existe um produto com esse código de barras', { id_produto: existente.id_produto });
    }
}

async function buscarExistente(idProduto) {
    const id = validar.id(idProduto);
    const produto = await produtoRepository.buscarPorId(id);
    if (!produto) {
        throw new ErroNaoEncontrado('Produto não encontrado');
    }
    return produto;
}

async function listar(query = {}) {
    const filtros = {
        busca: validar.texto(query.busca, 'busca', { obrigatorio: false }),
        id_categoria: query.id_categoria === undefined ? null : validar.id(query.id_categoria, 'id_categoria'),
        disponivel: validar.booleano(query.disponivel, 'disponivel'),
        estoque_baixo: validar.booleano(query.estoque_baixo, 'estoque_baixo'),
    };
    const produtos = await produtoRepository.listar(filtros);
    return produtos.map(comSituacao);
}

async function buscar(idProduto) {
    return comSituacao(await buscarExistente(idProduto));
}

async function criar(dados = {}, idUsuario) {
    const produto = {};
    for (const campo of CAMPOS_EDITAVEIS) {
        produto[campo] = validarCampo(campo, dados[campo]);
    }
    produto.quantidade_estoque = validar.inteiro(dados.quantidade_estoque, 'quantidade_estoque', { obrigatorio: false }) ?? 0;

    await garantirCategoria(produto.id_categoria);
    await garantirSkuDisponivel(produto.sku);
    await garantirCodigoBarrasDisponivel(produto.codigo_barras);

    const idProduto = await transacao(async (conexao) => {
        const id = await produtoRepository.criar(produto, conexao);
        if (produto.quantidade_estoque > 0) {
            await movimentacaoRepository.criar({
                id_produto: id,
                id_usuario: idUsuario,
                tipo: 'ENTRADA',
                quantidade: produto.quantidade_estoque,
                observacao: 'Estoque inicial',
            }, conexao);
        }
        return id;
    });

    return buscar(idProduto);
}

async function atualizar(idProduto, dados = {}) {
    const produto = await buscarExistente(idProduto);

    if (dados.quantidade_estoque !== undefined) {
        throw new ErroValidacao('O estoque só pode ser alterado por movimentações (POST /movimentacoes)');
    }

    const campos = {};
    for (const campo of CAMPOS_EDITAVEIS) {
        if (dados[campo] !== undefined) {
            campos[campo] = validarCampo(campo, dados[campo]);
        }
    }
    if (Object.keys(campos).length === 0) {
        throw new ErroValidacao(`Informe ao menos um campo para atualizar: ${CAMPOS_EDITAVEIS.join(', ')}`);
    }

    if (campos.id_categoria !== undefined) {
        await garantirCategoria(campos.id_categoria);
    }
    if (campos.sku !== undefined) {
        await garantirSkuDisponivel(campos.sku, produto.id_produto);
    }
    if (campos.codigo_barras !== undefined) {
        await garantirCodigoBarrasDisponivel(campos.codigo_barras, produto.id_produto);
    }

    await produtoRepository.atualizar(produto.id_produto, campos);
    return buscar(produto.id_produto);
}

async function excluir(idProduto) {
    const produto = await buscarExistente(idProduto);
    await produtoRepository.excluir(produto.id_produto);
}

async function consultarCodigoBarras(codigo) {
    const codigoBarras = validar.codigoBarras(codigo);
    const externo = await openFoodFacts.buscarProdutoPorCodigo(codigoBarras);
    if (!externo) {
        throw new ErroNaoEncontrado('Produto não encontrado na Open Food Facts');
    }
    const local = await produtoRepository.buscarPorCodigoBarras(codigoBarras);
    return { ...externo, ja_cadastrado: Boolean(local), id_produto: local?.id_produto ?? null };
}

async function importar(dados = {}, idUsuario) {
    const codigoBarras = validar.codigoBarras(dados.codigo_barras);
    await garantirCodigoBarrasDisponivel(codigoBarras);

    const externo = await openFoodFacts.buscarProdutoPorCodigo(codigoBarras);
    if (!externo) {
        throw new ErroNaoEncontrado('Produto não encontrado na Open Food Facts. Cadastre manualmente em POST /produtos');
    }

    const nome = dados.nome ?? externo.nome;
    const marca = dados.marca ?? externo.marca;
    if (!nome || !marca) {
        throw new ErroValidacao('A Open Food Facts não informou nome ou marca desse produto. Envie os campos nome e marca');
    }

    return criar({ ...dados, codigo_barras: codigoBarras, sku: dados.sku ?? codigoBarras, nome, marca }, idUsuario);
}

module.exports = { listar, buscar, criar, atualizar, excluir, buscarExistente, consultarCodigoBarras, importar };
