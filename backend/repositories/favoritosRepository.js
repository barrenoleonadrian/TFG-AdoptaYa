// Capa de acceso a datos para favoritos.
// Solo consultas SQL. Cada función devuelve una Promesa para que el
// service pueda usar async/await.

const db = require('../db')


// añadir mascota a favoritos. Como la combinación (usuario, mascota) es
// UNIQUE en la BBDD, intentar añadir un duplicado lanza error. Usamos
// INSERT IGNORE para que sea idempotente: si ya existe, no falla.
function anadir(usuarioId, mascotaId){

    return new Promise((resolve, reject) => {

        const sql = 'INSERT IGNORE INTO favoritos (usuario_id, mascota_id) VALUES (?, ?)'

        db.query(sql, [usuarioId, mascotaId], (err) => {
            if(err) return reject(err)
            resolve()
        })

    })

}


// quitar mascota de favoritos
function quitar(usuarioId, mascotaId){

    return new Promise((resolve, reject) => {

        const sql = 'DELETE FROM favoritos WHERE usuario_id = ? AND mascota_id = ?'

        db.query(sql, [usuarioId, mascotaId], (err) => {
            if(err) return reject(err)
            resolve()
        })

    })

}


// listar los favoritos del usuario, con datos completos de la mascota
// para poder mostrar las cards directamente en el frontend
function listarPorUsuario(usuarioId){

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT m.*, f.fecha AS fecha_favorito
            FROM favoritos f
            JOIN mascotas m ON m.id = f.mascota_id
            WHERE f.usuario_id = ?
            ORDER BY f.fecha DESC
        `

        db.query(sql, [usuarioId], (err, result) => {
            if(err) return reject(err)
            resolve(result)
        })

    })

}


// devuelve solo los IDs de las mascotas favoritas del usuario.
// El frontend usará este array para saber qué corazones pintar
// como rellenos en el catálogo.
function idsDelUsuario(usuarioId){

    return new Promise((resolve, reject) => {

        const sql = 'SELECT mascota_id FROM favoritos WHERE usuario_id = ?'

        db.query(sql, [usuarioId], (err, result) => {
            if(err) return reject(err)
            // transformamos [{mascota_id: 1}, {mascota_id: 5}] en [1, 5]
            resolve(result.map(r => r.mascota_id))
        })

    })

}


module.exports = {
    anadir,
    quitar,
    listarPorUsuario,
    idsDelUsuario
}