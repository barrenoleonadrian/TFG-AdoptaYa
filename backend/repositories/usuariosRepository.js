// Capa de acceso a datos para usuarios.
// Solo consultas SQL: encontrar, crear, actualizar... Nada de lógica de
// negocio. Cada función devuelve una Promesa, así el service puede usar
// async/await en lugar de callbacks anidados.

const db = require('../db')


function buscarPorEmail(email){

    return new Promise((resolve, reject) => {

        const sql = 'SELECT * FROM usuarios WHERE email = ?'

        db.query(sql, [email], (err, result) => {
            if(err) return reject(err)
            resolve(result[0] || null)
        })

    })

}


function buscarPorId(id){

    return new Promise((resolve, reject) => {

        const sql = 'SELECT id, nombre, email, tipo, verificado, telefono, ciudad FROM usuarios WHERE id = ?'

        db.query(sql, [id], (err, result) => {
            if(err) return reject(err)
            resolve(result[0] || null)
        })

    })

}


function crear(datos){

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO usuarios (nombre, email, password, tipo, verificado, telefono, ciudad)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `

        const params = [
            datos.nombre,
            datos.email,
            datos.password,
            datos.tipo,
            datos.verificado,
            datos.telefono,
            datos.ciudad
        ]

        db.query(sql, params, (err, result) => {
            if(err) return reject(err)
            resolve(result.insertId)
        })

    })

}


function crearRefugio(usuarioId, cif){

    return new Promise((resolve, reject) => {

        const sql = 'INSERT INTO refugios (usuario_id, cif) VALUES (?, ?)'

        db.query(sql, [usuarioId, cif], (err) => {
            if(err) return reject(err)
            resolve()
        })

    })

}


module.exports = {
    buscarPorEmail,
    buscarPorId,
    crear,
    crearRefugio
}