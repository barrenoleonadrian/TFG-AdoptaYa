// Capa de acceso a datos para notificaciones.
// Solo consultas SQL. Las funciones se llaman tanto desde el controller
// (cuando el usuario pide ver sus notificaciones) como desde otros
// services del backend (cuando hay que crear una notificación nueva
// porque ha pasado algo importante).

const db = require('../db')


// crear notificación para un usuario
function crear(usuarioId, tipo, texto, enlace){

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO notificaciones (usuario_id, tipo, texto, enlace)
            VALUES (?, ?, ?, ?)
        `

        db.query(sql, [usuarioId, tipo, texto, enlace || null], (err) => {
            if(err) return reject(err)
            resolve()
        })

    })

}


// listar las últimas notificaciones del usuario (las más recientes primero).
// Limitamos a 20 para no devolver miles si lleva mucho tiempo sin entrar.
function listarPorUsuario(usuarioId){

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT id, tipo, texto, enlace, leida, fecha
            FROM notificaciones
            WHERE usuario_id = ?
            ORDER BY fecha DESC
            LIMIT 20
        `

        db.query(sql, [usuarioId], (err, result) => {
            if(err) return reject(err)
            resolve(result)
        })

    })

}


// contar cuántas notificaciones tiene el usuario sin leer.
// Es la query que se llama cada 30 segundos desde el frontend,
// por eso es importante el índice (usuario_id, leida) que pusimos.
function contarSinLeer(usuarioId){

    return new Promise((resolve, reject) => {

        const sql = 'SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_id = ? AND leida = 0'

        db.query(sql, [usuarioId], (err, result) => {
            if(err) return reject(err)
            resolve(result[0].total)
        })

    })

}


// marcar todas como leídas
function marcarTodasLeidas(usuarioId){

    return new Promise((resolve, reject) => {

        const sql = 'UPDATE notificaciones SET leida = 1 WHERE usuario_id = ? AND leida = 0'

        db.query(sql, [usuarioId], (err) => {
            if(err) return reject(err)
            resolve()
        })

    })

}


// marcar UNA notificación como leída (al hacer click en ella)
function marcarLeida(id, usuarioId){

    return new Promise((resolve, reject) => {

        // incluimos usuario_id en el WHERE para que un usuario no pueda
        // marcar como leídas notificaciones de OTRO usuario
        const sql = 'UPDATE notificaciones SET leida = 1 WHERE id = ? AND usuario_id = ?'

        db.query(sql, [id, usuarioId], (err) => {
            if(err) return reject(err)
            resolve()
        })

    })

}


module.exports = {
    crear,
    listarPorUsuario,
    contarSinLeer,
    marcarTodasLeidas,
    marcarLeida
}