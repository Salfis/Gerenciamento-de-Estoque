const categoriaRepository = require('../repositories/categoria');
const produtoRepository = require('../repositories/produtos');
const { ErroConflito, ErroNaoEncontrado } = require('./erros');
const validar = require('./validacao');

async function listar() {
    return categoriaRepository.listar();
}

async function buscarExistente(idCategoria) {
    const id = validar.id(idCategoria);
    const categoria = await categoriaRepository.buscarPorId(id);
    if (!categoria) {
        throw new ErroNaoEncontrado('Categoria não encontrada');
    }
    return categoria;
}

async function garantirNomeDisponivel(nome, idAtual = null) {
    const existente = await categoriaRepository.buscarPorNome(nome);
    if (existente && existente.id_categoria !== idAtual) {
        throw new ErroConflito('Já existe uma categoria com esse nome');
    }
}

async function criar(dados = {}) {
    const nome = validar.texto(dados.nome, 'nome');
    await garantirNomeDisponivel(nome);
    const id_categoria = await categoriaRepository.criar(nome);
    return { id_categoria, nome };
}

async function atualizar(idCategoria, dados = {}) {
    const categoria = await buscarExistente(idCategoria);
    const nome = validar.texto(dados.nome, 'nome');
    await garantirNomeDisponivel(nome, categoria.id_categoria);
    await categoriaRepository.atualizar(categoria.id_categoria, nome);
    return { id_categoria: categoria.id_categoria, nome };
}

async function excluir(idCategoria) {
    const categoria = await buscarExistente(idCategoria);
    if (await produtoRepository.contarPorCategoria(categoria.id_categoria) > 0) {
        throw new ErroConflito('Não é possível excluir: existem produtos nessa categoria');
    }
    await categoriaRepository.excluir(categoria.id_categoria);
}

module.exports = { listar, criar, atualizar, excluir };
