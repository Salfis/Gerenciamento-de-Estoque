const { validarToken } = require('../services/auth');
const { ErroNaoAutenticado, ErroProibido } = require('../services/erros');

async function AutenticarUsuario(req, res, next) {
    const [tipo, token] = (req.headers.authorization || '').split(' ');
    if (tipo !== 'Bearer' || !token) {
        throw new ErroNaoAutenticado('Token não informado');
    }
    req.usuario = await validarToken(token);
    next();
}

function SomenteAdmin(req, res, next) {
    if (req.usuario.perfil !== 'ADMIN') {
        throw new ErroProibido('Sem autorização para realizar essa ação');
    }
    next();
}

module.exports = { AutenticarUsuario, SomenteAdmin };
