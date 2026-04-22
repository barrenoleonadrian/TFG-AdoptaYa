const express = require("express")
const cors = require("cors")
const app = express()

const mascotasRoutes = require("./routes/mascotasRoutes")
const usuariosRoutes = require("./routes/usuariosRoutes")
const adminRoutes = require("./routes/adminRoutes")

app.use(cors())
app.use(express.json())

app.use(usuariosRoutes)
app.use(mascotasRoutes)
app.use(adminRoutes)

app.use("/img", express.static("img"))

app.listen(3000, () => {
    console.log("Servidor funcionando en puerto 3000")
})
