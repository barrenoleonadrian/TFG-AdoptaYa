const db = require("../db")


// ====== PÚBLICO ======

// Listar todos los refugios (con cuántas mascotas tienen)
// Parámetro opcional ?limite=6 para el home.
exports.listarRefugios = (req, res) => {

    const limite = req.query.limite ? parseInt(req.query.limite) : null

    let sql = `
        SELECT r.*, COUNT(m.id) AS num_mascotas
        FROM refugios r
        LEFT JOIN mascotas m ON m.usuario_id = r.usuario_id
        GROUP BY r.id
        ORDER BY r.id ASC
    `

    if(limite){
        sql += " LIMIT " + limite
    }

    db.query(sql, (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }
        res.json(result)
    })

}


// Obtener un refugio concreto + sus mascotas
exports.obtenerRefugio = (req, res) => {

    const id = req.params.id

    const sqlRefugio = "SELECT * FROM refugios WHERE id = ?"

    db.query(sqlRefugio, [id], (err, result) => {

        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }

        if(result.length === 0){
            return res.status(404).json({mensaje:"Refugio no encontrado"})
        }

        const refugio = result[0]

        // también buscamos las mascotas que ha publicado este refugio
        const sqlMascotas = "SELECT * FROM mascotas WHERE usuario_id = ? ORDER BY id DESC"

        db.query(sqlMascotas, [refugio.usuario_id], (err, mascotas) => {
            if(err){
                return res.status(500).json({mensaje:"Error del servidor"})
            }
            res.json({
                refugio: refugio,
                mascotas: mascotas
            })
        })

    })

}


// ====== PRIVADO (solo el propio refugio) ======

// Obtener mi perfil de refugio (si existe)
exports.miRefugio = (req, res) => {

    if(req.usuario.tipo !== "protectora"){
        return res.status(403).json({mensaje:"Solo los refugios pueden ver esto"})
    }

    const sql = "SELECT * FROM refugios WHERE usuario_id = ?"

    db.query(sql, [req.usuario.id], (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }

        // puede que aún no tenga perfil — devolvemos null en ese caso
        if(result.length === 0){
            return res.json(null)
        }

        res.json(result[0])
    })

}


// Crear o actualizar mi perfil de refugio.
// Si ya existe un registro con mi usuario_id → lo actualizo.
// Si no → lo creo.
exports.guardarMiRefugio = (req, res) => {

    if(req.usuario.tipo !== "protectora"){
        return res.status(403).json({mensaje:"Solo los refugios pueden hacer esto"})
    }

    const {nombre, email, telefono, ciudad, descripcion} = req.body

    if(!nombre){
        return res.status(400).json({mensaje:"El nombre del refugio es obligatorio"})
    }

    // imagen puede llegar por multer (archivo nuevo) o no llegar (mantener la anterior)
    const imagenNueva = req.file ? req.file.filename : null

    // primero miramos si ya existe un refugio para este usuario
    const checkSql = "SELECT * FROM refugios WHERE usuario_id = ?"

    db.query(checkSql, [req.usuario.id], (err, result) => {

        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }

        if(result.length > 0){

            // ya existe → lo actualizamos
            // si no se ha subido imagen nueva, mantenemos la que tenía
            const imagen = imagenNueva || result[0].imagen

            const sql = `
                UPDATE refugios
                SET nombre = ?, email = ?, telefono = ?, ciudad = ?, descripcion = ?, imagen = ?
                WHERE usuario_id = ?
            `

            db.query(sql, [nombre, email, telefono, ciudad, descripcion, imagen, req.usuario.id], (err) => {
                if(err){
                    return res.status(500).json({mensaje:"Error al actualizar"})
                }
                res.json({mensaje:"Refugio actualizado"})
            })

        }else{

            // no existe → lo creamos
            const sql = `
                INSERT INTO refugios (nombre, email, telefono, ciudad, descripcion, imagen, usuario_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `

            db.query(sql, [nombre, email, telefono, ciudad, descripcion, imagenNueva, req.usuario.id], (err) => {
                if(err){
                    return res.status(500).json({mensaje:"Error al crear"})
                }
                res.json({mensaje:"Refugio creado"})
            })

        }

    })

}
