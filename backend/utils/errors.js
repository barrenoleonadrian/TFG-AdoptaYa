// Clases de error personalizadas.
// En lugar de devolver errores con `res.status(...)` repartidos por todos
// los controllers, los services lanzan estos errores y un middleware
// centralizado se encarga de convertirlos en respuestas HTTP.

class AppError extends Error {
    constructor(message, statusCode){
        super(message)
        this.statusCode = statusCode
        this.isOperational = true
    }
}

class BadRequestError extends AppError {
    constructor(message = 'Datos inválidos'){
        super(message, 400)
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado'){
        super(message, 401)
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Acceso denegado'){
        super(message, 403)
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado'){
        super(message, 404)
    }
}

class ConflictError extends AppError {
    constructor(message = 'Conflicto con datos existentes'){
        super(message, 409)
    }
}

module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError
}