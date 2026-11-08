class ErroApp extends Error {
    constructor(mensagem, status, dados = {}) {
        super(mensagem);
        this.status = status;
        this.dados = dados;
    }
}

class ErroValidacao extends ErroApp {
    constructor(mensagem, dados) {
        super(mensagem, 400, dados);
    }
}

class ErroNaoAutenticado extends ErroApp {
    constructor(mensagem) {
        super(mensagem, 401);
    }
}

class ErroProibido extends ErroApp {
    constructor(mensagem) {
        super(mensagem, 403);
    }
}

class ErroNaoEncontrado extends ErroApp {
    constructor(mensagem) {
        super(mensagem, 404);
    }
}

class ErroConflito extends ErroApp {
    constructor(mensagem, dados) {
        super(mensagem, 409, dados);
    }
}

class ErroServicoExterno extends ErroApp {
    constructor(mensagem) {
        super(mensagem, 503);
    }
}

module.exports = {
    ErroApp,
    ErroValidacao,
    ErroNaoAutenticado,
    ErroProibido,
    ErroNaoEncontrado,
    ErroConflito,
    ErroServicoExterno,
};
