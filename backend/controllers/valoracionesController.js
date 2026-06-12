// Controller de valoraciones. Solo gestiona HTTP: recibe la petición,
// llama al service, devuelve la respuesta.

const valoracionesService = require('../services/valoracionesService')


// POST /refugios/:id/valoraciones  →  crea o actualiza
exports.valorar = async (req, res, next) => {

    try{
        const resultado = await valoracionesService.valorar(
            req.usuario,
            req.params.id,
            req.body
        )
        res.json(resultado)
    }catch(err){
        next(err)
    }

}


// GET /refugios/:id/valoraciones  →  todas las valoraciones del refugio
exports.listar = async (req, res, next) => {

    try{
        const resultado = await valoracionesService.listarPorRefugio(req.params.id)
        res.json(resultado)
    }catch(err){
        next(err)
    }

}


// GET /refugios/:id/valoraciones/estadisticas  →  media + total
exports.estadisticas = async (req, res, next) => {

    try{
        const resultado = await valoracionesService.estadisticas(req.params.id)
        res.json(resultado)
    }catch(err){
        next(err)
    }

}


// GET /refugios/:id/valoraciones/mia  →  valoración del usuario logueado (para editar)
exports.miValoracion = async (req, res, next) => {

    try{
        const resultado = await valoracionesService.miValoracion(req.usuario, req.params.id)
        res.json(resultado)
    }catch(err){
        next(err)
    }

}