// Controlador de refugios: gestiona el listado público de refugios
// y el perfil propio del refugio (solo accesible por el refugio dueño).
//
// La tabla `refugios` solo guarda los datos específicos (cif, descripcion,
// imagen). Los datos comunes (nombre, email, telefono, ciudad) viven en
// `usuarios` y se obtienen mediante JOIN.

const db = require("../db")


// ====== PÚBLICO ======

// Listar todos los refugios verificados. Acepta un parámetro opcional
// ?limite=N para que el home pueda pedir solo los N primeros.
// JOIN con usuarios para obtener nombre/email/telefono/ciudad,
// LEFT JOIN con mascotas para contar cuántas tiene publicadas.
exports.listarRefugios = (req, res) => {

    const limite = req.query.limite ? parseInt(req.query.limite) : null

    let sql = `
        SELECT
            r.id, r.usuario_id, r.cif, r.descripcion, r.imagen,
            u.nombre, u.email, u.telefono, u.ciudad,
            COUNT(m.id) AS num_mascotas
        FROM refugios r
        INNER JOIN usuarios u ON u.id = r.usuario_id
        LEFT JOIN mascotas m ON m.usuario_id = r.usuario_id
        WHERE u.verificado = TRUE
        GROUP BY r.id
        ORDER BY r.id ASC
    `

    if(limite){
        sql += " LIMIT " + limite
    }

    db.query(sql, (err, result) => {
        if(err){
            console.log("ERROR SQL:", err)
            return res.status(500).json({mensaje:"Error del servidor", detalle: err.message})
        }
        res.json(result)
    })

}


// Obtener un refugio concreto + sus mascotas, para el modal de detalle.
exports.obtenerRefugio = (req, res) => {

    const id = req.params.id

    const sqlRefugio = `
        SELECT
            r.id, r.usuario_id, r.cif, r.descripcion, r.imagen,
            u.nombre, u.email, u.telefono, u.ciudad
        FROM refugios r
        INNER JOIN usuarios u ON u.id = r.usuario_id
        WHERE r.id = ?
    `

    db.query(sqlRefugio, [id], (err, result) => {

        if(err){
            console.log("ERROR SQL:", err)
            return res.status(500).json({mensaje:"Error del servidor", detalle: err.message})
        }

        if(result.length === 0){
            return res.status(404).json({mensaje:"Refugio no encontrado"})
        }

        const refugio = result[0]

        // segunda consulta: las mascotas que ha publicado este refugio
        const sqlMascotas = "SELECT * FROM mascotas WHERE usuario_id = ? ORDER BY id DESC"

        db.query(sqlMascotas, [refugio.usuario_id], (err, mascotas) => {
            if(err){
                console.log("ERROR SQL:", err)
                return res.status(500).json({mensaje:"Error del servidor", detalle: err.message})
            }
            res.json({
                refugio: refugio,
                mascotas: mascotas
            })
        })

    })

}


// ====== PRIVADO (solo el propio refugio) ======

// Obtener mi perfil de refugio. Hacemos JOIN para devolver también
// los datos comunes (nombre, email, telefono, ciudad) desde usuarios.
exports.miRefugio = (req, res) => {

    if(req.usuario.tipo !== "protectora"){
        return res.status(403).json({mensaje:"Solo los refugios pueden ver esto"})
    }

    const sql = `
        SELECT
            r.id, r.usuario_id, r.cif, r.descripcion, r.imagen,
            u.nombre, u.email, u.telefono, u.ciudad
        FROM refugios r
        INNER JOIN usuarios u ON u.id = r.usuario_id
        WHERE r.usuario_id = ?
    `

    db.query(sql, [req.usuario.id], (err, result) => {
        if(err){
            console.log("ERROR SQL:", err)
            return res.status(500).json({mensaje:"Error del servidor", detalle: err.message})
        }

        if(result.length === 0){
            return res.json(null)
        }

        res.json(result[0])
    })

}


// Actualizar mi perfil de refugio.
// Los datos comunes (nombre, email, telefono, ciudad) van a `usuarios`.
// Los datos específicos (descripcion, imagen) van a `refugios`.
// Se actualizan las dos tablas en secuencia.
exports.guardarMiRefugio = (req, res) => {

    if(req.usuario.tipo !== "protectora"){
        return res.status(403).json({mensaje:"Solo los refugios pueden hacer esto"})
    }

    const {nombre, email, telefono, ciudad, descripcion} = req.body

    if(!nombre){
        return res.status(400).json({mensaje:"El nombre del refugio es obligatorio"})
    }

    const imagenNueva = req.file ? req.file.filename : null

    // primero actualizamos los datos comunes en `usuarios`
    const sqlUsuario = `
        UPDATE usuarios
        SET nombre = ?, email = ?, telefono = ?, ciudad = ?
        WHERE id = ?
    `

    db.query(sqlUsuario, [nombre, email, telefono, ciudad, req.usuario.id], (err) => {

        if(err){
            console.log("ERROR SQL usuarios:", err)
            return res.status(500).json({mensaje:"Error al actualizar usuario", detalle: err.message})
        }

        // después actualizamos los datos específicos en `refugios`.
        // Si no hay imagen nueva, mantenemos la que ya tenía guardada.
        const sqlRefugio = imagenNueva
            ? "UPDATE refugios SET descripcion = ?, imagen = ? WHERE usuario_id = ?"
            : "UPDATE refugios SET descripcion = ? WHERE usuario_id = ?"

        const params = imagenNueva
            ? [descripcion, imagenNueva, req.usuario.id]
            : [descripcion, req.usuario.id]

        db.query(sqlRefugio, params, (err) => {
            if(err){
                console.log("ERROR SQL refugios:", err)
                return res.status(500).json({mensaje:"Error al actualizar refugio", detalle: err.message})
            }
            res.json({mensaje:"Refugio actualizado correctamente"})
        })

    })

}