// Rutas de valoraciones.
// Las rutas estáticas (.../estadisticas, .../mia) van ANTES que la genérica
// para que Express las distinga correctamente.

const express = require('express')
const router = express.Router()

const valoracionesController = require('../controllers/valoracionesController')
const { verificarToken } = require('../middleware/auth')


// estadísticas (media y total): público
router.get('/refugios/:id/valoraciones/estadisticas', valoracionesController.estadisticas)

// mi valoración (para precargar el formulario al editar): requiere login
router.get('/refugios/:id/valoraciones/mia', verificarToken, valoracionesController.miValoracion)

// listado de valoraciones de un refugio: público
router.get('/refugios/:id/valoraciones', valoracionesController.listar)

// crear o actualizar valoración: requiere login (y ser adoptante)
router.post('/refugios/:id/valoraciones', verificarToken, valoracionesController.valorar)


module.exports = router