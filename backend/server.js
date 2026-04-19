const express = require("express")
const app = express()

const mascotasRoutes = require("./routes/mascotasRoutes")
const usuariosRoutes = require("./routes/usuariosRoutes")

app.use(express.json())

app.use(mascotasRoutes)
app.use(usuariosRoutes)

// servir imágenes
app.use("/img",express.static("img"))

app.listen(3000,()=>{
    console.log("Servidor funcionando en puerto 3000")
})