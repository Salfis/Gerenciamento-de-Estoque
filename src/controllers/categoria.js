const categoriaService = require('../services/categoria');

//retorna a lista de categorias
async function ListarCategorias(req, res) {
    const categorias = await categoriaService.listar();
    return res.status(200).json(categorias);
}

//Busca a categoria com o ID, se ela não existir, 404
async function BuscarCategoria(req, res) {
    const categoria = await categoriaService.buscar(req.params.id);
    return res.status(200).json(categoria);
}

async function CriarCategorias(req, res) {
    const categoria = await categoriaService.criar(req.body);
    return res.status(201).json(categoria);
}

async function DeletarCategorias(req, res) {
    await categoriaService.excluir(req.params.id);
    return res.status(204).send();
}

async function EditarCategorias(req, res) {
    const categoria = await categoriaService.atualizar(req.params.id, req.body);
    return res.status(200).json(categoria);
}

module.exports = { ListarCategorias, BuscarCategoria, CriarCategorias, DeletarCategorias, EditarCategorias };
