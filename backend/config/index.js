// Configuración centralizada del backend.
// Todas las variables del entorno se leen aquí en un único lugar y
// el resto del código las importa desde aquí. Si cambian, solo se toca
// este archivo.

require('dotenv').config()

const config = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: '7d',
    bcryptRounds: 10,

    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'adrian',
        password: process.env.DB_PASSWORD || 'mysql',
        database: process.env.DB_NAME || 'adoptaya'
    },

    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },

    rateLimit: {
        general: {
            windowMs: 15 * 60 * 1000,
            max: 100
        },
        login: {
            windowMs: 15 * 60 * 1000,
            max: 5
        }
    }
}

module.exports = config