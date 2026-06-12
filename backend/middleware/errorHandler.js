// Middleware central de manejo de errores.
// Express lo ejecuta automáticamente cuando un controller llama a next(err)
// o cuando se lanza un error en una función async envuelta con handleAsync.
//
// Convierte los errores en respuestas HTTP coherentes y los registra en
// la consola si son inesperados, así no llenamos los controllers de
// `try/catch` repetidos.

const { AppError } = require('../utils/errors')


function errorHandler(err, req, res, next){

    // si el error es uno de los nuestros (AppError), respondemos con su código
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            mensaje: err.message
        })
    }

    // si no es uno nuestro, es un error inesperado: lo registramos para depurar
    // y devolvemos un 500 genérico (no exponemos detalles internos al cliente)
    console.log('ERROR INESPERADO:', err)

    return res.status(500).json({
        mensaje: 'Error interno del servidor'
    })

}


module.exports = errorHandler