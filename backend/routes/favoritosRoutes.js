// Rutas de favoritos. Todas requieren autenticación.
//
// IMPORTANTE: las rutas estáticas (/favoritos, /favoritos/ids) deben ir
// ANTES que las dinámicas (/favoritos/:id) para que Express las distinga
// correctamente.

const express = require('express')
const router = express.Router()

const favoritosController = require('../controllers/favoritosController')
const { verificarToken } = require('../middleware/auth')


// listar mis favoritos (con datos completos de cada mascota)
router.get('/favoritos', verificarToken, favoritosController.listar)

// devuelve solo los IDs (para que el catálogo sepa qué corazones pintar)
router.get('/favoritos/ids', verificarToken, favoritosController.ids)

// añadir mascota a favoritos
router.post('/favoritos/:id', verificarToken, favoritosController.anadir)

// quitar mascota de favoritos
router.delete('/favoritos/:id', verificarToken, favoritosController.quitar)


module.exports = router