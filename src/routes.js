const Router = require("express");
const pool = require('./database');
const { ListarCategorias, CriarCategorias, DeletarCategorias, EditarCategorias } = require("./controllers/categoria");
const { CadastrarUsuario } = require("./controllers/usuarios");
const { AutenticarUsuario, SomenteAdmin } = require("./middlewares/autenticar");
const {LoginUsuario, EsqueciSenha, RedefinirSenha } = require("./controllers/auth");
const { enviarEmail } = require('./services/email');

const routes = Router();



//=CHECKAGEM DO SERVIDOR
routes.get('/', (req,res) => {
    return res.status(200).json("API de estoque funcionando...");
})

/*///////////////////////
    CRUD DAS CATEGORIAS
///////////////////////*/

//LISTAR AS CATEGORIAS
routes.get('/categorias', AutenticarUsuario ,ListarCategorias);

//CRIAR CATEGORIAS
routes.post('/categorias', AutenticarUsuario, SomenteAdmin ,CriarCategorias);


//DELETAR CATEGORIA
routes.delete('/categorias/:id', AutenticarUsuario, SomenteAdmin ,DeletarCategorias);


// EDITAR CATEGORIA
routes.put('/categorias/:id', AutenticarUsuario, SomenteAdmin ,EditarCategorias);


/*///////////////////////
    CRUD DO USUARIO
///////////////////////*/

//CADASTRAR USUARIO
routes.post('/usuario', CadastrarUsuario);

//LOGIN USUARIO
routes.post('/login', LoginUsuario);

//ESQUECI A SENHA
routes.post('/esqueci-senha', EsqueciSenha);

//REDEFINIR A SENHA
routes.post('/redefinir-senha', RedefinirSenha);

module.exports = routes;