const rateLimit = require('express-rate-limit')

// Límite general: 100 peticiones cada 15 minutos por IP
const limiteGeneral = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Demasiadas peticiones, intenta de nuevo más tarde' },
    standardHeaders: true,
    legacyHeaders: false
})

// Límite estricto para login: 5 intentos cada 15 minutos por IP
const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiados intentos de login, espera 15 minutos' },
    standardHeaders: true,
    legacyHeaders: false
})

module.exports = { limiteGeneral, limiteLogin }