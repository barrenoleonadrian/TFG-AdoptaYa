// Capa de lógica de negocio para favoritos.
// Aplica las reglas: solo los adoptantes pueden tener favoritos,
// se valida que la mascota exista, etc.

const favoritosRepo = require('../repositories/favoritosRepository')
const mascotasRepo = require('../repositories/mascotasRepository')

const {
    ForbiddenError,
    NotFoundError
} = require('../utils/errors')


// AÑADIR a favoritos
async function anadir(usuario, mascotaId){

    if(usuario.tipo !== 'adoptante'){
        throw new ForbiddenError('Solo los adoptantes pueden marcar favoritos')
    }

    // comprobamos que la mascota existe
    const mascota = await mascotasRepo.buscarPorId(mascotaId)

    if(!mascota){
        throw new NotFoundError('Mascota no encontrada')
    }

    await favoritosRepo.anadir(usuario.id, mascotaId)

    return { mensaje: 'Añadido a favoritos' }

}


// QUITAR de favoritos
async function quitar(usuario, mascotaId){

    if(usuario.tipo !== 'adoptante'){
        throw new ForbiddenError('Solo los adoptantes pueden gestionar favoritos')
    }

    await favoritosRepo.quitar(usuario.id, mascotaId)

    return { mensaje: 'Quitado de favoritos' }

}


// LISTAR favoritos del adoptante con datos completos de cada mascota
async function listar(usuario){

    if(usuario.tipo !== 'adoptante'){
        throw new ForbiddenError('Solo los adoptantes pueden ver sus favoritos')
    }

    return favoritosRepo.listarPorUsuario(usuario.id)

}


// devuelve los IDs de las mascotas favoritas del usuario.
// El frontend usa este array para pintar los corazones rellenos.
async function ids(usuario){

    if(usuario.tipo !== 'adoptante'){
        return []
    }

    return favoritosRepo.idsDelUsuario(usuario.id)

}


module.exports = {
    anadir,
    quitar,
    listar,
    ids
}