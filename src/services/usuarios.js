const bcrypt = require('bcryptjs');
const usuarioRepository = require('../repositories/usuarios');
const { ErroConflito, ErroValidacao } = require('./erros');
const validar = require('./validacao');

const PERFIS = ['ADMIN', 'OPERADOR'];

async function cadastrar(dados = {}) {
    const nome = validar.texto(dados.nome, 'nome');
    const email = validar.email(dados.email);
    const senha = validar.senha(dados.senha);
    const perfil = dados.perfil ?? 'OPERADOR';

    if (!PERFIS.includes(perfil)) {
        throw new ErroValidacao('O campo perfil deve ser ADMIN ou OPERADOR');
    }
    if (await usuarioRepository.buscarPorEmail(email)) {
        throw new ErroConflito('Já existe um usuário com esse e-mail');
    }

    const senha_hash = await bcrypt.hash(senha, 10);
    const id_usuario = await usuarioRepository.criar({ nome, email, senha_hash, perfil });
    return { id_usuario, nome, email, perfil };
}

module.exports = { cadastrar };
