const Router = require("express");
const pool = require('./database');
const { ListarCategorias, CriarCategorias, DeletarCategorias, EditarCategorias } = require("./controllers/categoria");

const routes = Router();


//=CHECKAGEM DO SERVIDOR
routes.get('/', (req,res) => {
    return res.status(200).json("API de estoque funcionando...");
})

//LISTAR AS CATEGORIAS
routes.get('/categorias', ListarCategorias);

//CRIAR CATEGORIAS
routes.post('/categorias',CriarCategorias);


//DELETAR CATEGORIA
routes.delete('/categorias/:id', DeletarCategorias);


// EDITAR CATEGORIA
routes.put('/categorias/:id', EditarCategorias);

module.exports = routes;