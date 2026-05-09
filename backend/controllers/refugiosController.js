// Controlador de refugios: gestiona el listado público de refugios
// y el perfil propio del refugio (solo accesible por el refugio dueño).

const db = require("../db")


// ====== PÚBLICO ======

// Listar todos los refugios. Acepta un parámetro opcional ?limite=N
// para que el home pueda pedir solo los 6 primeros.
// Por cada refugio devolvemos también cuántas mascotas tiene publicadas.
exports.listarRefugios = (req, res) => {

    const limite = req.query.limite ? parseInt(req.query.limite) : null

    // LEFT JOIN para que aparezcan también los refugios sin mascotas (con num_mascotas = 0)
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
            console.log("ERROR SQL:", err)
            return res.status(500).json({mensaje:"Error del servidor", detalle: err.message})
        }
        res.json(result)
    })

}


// Obtener un refugio concreto + sus mascotas, para el modal de detalle.
exports.obtenerRefugio = (req, res) => {

    const id = req.params.id

    const sqlRefugio = "SELECT * FROM refugios WHERE id = ?"

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

// Obtener mi perfil de refugio (si existe). Si aún no lo ha creado,
// devolvemos null para que el frontend muestre el formulario en blanco.
exports.miRefugio = (req, res) => {

    if(req.usuario.tipo !== "protectora"){
        return res.status(403).json({mensaje:"Solo los refugios pueden ver esto"})
    }

    const sql = "SELECT * FROM refugios WHERE usuario_id = ?"

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


// Crear o actualizar mi perfil de refugio.
// Si ya existe un registro con mi usuario_id, lo actualizamos. Si no, lo creamos.
// Esto permite que el mismo formulario sirva para "crear primera vez" y "editar".
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
            console.log("ERROR SQL:", err)
            return res.status(500).json({mensaje:"Error del servidor", detalle: err.message})
        }

        if(result.length > 0){

            // ya existe: actualizamos. Si no se ha subido imagen nueva,
            // mantenemos la que tenía guardada.
            const imagen = imagenNueva || result[0].imagen

            const sql = `
                UPDATE refugios
                SET nombre = ?, email = ?, telefono = ?, ciudad = ?, descripcion = ?, imagen = ?
                WHERE usuario_id = ?
            `

            db.query(sql, [nombre, email, telefono, ciudad, descripcion, imagen, req.usuario.id], (err) => {
                if(err){
                    console.log("ERROR SQL:", err)
                    return res.status(500).json({mensaje:"Error al actualizar", detalle: err.message})
                }
                res.json({mensaje:"Refugio actualizado"})
            })

        }else{

            // no existe: creamos uno nuevo
            const sql = `
                INSERT INTO refugios (nombre, email, telefono, ciudad, descripcion, imagen, usuario_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `

            db.query(sql, [nombre, email, telefono, ciudad, descripcion, imagenNueva, req.usuario.id], (err) => {
                if(err){
                    console.log("ERROR SQL:", err)
                    return res.status(500).json({mensaje:"Error al crear", detalle: err.message})
                }
                res.json({mensaje:"Refugio creado"})
            })

        }

    })

}
