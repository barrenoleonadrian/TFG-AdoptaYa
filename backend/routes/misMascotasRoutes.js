const express = require("express")
const router = express.Router()
const ctrl = require("../controllers/misMascotasController")
const {verificarToken, verificarRefugioActivo} = require("../middleware/auth")

// todas requieren estar logueado, ser refugio y estar verificado por el admin
router.get("/mis-mascotas", verificarToken, verificarRefugioActivo, ctrl.misMascotas)
router.put("/mis-mascotas/:id/estado", verificarToken, verificarRefugioActivo, ctrl.cambiarEstadoMascota)

router.get("/mis-solicitudes", verificarToken, verificarRefugioActivo, ctrl.misSolicitudes)
router.put("/mis-solicitudes/:id", verificarToken, verificarRefugioActivo, ctrl.cambiarEstadoSolicitud)

// marcar mascota como adoptada (paso final, solo si está reservada)
router.put("/mis-mascotas/:id/adoptada", verificarToken, verificarRefugioActivo, ctrl.marcarAdoptada)

module.exports = router
