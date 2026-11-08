const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const usuarioRepository = require('../repositories/usuarios');
const recuperacaoSenhaRepository = require('../repositories/recuperacaoSenha');
const { enviarEmail } = require('./email');
const { ErroNaoAutenticado, ErroValidacao } = require('./erros');
const validar = require('./validacao');

function gerarHash(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

async function login(dados = {}) {
    const email = validar.email(dados.email);
    const senha = validar.senha(dados.senha);

    const usuario = await usuarioRepository.buscarPorEmail(email);
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
        throw new ErroNaoAutenticado('E-mail ou senha inválidos');
    }

    const token = jwt.sign(
        { id: usuario.id_usuario, perfil: usuario.perfil },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    return { id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil, token };
}

function validarToken(token) {
    try {
        const dados = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        return { id: dados.id, perfil: dados.perfil };
    } catch {
        throw new ErroNaoAutenticado('Token inválido ou expirado');
    }
}

async function esqueciSenha(dados = {}) {
    const email = validar.email(dados.email);

    const usuario = await usuarioRepository.buscarPorEmail(email);
    if (!usuario) {
        return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    await recuperacaoSenhaRepository.criar(usuario.id_usuario, gerarHash(token));
    await enviarEmail(usuario.email, 'Recuperação de senha', `Seu código de recuperação é: ${token}. Ele expira em 30 minutos.`);
}

async function redefinirSenha(dados = {}) {
    const token = validar.texto(dados.token, 'token', { max: 64 });
    const novaSenha = validar.senha(dados.novaSenha, 'novaSenha');

    const recuperacao = await recuperacaoSenhaRepository.buscarValida(gerarHash(token));
    if (!recuperacao) {
        throw new ErroValidacao('Token inválido ou expirado');
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await usuarioRepository.atualizarSenha(recuperacao.id_usuario, senhaHash);
    await recuperacaoSenhaRepository.marcarComoUsada(recuperacao.id);
}

module.exports = { login, validarToken, esqueciSenha, redefinirSenha };
