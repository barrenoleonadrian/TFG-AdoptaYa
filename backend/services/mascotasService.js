// Capa de lógica de negocio para mascotas.
// Aquí van las reglas: comprobar permisos por rol, validar campos,
// asegurar que la mascota esté disponible antes de aceptar solicitudes,
// evitar solicitudes duplicadas, etc.
//
// Los errores se lanzan con las clases personalizadas para que el
// errorHandler central los convierta en respuestas HTTP correctas.

const mascotasRepo = require('../repositories/mascotasRepository')
const notificacionesService = require('./notificacionesService')

const {
    BadRequestError,
    NotFoundError,
    ForbiddenError
} = require('../utils/errors')


// LISTAR mascotas disponibles con filtros opcionales
async function listar(filtros){
    return mascotasRepo.buscarConFiltros(filtros)
}


// OBTENER una mascota por su id
async function obtener(id){

    const mascota = await mascotasRepo.buscarPorId(id)

    if(!mascota){
        throw new NotFoundError('Mascota no encontrada')
    }

    return mascota

}


// CREAR mascota: solo refugios verificados o admin pueden hacerlo
async function crear(datosUsuario, datos, imagen){

    if(datosUsuario.tipo !== 'protectora' && datosUsuario.tipo !== 'admin'){
        throw new ForbiddenError('Solo los refugios pueden añadir mascotas')
    }

    if(!datos.nombre || !datos.tipo){
        throw new BadRequestError('Nombre y tipo son obligatorios')
    }

    const id = await mascotasRepo.crear({
        nombre: datos.nombre,
        tipo: datos.tipo,
        raza: datos.raza,
        sexo: datos.sexo,
        edad: datos.edad,
        descripcion: datos.descripcion,
        ciudad: datos.ciudad,
        imagen: imagen,
        usuario_id: datosUsuario.id
    })

    return { mensaje: 'Mascota creada', id }

}


// SOLICITAR ADOPCIÓN: solo adoptantes, con varias comprobaciones previas
async function solicitarAdopcion(usuario, mascotaId, datos){

    if(usuario.tipo !== 'adoptante'){
        throw new ForbiddenError('Solo los adoptantes pueden adoptar')
    }

    const {
        nombre_solicitante, mayor_edad, direccion, tipo_vivienda,
        jardin, experiencia, otras_mascotas, motivo, situacion_laboral
    } = datos

    if(!nombre_solicitante || !direccion || !tipo_vivienda || !motivo || !situacion_laboral){
        throw new BadRequestError('Faltan campos obligatorios')
    }

    if(!mayor_edad){
        throw new BadRequestError('Debes ser mayor de edad para adoptar')
    }

    // la mascota debe existir y estar disponible
    const mascota = await mascotasRepo.buscarPorId(mascotaId)

    if(!mascota){
        throw new NotFoundError('Mascota no encontrada')
    }

    if(mascota.estado !== 'disponible'){
        throw new BadRequestError('Esta mascota ya no está disponible')
    }

    // el usuario no puede tener ya una solicitud activa para esta misma mascota
    const solicitudExistente = await mascotasRepo.buscarSolicitudActiva(usuario.id, mascotaId)

    if(solicitudExistente){
        throw new BadRequestError('Ya tienes una solicitud activa para esta mascota')
    }

    await mascotasRepo.crearSolicitud({
        usuario_id: usuario.id,
        mascota_id: mascotaId,
        nombre_solicitante,
        mayor_edad,
        direccion,
        tipo_vivienda,
        jardin,
        experiencia,
        otras_mascotas,
        motivo,
        situacion_laboral
    })

    // notificamos al refugio que tiene una solicitud nueva.
    // mascota.usuario_id es el id del refugio dueño de la mascota.
    notificacionesService.crear(
        mascota.usuario_id,
        "solicitud_nueva",
        `${nombre_solicitante} ha solicitado adoptar a ${mascota.nombre}.`,
        "mis-mascotas"
    )

    return { mensaje: 'Solicitud enviada correctamente' }

}


// MIS SOLICITUDES: las que ha enviado el adoptante logueado
async function misSolicitudes(usuario){

    if(usuario.tipo !== 'adoptante'){
        throw new ForbiddenError('Solo los adoptantes pueden ver sus solicitudes')
    }

    return mascotasRepo.solicitudesDelAdoptante(usuario.id)

}


module.exports = {
    listar,
    obtener,
    crear,
    solicitarAdopcion,
    misSolicitudes
}