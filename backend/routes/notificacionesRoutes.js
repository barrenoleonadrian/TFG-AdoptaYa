// Rutas de notificaciones. Todas requieren autenticación.
//
// IMPORTANTE: las rutas estáticas (/sin-leer, /leer-todas) van ANTES
// que la dinámica (/:id/leer) para que Express las distinga correctamente.

const express = require('express')
const router = express.Router()

const notificacionesController = require('../controllers/notificacionesController')
const { verificarToken } = require('../middleware/auth')


router.get('/notificaciones', verificarToken, notificacionesController.listar)
router.get('/notificaciones/sin-leer', verificarToken, notificacionesController.contarSinLeer)
router.put('/notificaciones/leer-todas', verificarToken, notificacionesController.marcarTodasLeidas)
router.put('/notificaciones/:id/leer', verificarToken, notificacionesController.marcarLeida)


module.exports = router