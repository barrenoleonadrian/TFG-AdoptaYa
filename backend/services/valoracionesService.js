// Capa de lógica de negocio para valoraciones.
// Reglas aplicadas:
//  - Solo adoptantes pueden valorar.
//  - Solo se puede valorar a un refugio con el que tienes una solicitud APROBADA.
//  - Las estrellas deben estar entre 1 y 5.
//  - Si ya valoraste antes, la nueva acción actualiza tu valoración existente.

const valoracionesRepo = require('../repositories/valoracionesRepository')

const {
    BadRequestError,
    ForbiddenError
} = require('../utils/errors')


// CREAR o ACTUALIZAR una valoración
async function valorar(usuario, refugioId, datos){

    if(usuario.tipo !== 'adoptante'){
        throw new ForbiddenError('Solo los adoptantes pueden valorar refugios')
    }

    const { estrellas, comentario } = datos

    // validamos rango de estrellas
    const numEstrellas = parseInt(estrellas)
    if(isNaN(numEstrellas) || numEstrellas < 1 || numEstrellas > 5){
        throw new BadRequestError('Las estrellas deben estar entre 1 y 5')
    }

    // comprobamos que el adoptante tiene una solicitud aprobada con ese refugio
    const tienePermiso = await valoracionesRepo.tieneAdopcionAprobada(usuario.id, refugioId)

    if(!tienePermiso){
        throw new ForbiddenError('Solo puedes valorar refugios con los que has completado una adopción')
    }

    // miramos si ya existe una valoración: la actualizamos o creamos una nueva
    const existente = await valoracionesRepo.buscarPorAdoptanteYRefugio(usuario.id, refugioId)

    if(existente){
        await valoracionesRepo.actualizar(existente.id, numEstrellas, comentario || '')
        return { mensaje: 'Valoración actualizada' }
    }

    await valoracionesRepo.crear(usuario.id, refugioId, numEstrellas, comentario || '')
    return { mensaje: 'Valoración publicada' }

}


// devuelve la valoración previa del adoptante para un refugio (si la hay),
// para que el frontend pueda precargar el formulario al editar.
async function miValoracion(usuario, refugioId){

    if(usuario.tipo !== 'adoptante'){
        return null
    }

    return valoracionesRepo.buscarPorAdoptanteYRefugio(usuario.id, refugioId)

}


// LISTAR todas las valoraciones de un refugio (público)
async function listarPorRefugio(refugioId){
    return valoracionesRepo.listarPorRefugio(refugioId)
}


// ESTADÍSTICAS (media + total) de un refugio (público)
async function estadisticas(refugioId){
    return valoracionesRepo.estadisticasPorRefugio(refugioId)
}


module.exports = {
    valorar,
    miValoracion,
    listarPorRefugio,
    estadisticas
}