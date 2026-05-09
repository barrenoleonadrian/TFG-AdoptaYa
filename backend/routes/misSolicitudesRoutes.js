const express = require("express")
const router = express.Router()
const ctrl = require("../controllers/misSolicitudesController")
const {verificarToken} = require("../middleware/auth")

// requiere estar logueado y ser adoptante (esto último lo comprueba el controlador)
router.get("/mis-solicitudes-adoptante", verificarToken, ctrl.misSolicitudesAdoptante)

module.exports = router
