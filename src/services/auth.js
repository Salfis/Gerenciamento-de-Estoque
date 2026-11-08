const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { transacao } = require('../database');
const usuarioRepository = require('../repositories/usuarios');
const recuperacaoSenhaRepository = require('../repositories/recuperacaoSenha');
const { enviarEmail } = require('./email');
const { ErroNaoAutenticado, ErroValidacao } = require('./erros');
const validar = require('./validacao');

/**
 * Hash utilizado quando o e-mail informado não existe, para que o login sempre execute
 * a comparação do bcrypt e o tempo de resposta não revele quais e-mails estão cadastrados.
 */
const HASH_SENHA_INEXISTENTE = bcrypt.hashSync('usuario-inexistente', 10);

function gerarHash(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

async function login(dados = {}) {
    const email = validar.email(dados.email);
    const senha = validar.senha(dados.senha);

    const usuario = await usuarioRepository.buscarPorEmail(email);
    const senhaCorreta = await bcrypt.compare(senha, usuario?.senha_hash ?? HASH_SENHA_INEXISTENTE);
    if (!usuario || !usuario.ativo || !senhaCorreta) {
        throw new ErroNaoAutenticado('E-mail ou senha inválidos');
    }

    const token = jwt.sign(
        { id: usuario.id_usuario, versao: usuario.token_versao },
        process.env.JWT_SECRET,
        { expiresIn: '8h', algorithm: 'HS256' }
    );

    return { id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil, token };
}

/**
 * Além de validar a assinatura do JWT, consulta o usuário no banco a cada requisição.
 * Assim, contas desativadas, perfis alterados e senhas trocadas passam a valer imediatamente,
 * sem depender da expiração do token.
 */
async function validarToken(token) {
    let dados;
    try {
        dados = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch {
        throw new ErroNaoAutenticado('Token inválido ou expirado');
    }

    const usuario = await usuarioRepository.buscarPorId(dados.id);
    if (!usuario || !usuario.ativo || usuario.token_versao !== dados.versao) {
        throw new ErroNaoAutenticado('Token inválido ou expirado');
    }

    return { id: usuario.id_usuario, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil };
}

async function esqueciSenha(dados = {}) {
    const email = validar.email(dados.email);

    const usuario = await usuarioRepository.buscarPorEmail(email);
    if (!usuario || !usuario.ativo) {
        return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    await recuperacaoSenhaRepository.invalidarDoUsuario(usuario.id_usuario);
    await recuperacaoSenhaRepository.criar(usuario.id_usuario, gerarHash(token));

    try {
        await enviarEmail(usuario.email, 'Recuperação de senha', `Seu código de recuperação é: ${token}. Ele expira em 30 minutos.`);
    } catch (erro) {
        console.error('Falha ao enviar o e-mail de recuperação:', erro.message);
    }
}

async function redefinirSenha(dados = {}) {
    const token = validar.texto(dados.token, 'token', { max: 64 });
    const novaSenha = validar.senha(dados.novaSenha, 'novaSenha', { min: 8 });
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await transacao(async (conexao) => {
        const recuperacao = await recuperacaoSenhaRepository.buscarValidaParaUso(gerarHash(token), conexao);
        if (!recuperacao) {
            throw new ErroValidacao('Token inválido ou expirado');
        }

        await usuarioRepository.atualizarSenha(recuperacao.id_usuario, senhaHash, conexao);
        await recuperacaoSenhaRepository.invalidarDoUsuario(recuperacao.id_usuario, conexao);
    });
}

module.exports = { login, validarToken, esqueciSenha, redefinirSenha };
