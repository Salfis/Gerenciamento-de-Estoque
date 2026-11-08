const { Router } = require('express');
const { ListarCategorias, CriarCategorias, DeletarCategorias, EditarCategorias } = require('./controllers/categoria');
const { CadastrarUsuario } = require('./controllers/usuarios');
const { LoginUsuario, EsqueciSenha, RedefinirSenha } = require('./controllers/auth');
const { ListarProdutos, AdicionarProdutos } = require('./controllers/produtos');
const { AutenticarUsuario, SomenteAdmin } = require('./middlewares/autenticar');

const routes = Router();

routes.get('/', (req, res) => {
    return res.status(200).json('API de estoque funcionando...');
});

routes.get('/categorias', AutenticarUsuario, ListarCategorias);
routes.post('/categorias', AutenticarUsuario, SomenteAdmin, CriarCategorias);
routes.delete('/categorias/:id', AutenticarUsuario, SomenteAdmin, DeletarCategorias);
routes.put('/categorias/:id', AutenticarUsuario, SomenteAdmin, EditarCategorias);

routes.post('/usuario', CadastrarUsuario);
routes.post('/login', LoginUsuario);
routes.post('/esqueci-senha', EsqueciSenha);
routes.post('/redefinir-senha', RedefinirSenha);

routes.get('/produtos', ListarProdutos);
routes.post('/produtos', AdicionarProdutos);

module.exports = routes;
