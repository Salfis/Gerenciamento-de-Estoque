const { rateLimit } = require('express-rate-limit');

const QUINZE_MINUTOS = 15 * 60 * 1000;

const LimitarLogin = rateLimit({
    windowMs: QUINZE_MINUTOS,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { erro: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

const LimitarRecuperacao = rateLimit({
    windowMs: QUINZE_MINUTOS,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { erro: 'Muitas solicitações de recuperação de senha. Tente novamente em alguns minutos.' },
});

module.exports = { LimitarLogin, LimitarRecuperacao };
