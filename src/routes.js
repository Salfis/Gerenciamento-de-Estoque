const { Router } = require('express');
const { ListarCategorias, BuscarCategoria, CriarCategorias, DeletarCategorias, EditarCategorias } = require('./controllers/categoria');
const {
    CadastrarUsuario,
    ListarUsuarios,
    BuscarUsuario,
    EditarUsuario,
    DesativarUsuario,
    MeuPerfil,
    EditarMeuPerfil,
    AlterarMinhaSenha,
} = require('./controllers/usuarios');
const { LoginUsuario, EsqueciSenha, RedefinirSenha } = require('./controllers/auth');
const {
    ListarProdutos,
    BuscarProduto,
    AdicionarProdutos,
    EditarProduto,
    DeletarProduto,
    ConsultarCodigoBarras,
    ImportarProduto,
} = require('./controllers/produtos');
const { RegistrarMovimentacao, ListarMovimentacoes, ListarMovimentacoesDoProduto } = require('./controllers/movimentacoes');
const { AutenticarUsuario, SomenteAdmin } = require('./middlewares/autenticar');
const { LimitarLogin, LimitarRecuperacao } = require('./middlewares/limitarRequisicoes');

const routes = Router();

routes.get('/', (req, res) => {
    return res.status(200).json('API de estoque funcionando...');
});

routes.post('/login', LimitarLogin, LoginUsuario);
routes.post('/esqueci-senha', LimitarRecuperacao, EsqueciSenha);
routes.post('/redefinir-senha', LimitarRecuperacao, RedefinirSenha);

routes.get('/usuarios/me', AutenticarUsuario, MeuPerfil);
routes.patch('/usuarios/me', AutenticarUsuario, EditarMeuPerfil);
routes.patch('/usuarios/me/senha', AutenticarUsuario, AlterarMinhaSenha);
routes.get('/usuarios', AutenticarUsuario, SomenteAdmin, ListarUsuarios);
routes.get('/usuarios/:id', AutenticarUsuario, SomenteAdmin, BuscarUsuario);
routes.post('/usuarios', AutenticarUsuario, SomenteAdmin, CadastrarUsuario);
routes.patch('/usuarios/:id', AutenticarUsuario, SomenteAdmin, EditarUsuario);
routes.delete('/usuarios/:id', AutenticarUsuario, SomenteAdmin, DesativarUsuario);

routes.get('/categorias', AutenticarUsuario, ListarCategorias);
routes.get('/categorias/:id', AutenticarUsuario, BuscarCategoria);
routes.post('/categorias', AutenticarUsuario, SomenteAdmin, CriarCategorias);
routes.put('/categorias/:id', AutenticarUsuario, SomenteAdmin, EditarCategorias);
routes.delete('/categorias/:id', AutenticarUsuario, SomenteAdmin, DeletarCategorias);

routes.get('/produtos', AutenticarUsuario, ListarProdutos);
routes.get('/produtos/codigo-barras/:codigo', AutenticarUsuario, ConsultarCodigoBarras);
routes.get('/produtos/:id', AutenticarUsuario, BuscarProduto);
routes.get('/produtos/:id/movimentacoes', AutenticarUsuario, ListarMovimentacoesDoProduto);
routes.post('/produtos', AutenticarUsuario, SomenteAdmin, AdicionarProdutos);
routes.post('/produtos/importar', AutenticarUsuario, SomenteAdmin, ImportarProduto);
routes.patch('/produtos/:id', AutenticarUsuario, SomenteAdmin, EditarProduto);
routes.delete('/produtos/:id', AutenticarUsuario, SomenteAdmin, DeletarProduto);

routes.get('/movimentacoes', AutenticarUsuario, ListarMovimentacoes);
routes.post('/movimentacoes', AutenticarUsuario, RegistrarMovimentacao);

module.exports = routes;
