const { Router } = require('express');
const { ListarCategorias, BuscarCategoria, CriarCategorias, DeletarCategorias, EditarCategorias } = require('./controllers/categoria');
const { CadastrarUsuario } = require('./controllers/usuarios');
const { LoginUsuario, EsqueciSenha, RedefinirSenha } = require('./controllers/auth');
const { ListarProdutos, BuscarProduto, AdicionarProdutos, EditarProduto, DeletarProduto } = require('./controllers/produtos');
const { RegistrarMovimentacao, ListarMovimentacoes, ListarMovimentacoesDoProduto } = require('./controllers/movimentacoes');
const { AutenticarUsuario, SomenteAdmin } = require('./middlewares/autenticar');

const routes = Router();

routes.get('/', (req, res) => {
    return res.status(200).json('API de estoque funcionando...');
});

routes.post('/usuario', CadastrarUsuario);
routes.post('/login', LoginUsuario);
routes.post('/esqueci-senha', EsqueciSenha);
routes.post('/redefinir-senha', RedefinirSenha);

routes.get('/categorias', AutenticarUsuario, ListarCategorias);
routes.get('/categorias/:id', AutenticarUsuario, BuscarCategoria);
routes.post('/categorias', AutenticarUsuario, SomenteAdmin, CriarCategorias);
routes.put('/categorias/:id', AutenticarUsuario, SomenteAdmin, EditarCategorias);
routes.delete('/categorias/:id', AutenticarUsuario, SomenteAdmin, DeletarCategorias);

routes.get('/produtos', AutenticarUsuario, ListarProdutos);
routes.get('/produtos/:id', AutenticarUsuario, BuscarProduto);
routes.get('/produtos/:id/movimentacoes', AutenticarUsuario, ListarMovimentacoesDoProduto);
routes.post('/produtos', AutenticarUsuario, SomenteAdmin, AdicionarProdutos);
routes.patch('/produtos/:id', AutenticarUsuario, SomenteAdmin, EditarProduto);
routes.delete('/produtos/:id', AutenticarUsuario, SomenteAdmin, DeletarProduto);

routes.get('/movimentacoes', AutenticarUsuario, ListarMovimentacoes);
routes.post('/movimentacoes', AutenticarUsuario, RegistrarMovimentacao);

module.exports = routes;
