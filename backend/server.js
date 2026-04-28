const express = require("express")
const cors = require("cors")
const app = express()

const mascotasRoutes = require("./routes/mascotasRoutes")
const usuariosRoutes = require("./routes/usuariosRoutes")
const adminRoutes = require("./routes/adminRoutes")
const refugiosRoutes = require("./routes/refugiosRoutes")
const mensajesRoutes = require("./routes/mensajesRoutes")

app.use(cors())
app.use(express.json())

// servir imágenes (debe ir ANTES de las rutas para que no intenten autenticar)
app.use("/img", express.static("img"))

app.use(usuariosRoutes)
app.use(mascotasRoutes)
app.use(adminRoutes)
app.use(refugiosRoutes)
app.use(mensajesRoutes)

app.listen(3000, () => {
    console.log("Servidor funcionando en puerto 3000")
})
