const express = require("express")
const router = express.Router()
const usuariosController = require("../controllers/usuariosController")
const { limiteLogin } = require("../middleware/rateLimit")
const { validarRegistro, validarLogin } = require("../middleware/validaciones")


// REGISTRO de usuario nuevo (adoptante o refugio).
// validarRegistro comprueba el formato de los datos antes de crear la cuenta.
router.post("/register", validarRegistro, usuariosController.register)


// LOGIN.
// limiteLogin protege contra fuerza bruta (5 intentos / 15 min por IP).
// validarLogin comprueba el formato del email y que la contraseña no venga vacía.
router.post("/login", limiteLogin, validarLogin, usuariosController.login)


module.exports = router