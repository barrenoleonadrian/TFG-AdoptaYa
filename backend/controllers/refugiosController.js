// Controlador de refugios: gestiona el listado público de refugios
// y el perfil propio del refugio (solo accesible por el refugio dueño).
//
// La tabla `refugios` solo guarda los datos específicos (cif, descripcion,
// imagen). Los datos comunes (nombre, email, telefono, ciudad) viven en
// `usuarios` y se obtienen mediante JOIN.
//
// IMPORTANTE: en todas las queries devolvemos `r.usuario_id AS id` para
// que el id que ve el frontend sea el id del usuario protectora (no el
// id de la fila en la tabla refugios). Así otras entidades como
// valoraciones, mensajes o solicitudes, que referencian al usuario,
// pueden hacer match correctamente.

const db = require("../db")


// ====== PÚBLICO ======

// Listar todos los refugios verificados.
exports.listarRefugios = (req, res) => {

    const limite = req.query.limite ? parseInt(req.query.limite) : null

    let sql = `
        SELECT
            r.usuario_id AS id, r.cif, r.descripcion, r.imagen,
            u.nombre, u.email, u.telefono, u.ciudad,
            COUNT(m.id) AS num_mascotas
        FROM refugios r
        INNER JOIN usuarios u ON u.id = r.usuario_id
        LEFT JOIN mascotas m ON m.usuario_id = r.usuario_id
        WHERE u.verificado = TRUE
        GROUP BY r.usuario_id
        ORDER BY u.id ASC
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
// El :id en la URL ahora es el usuario_id.
exports.obtenerRefugio = (req, res) => {

    const usuarioId = req.params.id

    const sqlRefugio = `
        SELECT
            r.usuario_id AS id, r.cif, r.descripcion, r.imagen,
            u.nombre, u.email, u.telefono, u.ciudad
        FROM refugios r
        INNER JOIN usuarios u ON u.id = r.usuario_id
        WHERE r.usuario_id = ?
    `

    db.query(sqlRefugio, [usuarioId], (err, result) => {

        if(err){
            console.log("ERROR SQL:", err)
            return res.status(500).json({mensaje:"Error del servidor", detalle: err.message})
        }

        if(result.length === 0){
            return res.status(404).json({mensaje:"Refugio no encontrado"})
        }

        const refugio = result[0]

        // las mascotas que ha publicado este refugio
        const sqlMascotas = "SELECT * FROM mascotas WHERE usuario_id = ? ORDER BY id DESC"

        db.query(sqlMascotas, [usuarioId], (err, mascotas) => {
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

// Obtener mi perfil de refugio.
exports.miRefugio = (req, res) => {

    if(req.usuario.tipo !== "protectora"){
        return res.status(403).json({mensaje:"Solo los refugios pueden ver esto"})
    }

    const sql = `
        SELECT
            r.usuario_id AS id, r.cif, r.descripcion, r.imagen,
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