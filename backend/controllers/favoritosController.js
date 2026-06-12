// Controller de favoritos. Solo gestiona HTTP: recibe la petición,
// llama al service, devuelve la respuesta. Los errores los lanza el
// service y los recibe el errorHandler central con next(err).

const favoritosService = require('../services/favoritosService')


exports.anadir = async (req, res, next) => {

    try{
        const resultado = await favoritosService.anadir(req.usuario, req.params.id)
        res.json(resultado)
    }catch(err){
        next(err)
    }

}


exports.quitar = async (req, res, next) => {

    try{
        const resultado = await favoritosService.quitar(req.usuario, req.params.id)
        res.json(resultado)
    }catch(err){
        next(err)
    }

}


exports.listar = async (req, res, next) => {

    try{
        const resultado = await favoritosService.listar(req.usuario)
        res.json(resultado)
    }catch(err){
        next(err)
    }

}


exports.ids = async (req, res, next) => {

    try{
        const resultado = await favoritosService.ids(req.usuario)
        res.json(resultado)
    }catch(err){
        next(err)
    }

}