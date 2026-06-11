const { body, validationResult } = require('express-validator')

// Middleware que ejecuta las validaciones y devuelve errores si los hay
const validar = (req, res, next) => {
    const errores = validationResult(req)
    if (!errores.isEmpty()) {
        return res.status(400).json({
            error: 'Datos inválidos',
            detalles: errores.array().map(e => e.msg)
        })
    }
    next()
}

// Validaciones para el registro
const validarRegistro = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('email').trim().isEmail().withMessage('Email no válido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('tipo').isIn(['adoptante', 'protectora']).withMessage('Tipo de usuario no válido'),
]

// Validaciones para el login
const validarLogin = [
    body('email').trim().isEmail().withMessage('Email no válido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    validar
]

// Validaciones para crear mascota
const validarMascota = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),
    body('tipo').trim().notEmpty().withMessage('El tipo es obligatorio'),
    body('edad').optional().isInt({ min: 0, max: 30 }).withMessage('Edad no válida'),
    body('ciudad').trim().notEmpty().withMessage('La ciudad es obligatoria'),
    validar
]

module.exports = { validarRegistro, validarLogin, validarMascota }