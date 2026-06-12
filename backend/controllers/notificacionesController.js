// Controller de notificaciones. Solo gestiona HTTP.

const notificacionesService = require('../services/notificacionesService')


// GET /notificaciones  →  listar mis notificaciones
exports.listar = async (req, res, next) => {

    try{
        const resultado = await notificacionesService.listar(req.usuario)
        res.json(resultado)
    }catch(err){
        next(err)
    }

}


// GET /notificaciones/sin-leer  →  contador
exports.contarSinLeer = async (req, res, next) => {

    try{
        const resultado = await notificacionesService.contarSinLeer(req.usuario)
        res.json(resultado)
    }catch(err){
        next(err)
    }

}


// PUT /notificaciones/leer-todas  →  marcar todas como leídas
exports.marcarTodasLeidas = async (req, res, next) => {

    try{
        const resultado = await notificacionesService.marcarTodasLeidas(req.usuario)
        res.json(resultado)
    }catch(err){
        next(err)
    }

}


// PUT /notificaciones/:id/leer  →  marcar una como leída
exports.marcarLeida = async (req, res, next) => {

    try{
        const resultado = await notificacionesService.marcarLeida(req.usuario, req.params.id)
        res.json(resultado)
    }catch(err){
        next(err)
    }

}