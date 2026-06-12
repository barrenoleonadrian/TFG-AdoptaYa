// Controller de usuarios.
// Su única responsabilidad es gestionar HTTP: leer la petición, llamar
// al service correspondiente, y devolver la respuesta. La lógica de
// negocio vive en `usuariosService` y los accesos a BBDD en `usuariosRepository`.
//
// Los errores los lanza el service y los recibe el errorHandler central
// mediante `next(err)`. Por eso usamos try/catch tan limpio.

const usuariosService = require('../services/usuariosService')


exports.login = async (req, res, next) => {

    try{

        const { email, password } = req.body
        const resultado = await usuariosService.login(email, password)
        res.json(resultado)

    }catch(err){
        next(err)
    }

}


exports.register = async (req, res, next) => {

    try{

        const resultado = await usuariosService.registrar(req.body)
        res.json(resultado)

    }catch(err){
        next(err)
    }

}