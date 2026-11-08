const { ErroValidacao } = require('./erros');

function estaVazio(valor) {
    return valor === undefined || valor === null || valor === '';
}

function texto(valor, campo, { obrigatorio = true, max = 100 } = {}) {
    if (estaVazio(valor)) {
        if (obrigatorio) {
            throw new ErroValidacao(`O campo ${campo} é obrigatório`);
        }
        return null;
    }
    if (typeof valor !== 'string') {
        throw new ErroValidacao(`O campo ${campo} deve ser um texto`);
    }
    const limpo = valor.trim();
    if (!limpo) {
        if (obrigatorio) {
            throw new ErroValidacao(`O campo ${campo} é obrigatório`);
        }
        return null;
    }
    if (limpo.length > max) {
        throw new ErroValidacao(`O campo ${campo} deve ter no máximo ${max} caracteres`);
    }
    return limpo;
}

function email(valor, campo = 'email') {
    const limpo = texto(valor, campo, { max: 150 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo)) {
        throw new ErroValidacao(`O campo ${campo} deve ser um e-mail válido`);
    }
    return limpo.toLowerCase();
}

function senha(valor, campo = 'senha') {
    if (estaVazio(valor)) {
        throw new ErroValidacao(`O campo ${campo} é obrigatório`);
    }
    if (typeof valor !== 'string') {
        throw new ErroValidacao(`O campo ${campo} deve ser um texto`);
    }
    if (valor.length > 72) {
        throw new ErroValidacao(`O campo ${campo} deve ter no máximo 72 caracteres`);
    }
    return valor;
}

function inteiro(valor, campo, { obrigatorio = true, min = 0 } = {}) {
    if (valor === undefined || valor === null) {
        if (obrigatorio) {
            throw new ErroValidacao(`O campo ${campo} é obrigatório`);
        }
        return null;
    }
    if (!Number.isInteger(valor) || valor < min) {
        throw new ErroValidacao(`O campo ${campo} deve ser um número inteiro maior ou igual a ${min}`);
    }
    return valor;
}

function decimal(valor, campo, { obrigatorio = true, min = 0 } = {}) {
    if (valor === undefined || valor === null) {
        if (obrigatorio) {
            throw new ErroValidacao(`O campo ${campo} é obrigatório`);
        }
        return null;
    }
    if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < min) {
        throw new ErroValidacao(`O campo ${campo} deve ser um número maior ou igual a ${min}`);
    }
    return valor;
}

function id(valor, campo = 'id') {
    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero < 1) {
        throw new ErroValidacao(`O ${campo} informado é inválido`);
    }
    return numero;
}

module.exports = { texto, email, senha, inteiro, decimal, id };
