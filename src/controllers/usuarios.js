const usuarioService = require('../services/usuarios');

async function CadastrarUsuario(req, res) {
    const usuario = await usuarioService.cadastrar(req.body);
    return res.status(201).json(usuario);
}

async function ListarUsuarios(req, res) {
    const usuarios = await usuarioService.listar();
    return res.status(200).json(usuarios);
}

async function BuscarUsuario(req, res) {
    const usuario = await usuarioService.buscar(req.params.id);
    return res.status(200).json(usuario);
}

async function EditarUsuario(req, res) {
    const usuario = await usuarioService.atualizar(req.params.id, req.body);
    return res.status(200).json(usuario);
}

async function DesativarUsuario(req, res) {
    await usuarioService.desativar(req.params.id);
    return res.status(204).send();
}

async function MeuPerfil(req, res) {
    const usuario = await usuarioService.buscar(req.usuario.id);
    return res.status(200).json(usuario);
}

async function EditarMeuPerfil(req, res) {
    const usuario = await usuarioService.atualizarPerfilProprio(req.usuario.id, req.body);
    return res.status(200).json(usuario);
}

async function AlterarMinhaSenha(req, res) {
    await usuarioService.alterarSenha(req.usuario.id, req.body);
    return res.status(200).json({ mensagem: 'Senha alterada com sucesso. Faça login novamente.' });
}

module.exports = {
    CadastrarUsuario,
    ListarUsuarios,
    BuscarUsuario,
    EditarUsuario,
    DesativarUsuario,
    MeuPerfil,
    EditarMeuPerfil,
    AlterarMinhaSenha,
};
