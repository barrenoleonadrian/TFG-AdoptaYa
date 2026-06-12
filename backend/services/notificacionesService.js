// Capa de lógica de negocio para notificaciones.
//
// Tiene dos tipos de funciones:
//   - Las que llama el FRONTEND a través del controller (listar, contar,
//     marcar como leídas). Devuelven datos al cliente.
//   - La función crear() que llaman OTROS services del backend cuando
//     pasa algo importante (aprobar solicitud, valorar, enviar mensaje...).
//     No la usa el cliente directamente.

const notificacionesRepo = require('../repositories/notificacionesRepository')


// crea una notificación para un usuario. La llaman otros services
// cuando se produce algún evento que merece notificar.
//
// Si falla, no propagamos el error: una notificación no es crítica,
// no queremos que un fallo aquí rompa la acción principal (ej: que
// aprobar una solicitud falle solo porque no se pudo crear la
// notificación). Lo registramos en consola y seguimos.
async function crear(usuarioId, tipo, texto, enlace){

    try{
        await notificacionesRepo.crear(usuarioId, tipo, texto, enlace)
    }catch(err){
        console.log('Error al crear notificación:', err)
    }

}


// listar las notificaciones del usuario logueado
async function listar(usuario){
    return notificacionesRepo.listarPorUsuario(usuario.id)
}


// contar las que no ha leído (para el contador de la campanita)
async function contarSinLeer(usuario){
    const total = await notificacionesRepo.contarSinLeer(usuario.id)
    return { total }
}


// marcar todas como leídas (cuando el usuario abre el panel)
async function marcarTodasLeidas(usuario){
    await notificacionesRepo.marcarTodasLeidas(usuario.id)
    return { mensaje: 'Notificaciones marcadas como leídas' }
}


// marcar una notificación concreta como leída (al pulsar sobre ella)
async function marcarLeida(usuario, id){
    await notificacionesRepo.marcarLeida(id, usuario.id)
    return { mensaje: 'Notificación marcada como leída' }
}


module.exports = {
    crear,
    listar,
    contarSinLeer,
    marcarTodasLeidas,
    marcarLeida
}