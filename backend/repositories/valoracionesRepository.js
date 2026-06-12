// Capa de acceso a datos para valoraciones.
// Solo consultas SQL. Cada función devuelve una Promesa.

const db = require('../db')


// Comprueba si el adoptante tiene una solicitud APROBADA con el refugio.
// Es la condición para poder valorarlo: hace un JOIN entre solicitudes
// y mascotas para encontrar si hay alguna solicitud aprobada del adoptante
// que sea para una mascota publicada por ese refugio.
function tieneAdopcionAprobada(adoptanteId, refugioId){

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT s.id
            FROM solicitudes_adopcion s
            JOIN mascotas m ON m.id = s.mascota_id
            WHERE s.usuario_id = ?
              AND m.usuario_id = ?
              AND s.estado = 'aprobada'
            LIMIT 1
        `

        db.query(sql, [adoptanteId, refugioId], (err, result) => {
            if(err) return reject(err)
            resolve(result.length > 0)
        })

    })

}


// busca si ya existe una valoración del adoptante para ese refugio.
// Sirve para saber si debemos crear una nueva o actualizar la existente.
function buscarPorAdoptanteYRefugio(adoptanteId, refugioId){

    return new Promise((resolve, reject) => {

        const sql = 'SELECT * FROM valoraciones WHERE adoptante_id = ? AND refugio_id = ?'

        db.query(sql, [adoptanteId, refugioId], (err, result) => {
            if(err) return reject(err)
            resolve(result[0] || null)
        })

    })

}


// crea una valoración nueva
function crear(adoptanteId, refugioId, estrellas, comentario){

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO valoraciones (adoptante_id, refugio_id, estrellas, comentario)
            VALUES (?, ?, ?, ?)
        `

        db.query(sql, [adoptanteId, refugioId, estrellas, comentario], (err, result) => {
            if(err) return reject(err)
            resolve(result.insertId)
        })

    })

}


// actualiza una valoración existente
function actualizar(id, estrellas, comentario){

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE valoraciones
            SET estrellas = ?, comentario = ?, fecha = CURRENT_TIMESTAMP
            WHERE id = ?
        `

        db.query(sql, [estrellas, comentario, id], (err) => {
            if(err) return reject(err)
            resolve()
        })

    })

}


// devuelve todas las valoraciones de un refugio, con el nombre del
// adoptante para mostrarlo en la reseña.
function listarPorRefugio(refugioId){

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT v.id, v.estrellas, v.comentario, v.fecha,
                   u.nombre AS adoptante_nombre
            FROM valoraciones v
            JOIN usuarios u ON u.id = v.adoptante_id
            WHERE v.refugio_id = ?
            ORDER BY v.fecha DESC
        `

        db.query(sql, [refugioId], (err, result) => {
            if(err) return reject(err)
            resolve(result)
        })

    })

}


// calcula la media de estrellas y el número total de valoraciones
// de un refugio. Lo usamos en la página de refugios para mostrar la
// puntuación general.
function estadisticasPorRefugio(refugioId){

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                COUNT(*) AS total,
                ROUND(AVG(estrellas), 1) AS media
            FROM valoraciones
            WHERE refugio_id = ?
        `

        db.query(sql, [refugioId], (err, result) => {
            if(err) return reject(err)
            // si no hay valoraciones, AVG devuelve NULL → devolvemos 0
            const stats = result[0]
            resolve({
                total: stats.total || 0,
                media: stats.media || 0
            })
        })

    })

}


module.exports = {
    tieneAdopcionAprobada,
    buscarPorAdoptanteYRefugio,
    crear,
    actualizar,
    listarPorRefugio,
    estadisticasPorRefugio
}