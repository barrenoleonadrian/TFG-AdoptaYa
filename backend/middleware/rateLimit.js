const rateLimit = require('express-rate-limit')

// Límite general: 100 peticiones cada 15 minutos por IP.
// Es un colchón amplio para evitar abusos masivos sin molestar
// al uso normal de la aplicación.
const limiteGeneral = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Demasiadas peticiones, intenta de nuevo más tarde' },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false }
})


// Límite específico para login: solo cuenta intentos FALLIDOS.
// Permite hasta 10 fallos en 15 minutos por IP, lo que protege contra
// ataques de fuerza bruta pero no molesta a un usuario que se equivoque
// al escribir la contraseña dos veces y luego acierte.
//
// El login correcto NO cuenta para el límite (skipSuccessfulRequests: true).
const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Demasiados intentos fallidos. Espera 15 minutos antes de volver a intentarlo.' },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    skipSuccessfulRequests: true
})


module.exports = { limiteGeneral, limiteLogin }