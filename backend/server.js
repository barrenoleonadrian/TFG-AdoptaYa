// Punto de entrada del backend de AdoptaYa.
// Configura Express, los middlewares globales y registra todas las rutas
// de la API REST. El servidor arranca en el puerto 3000.

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const config = require('./config')
const errorHandler = require('./middleware/errorHandler')
const { limiteGeneral } = require('./middleware/rateLimit')

const app = express()


// confiar en el proxy inverso de Nginx (necesario para que el rate limiter
// identifique correctamente la IP real del cliente)
app.set('trust proxy', 1)


// ====== MIDDLEWARES GLOBALES ======

app.use(helmet())
app.use(limiteGeneral)
app.use(cors(config.cors))
app.use(express.json())

// servir imágenes como ruta pública. Tiene que ir ANTES de las rutas
// privadas para que los middlewares de auth no protejan también /img.
app.use('/img', express.static('img'))


// ====== ROUTERS ======

app.use(require('./routes/usuariosRoutes'))
app.use(require('./routes/mascotasRoutes'))
app.use(require('./routes/adminRoutes'))
app.use(require('./routes/refugiosRoutes'))
app.use(require('./routes/mensajesRoutes'))
app.use(require('./routes/misMascotasRoutes'))
app.use(require('./routes/favoritosRoutes'))


// ====== MANEJO DE ERRORES ======
// IMPORTANTE: este middleware debe ir SIEMPRE el último, después de todas
// las rutas. Captura cualquier error que se pase con next(err) desde un
// controller y lo convierte en una respuesta HTTP coherente.
app.use(errorHandler)


// ====== ARRANQUE ======

app.listen(config.port, () => {
    console.log(`Servidor funcionando en puerto ${config.port}`)
})