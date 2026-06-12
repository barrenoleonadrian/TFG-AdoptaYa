// Controller de mascotas. Solo gestiona HTTP: recibe la petición, llama
// al service, devuelve la respuesta. La lógica de negocio vive en
// `mascotasService` y los accesos a BBDD en `mascotasRepository`.
//
// Los errores los lanza el service y los recibe el errorHandler central
// mediante `next(err)`.

const mascotasService = require('../services/mascotasService')


exports.obtenerMascotas = async (req, res, next) => {

    try{

        const resultado = await mascotasService.listar(req.query)
        res.json(resultado)

    }catch(err){
        next(err)
    }

}


exports.obtenerMascota = async (req, res, next) => {

    try{

        const resultado = await mascotasService.obtener(req.params.id)
        res.json(resultado)

    }catch(err){
        next(err)
    }

}


exports.crearMascota = async (req, res, next) => {

    try{

        const imagen = req.file ? req.file.filename : null
        const resultado = await mascotasService.crear(req.usuario, req.body, imagen)
        res.json(resultado)

    }catch(err){
        next(err)
    }

}


exports.adoptar = async (req, res, next) => {

    try{

        const resultado = await mascotasService.solicitarAdopcion(
            req.usuario,
            req.params.id,
            req.body
        )
        res.json(resultado)

    }catch(err){
        next(err)
    }

}


exports.misSolicitudesAdoptante = async (req, res, next) => {

    try{

        const resultado = await mascotasService.misSolicitudes(req.usuario)
        res.json(resultado)

    }catch(err){
        next(err)
    }

}