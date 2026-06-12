// Capa de acceso a datos para mascotas y solicitudes de adopción.
// Solo consultas SQL. Cada función devuelve una Promesa para que el
// service pueda usar async/await en lugar de callbacks anidados.

const db = require('../db')


// ====== MASCOTAS ======

function buscarConFiltros(filtros){

    return new Promise((resolve, reject) => {

        let sql = "SELECT * FROM mascotas WHERE estado = 'disponible'"
        const params = []

        if(filtros.tipo){
            sql += ' AND LOWER(tipo) = LOWER(?)'
            params.push(filtros.tipo)
        }

        if(filtros.ciudad){
            sql += ' AND LOWER(ciudad) = LOWER(?)'
            params.push(filtros.ciudad)
        }

        if(filtros.busqueda){
            sql += ' AND (nombre LIKE ? OR raza LIKE ?)'
            params.push('%' + filtros.busqueda + '%')
            params.push('%' + filtros.busqueda + '%')
        }

        db.query(sql, params, (err, result) => {
            if(err) return reject(err)
            resolve(result)
        })

    })

}


function buscarPorId(id){

    return new Promise((resolve, reject) => {

        const sql = 'SELECT * FROM mascotas WHERE id = ?'

        db.query(sql, [id], (err, result) => {
            if(err) return reject(err)
            resolve(result[0] || null)
        })

    })

}


function crear(datos){

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO mascotas (nombre, tipo, raza, sexo, edad, descripcion, ciudad, imagen, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `

        const params = [
            datos.nombre, datos.tipo, datos.raza, datos.sexo, datos.edad,
            datos.descripcion, datos.ciudad, datos.imagen, datos.usuario_id
        ]

        db.query(sql, params, (err, result) => {
            if(err) return reject(err)
            resolve(result.insertId)
        })

    })

}


// ====== SOLICITUDES ======

function buscarSolicitudActiva(usuarioId, mascotaId){

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT id FROM solicitudes_adopcion
            WHERE usuario_id = ? AND mascota_id = ?
              AND estado IN ('pendiente', 'en_revision', 'aprobada')
        `

        db.query(sql, [usuarioId, mascotaId], (err, result) => {
            if(err) return reject(err)
            resolve(result[0] || null)
        })

    })

}


function crearSolicitud(datos){

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO solicitudes_adopcion
            (usuario_id, mascota_id, mensaje, nombre_solicitante, mayor_edad, direccion,
             tipo_vivienda, jardin, experiencia, otras_mascotas, motivo, situacion_laboral)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `

        const params = [
            datos.usuario_id,
            datos.mascota_id,
            '',
            datos.nombre_solicitante,
            datos.mayor_edad ? 1 : 0,
            datos.direccion,
            datos.tipo_vivienda,
            datos.jardin ? 1 : 0,
            datos.experiencia ? 1 : 0,
            datos.otras_mascotas || null,
            datos.motivo,
            datos.situacion_laboral
        ]

        db.query(sql, params, (err) => {
            if(err) return reject(err)
            resolve()
        })

    })

}


function solicitudesDelAdoptante(usuarioId){

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT s.id, s.estado, s.fecha,
                   m.id AS mascota_id, m.nombre AS mascota_nombre, m.imagen AS mascota_imagen,
                   u.id AS refugio_id, u.nombre AS refugio_nombre
            FROM solicitudes_adopcion s
            JOIN mascotas m ON m.id = s.mascota_id
            JOIN usuarios u ON u.id = m.usuario_id
            WHERE s.usuario_id = ?
            ORDER BY s.fecha DESC
        `

        db.query(sql, [usuarioId], (err, result) => {
            if(err) return reject(err)
            resolve(result)
        })

    })

}


module.exports = {
    buscarConFiltros,
    buscarPorId,
    crear,
    buscarSolicitudActiva,
    crearSolicitud,
    solicitudesDelAdoptante
}