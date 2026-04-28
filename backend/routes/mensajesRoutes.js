const express = require("express")
const router = express.Router()
const mensajesController = require("../controllers/mensajesController")
const {verificarToken} = require("../middleware/auth")

// todas las rutas requieren estar logueado
router.get("/mensajes/conversaciones", verificarToken, mensajesController.listarConversaciones)
router.get("/mensajes/sin-leer", verificarToken, mensajesController.contarSinLeer)
router.get("/mensajes/:usuarioId", verificarToken, mensajesController.obtenerMensajes)
router.post("/mensajes", verificarToken, mensajesController.enviarMensaje)

module.exports = router
