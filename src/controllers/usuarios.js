const usuarioService = require('../services/usuarios');

async function CadastrarUsuario(req, res) {
    const usuario = await usuarioService.cadastrar(req.body);
    return res.status(201).json(usuario);
}

module.exports = { CadastrarUsuario };
