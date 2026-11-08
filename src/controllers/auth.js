const authService = require('../services/auth');

async function LoginUsuario(req, res) {
    const resultado = await authService.login(req.body);
    return res.status(200).json(resultado);
}

async function EsqueciSenha(req, res) {
    await authService.esqueciSenha(req.body);
    return res.status(200).json({ mensagem: 'Se o e-mail estiver cadastrado, você receberá as instruções.' });
}

async function RedefinirSenha(req, res) {
    await authService.redefinirSenha(req.body);
    return res.status(200).json({ mensagem: 'Senha redefinida com sucesso.' });
}

module.exports = { LoginUsuario, EsqueciSenha, RedefinirSenha };
