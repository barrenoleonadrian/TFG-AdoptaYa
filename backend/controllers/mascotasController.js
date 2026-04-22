const db = require("../db")


// OBTENER TODAS LAS MASCOTAS (con filtros)
exports.obtenerMascotas = (req, res) => {

    let {tipo, ciudad, busqueda} = req.query

    let sql = "SELECT * FROM mascotas WHERE 1=1"
    let params = []

    if(tipo){
        sql += " AND LOWER(tipo) = LOWER(?)"
        params.push(tipo)
    }

    if(ciudad){
        sql += " AND LOWER(ciudad) = LOWER(?)"
        params.push(ciudad)
    }

    if(busqueda){
        sql += " AND (nombre LIKE ? OR raza LIKE ?)"
        params.push("%" + busqueda + "%")
        params.push("%" + busqueda + "%")
    }

    db.query(sql, params, (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error"})
        }
        res.json(result)
    })

}


// OBTENER UNA MASCOTA POR ID
exports.obtenerMascota = (req, res) => {

    const id = req.params.id
    const sql = "SELECT * FROM mascotas WHERE id = ?"

    db.query(sql, [id], (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error"})
        }
        res.json(result[0])
    })

}


// CREAR MASCOTA - solo refugio (protectora) o admin
// Recibe los datos como FormData (no JSON) porque viene con imagen adjunta.
// El middleware multer ya ha guardado la imagen en /img y la info está en req.file.
exports.crearMascota = (req, res) => {

    if(req.usuario.tipo !== "protectora" && req.usuario.tipo !== "admin"){
        return res.status(403).json({mensaje:"Solo los refugios pueden añadir mascotas"})
    }

    // cuando se usa FormData los campos de texto vienen en req.body igualmente
    const {nombre, tipo, raza, sexo, edad, descripcion, ciudad} = req.body

    if(!nombre || !tipo){
        return res.status(400).json({mensaje:"Nombre y tipo son obligatorios"})
    }

    // si se subió una imagen, guardamos el nombre del archivo. Si no, null.
    const imagen = req.file ? req.file.filename : null

    const sql = `
        INSERT INTO mascotas (nombre, tipo, raza, sexo, edad, descripcion, ciudad, imagen, usuario_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [nombre, tipo, raza, sexo, edad, descripcion, ciudad, imagen, req.usuario.id]

    db.query(sql, params, (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error al crear la mascota"})
        }
        res.json({mensaje:"Mascota creada", id: result.insertId})
    })

}


// ADOPTAR UNA MASCOTA - solo adoptantes
exports.adoptar = (req, res) => {

    if(req.usuario.tipo !== "adoptante"){
        return res.status(403).json({mensaje:"Solo los usuarios pueden adoptar"})
    }

    const mascota_id = req.params.id

    const checkSql = "SELECT estado FROM mascotas WHERE id = ?"

    db.query(checkSql, [mascota_id], (err, result) => {

        if(err){
            return res.status(500).json({mensaje:"Error"})
        }

        if(result.length === 0){
            return res.status(404).json({mensaje:"Mascota no encontrada"})
        }

        if(result[0].estado !== "disponible"){
            return res.status(400).json({mensaje:"Esta mascota ya no está disponible"})
        }

        const sql = `
            INSERT INTO solicitudes_adopcion (usuario_id, mascota_id)
            VALUES (?, ?)
        `

        db.query(sql, [req.usuario.id, mascota_id], (err) => {
            if(err){
                return res.status(500).json({mensaje:"Error al solicitar"})
            }
            res.json({mensaje:"Solicitud enviada correctamente"})
        })

    })

}
