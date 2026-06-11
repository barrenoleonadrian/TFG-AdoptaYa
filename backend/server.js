// Punto de entrada del backend de AdoptaYa.
// Configura Express, los middlewares globales y registra todas las rutas
// de la API REST. El servidor arranca en el puerto 3000.

require('dotenv').config()
const express = require("express")
const cors = require("cors")
const app = express()
app.set('trust proxy', 1)
const helmet = require('helmet')
const { limiteGeneral } = require('./middleware/rateLimit')


// importamos los routers organizados por funcionalidad
const mascotasRoutes = require("./routes/mascotasRoutes")
const usuariosRoutes = require("./routes/usuariosRoutes")
const adminRoutes = require("./routes/adminRoutes")
const refugiosRoutes = require("./routes/refugiosRoutes")
const mensajesRoutes = require("./routes/mensajesRoutes")
const misMascotasRoutes = require("./routes/misMascotasRoutes")

app.use(helmet())
app.use(limiteGeneral)
// CORS permite que el frontend (puerto 5173) pueda llamar al backend (3000)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
// para que Express lea automáticamente los body JSON de las peticiones
app.use(express.json())

// servir imágenes como ruta pública. Tiene que ir ANTES de las rutas
// privadas, si no, los middlewares de autenticación protegerían también
// el acceso a las imágenes y se romperían las cargas.
app.use("/img", express.static("img"))

// registramos los routers (cada uno gestiona su parte de la API)
app.use(usuariosRoutes)
app.use(mascotasRoutes)
app.use(adminRoutes)
app.use(refugiosRoutes)
app.use(mensajesRoutes)
app.use(misMascotasRoutes)

app.listen(3000, () => {
    console.log("Servidor funcionando en puerto 3000")
})
