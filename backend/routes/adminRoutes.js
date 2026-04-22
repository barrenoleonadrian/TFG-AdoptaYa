const express = require("express")
const router = express.Router()

const adminController = require("../controllers/adminController")
const {verificarToken, verificarAdmin} = require("../middleware/auth")

// todas las rutas de admin pasan primero por verificarToken y luego por verificarAdmin
router.use(verificarToken, verificarAdmin)

// usuarios
router.get("/admin/usuarios", adminController.listarUsuarios)
router.put("/admin/usuarios/:id", adminController.cambiarRolUsuario)
router.delete("/admin/usuarios/:id", adminController.eliminarUsuario)

// mascotas
router.get("/admin/mascotas", adminController.listarMascotas)
router.delete("/admin/mascotas/:id", adminController.eliminarMascota)

// solicitudes
router.get("/admin/solicitudes", adminController.listarSolicitudes)
router.put("/admin/solicitudes/:id", adminController.cambiarEstadoSolicitud)

module.exports = router
