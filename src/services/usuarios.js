const bcrypt = require('bcryptjs');
const usuarioRepository = require('../repositories/usuarios');
const { ErroConflito, ErroNaoAutenticado, ErroNaoEncontrado, ErroProibido, ErroValidacao } = require('./erros');
const validar = require('./validacao');

const PERFIS = ['ADMIN', 'OPERADOR'];
const TAMANHO_MINIMO_SENHA = 8;

function semDadosSensiveis(usuario) {
    return {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        ativo: Boolean(usuario.ativo),
        data_criacao: usuario.data_criacao,
    };
}

function validarPerfil(perfil) {
    if (!PERFIS.includes(perfil)) {
        throw new ErroValidacao('O campo perfil deve ser ADMIN ou OPERADOR');
    }
    return perfil;
}

async function buscarExistente(idUsuario) {
    const id = validar.id(idUsuario);
    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario) {
        throw new ErroNaoEncontrado('Usuário não encontrado');
    }
    return usuario;
}

async function garantirEmailDisponivel(email, idAtual = null) {
    const existente = await usuarioRepository.buscarPorEmail(email);
    if (existente && existente.id_usuario !== idAtual) {
        throw new ErroConflito('Já existe um usuário com esse e-mail');
    }
}

async function garantirOutroAdminAtivo(usuario) {
    if (usuario.perfil === 'ADMIN' && usuario.ativo && await usuarioRepository.contarAdminsAtivos() <= 1) {
        throw new ErroConflito('O sistema precisa de pelo menos um administrador ativo');
    }
}

async function cadastrar(dados = {}) {
    const nome = validar.texto(dados.nome, 'nome');
    const email = validar.email(dados.email);
    const senha = validar.senha(dados.senha, 'senha', { min: TAMANHO_MINIMO_SENHA });
    const perfil = validarPerfil(dados.perfil ?? 'OPERADOR');

    await garantirEmailDisponivel(email);

    const senha_hash = await bcrypt.hash(senha, 10);
    const id_usuario = await usuarioRepository.criar({ nome, email, senha_hash, perfil });
    return semDadosSensiveis(await usuarioRepository.buscarPorId(id_usuario));
}

async function listar() {
    const usuarios = await usuarioRepository.listar();
    return usuarios.map(semDadosSensiveis);
}

async function buscar(idUsuario) {
    return semDadosSensiveis(await buscarExistente(idUsuario));
}

async function atualizar(idUsuario, dados = {}) {
    const usuario = await buscarExistente(idUsuario);
    const campos = {};

    if (dados.nome !== undefined) {
        campos.nome = validar.texto(dados.nome, 'nome');
    }
    if (dados.email !== undefined) {
        campos.email = validar.email(dados.email);
        await garantirEmailDisponivel(campos.email, usuario.id_usuario);
    }
    if (dados.perfil !== undefined) {
        campos.perfil = validarPerfil(dados.perfil);
        if (campos.perfil !== 'ADMIN') {
            await garantirOutroAdminAtivo(usuario);
        }
    }
    if (dados.ativo !== undefined) {
        if (typeof dados.ativo !== 'boolean') {
            throw new ErroValidacao('O campo ativo deve ser true ou false');
        }
        campos.ativo = dados.ativo;
        if (!dados.ativo) {
            await garantirOutroAdminAtivo(usuario);
        }
    }
    if (Object.keys(campos).length === 0) {
        throw new ErroValidacao('Informe ao menos um campo para atualizar: nome, email, perfil, ativo');
    }

    await usuarioRepository.atualizar(usuario.id_usuario, campos);
    return buscar(usuario.id_usuario);
}

/**
 * A exclusão de usuários é lógica: a conta é desativada e perde o acesso imediatamente,
 * mas o registro é mantido para preservar a autoria das movimentações de estoque, se não pode haver confusão.
 */
async function desativar(idUsuario) {
    const usuario = await buscarExistente(idUsuario);
    await garantirOutroAdminAtivo(usuario);
    await usuarioRepository.atualizar(usuario.id_usuario, { ativo: false });
}

async function atualizarPerfilProprio(idUsuario, dados = {}) {
    if (dados.perfil !== undefined || dados.ativo !== undefined) {
        throw new ErroProibido('Somente um administrador pode alterar perfil ou status de uma conta');
    }
    const campos = {};
    if (dados.nome !== undefined) {
        campos.nome = validar.texto(dados.nome, 'nome');
    }
    if (dados.email !== undefined) {
        campos.email = validar.email(dados.email);
        await garantirEmailDisponivel(campos.email, idUsuario);
    }
    if (Object.keys(campos).length === 0) {
        throw new ErroValidacao('Informe ao menos um campo para atualizar: nome, email');
    }

    await usuarioRepository.atualizar(idUsuario, campos);
    return buscar(idUsuario);
}

async function alterarSenha(idUsuario, dados = {}) {
    const senhaAtual = validar.senha(dados.senhaAtual, 'senhaAtual');
    const novaSenha = validar.senha(dados.novaSenha, 'novaSenha', { min: TAMANHO_MINIMO_SENHA });

    const usuario = await buscarExistente(idUsuario);
    if (!(await bcrypt.compare(senhaAtual, usuario.senha_hash))) {
        throw new ErroNaoAutenticado('A senha atual está incorreta');
    }

    await usuarioRepository.atualizarSenha(usuario.id_usuario, await bcrypt.hash(novaSenha, 10));
}

async function criarAdminInicial() {
    const { ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_SENHA) {
        return;
    }
    if (await usuarioRepository.contarAdminsAtivos() > 0) {
        return;
    }

    const email = validar.email(ADMIN_EMAIL, 'ADMIN_EMAIL');
    if (await usuarioRepository.buscarPorEmail(email)) {
        return;
    }

    await usuarioRepository.criar({
        nome: ADMIN_NOME || 'Administrador',
        email,
        senha_hash: await bcrypt.hash(ADMIN_SENHA, 10),
        perfil: 'ADMIN',
    });
    console.log(`Administrador inicial criado: ${email}`);
}

module.exports = {
    cadastrar,
    listar,
    buscar,
    atualizar,
    desativar,
    atualizarPerfilProprio,
    alterarSenha,
    criarAdminInicial,
};
