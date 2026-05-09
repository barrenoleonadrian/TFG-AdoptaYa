// Controlador de mascotas: gestiona el catálogo público y las acciones
// que pueden hacer refugios y adoptantes (publicar mascota, adoptar...).

const db = require("../db")


// OBTENER TODAS LAS MASCOTAS (con filtros)
// Endpoint público. Acepta tres filtros opcionales por query string:
// tipo (perro, gato...), ciudad y búsqueda libre por nombre o raza.
// Si no se manda ningún filtro, devuelve todas las mascotas.
exports.obtenerMascotas = (req, res) => {

    let {tipo, ciudad, busqueda} = req.query

    // empezamos con un WHERE que filtra solo las disponibles.
    // Las reservadas o adoptadas no aparecen en el catálogo público.
    let sql = "SELECT * FROM mascotas WHERE estado = 'disponible'"
    let params = []

    if(tipo){
        sql += " AND LOWER(tipo) = LOWER(?)"
        params.push(tipo)
    }

    if(ciudad){
        sql += " AND LOWER(ciudad) = LOWER(?)"
        params.push(ciudad)
    }

    // búsqueda libre con LIKE: busca el texto en nombre y en raza
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
// Endpoint público. Se usa al hacer clic en una tarjeta del catálogo.
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


// CREAR MASCOTA - solo refugio verificado o admin
// Recibe los datos como FormData (no JSON) porque incluye una imagen.
// El middleware multer ya ha guardado la imagen en /img antes de llegar aquí
// y la info del archivo está en req.file.
exports.crearMascota = (req, res) => {

    if(req.usuario.tipo !== "protectora" && req.usuario.tipo !== "admin"){
        return res.status(403).json({mensaje:"Solo los refugios pueden añadir mascotas"})
    }

    // con FormData los campos de texto vienen en req.body igualmente
    const {nombre, tipo, raza, sexo, edad, descripcion, ciudad} = req.body

    if(!nombre || !tipo){
        return res.status(400).json({mensaje:"Nombre y tipo son obligatorios"})
    }

    // guardamos solo el nombre del archivo en la BBDD; la imagen ya está
    // en disco gracias a multer
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


// SOLICITAR ADOPCIÓN - solo adoptantes
// Recibe los datos del formulario de adopción (vivienda, experiencia, etc.)
// y crea una solicitud en estado "pendiente". El refugio luego decidirá.
exports.adoptar = (req, res) => {

    if(req.usuario.tipo !== "adoptante"){
        return res.status(403).json({mensaje:"Solo los usuarios pueden adoptar"})
    }

    const mascota_id = req.params.id

    // todos los campos del formulario
    const {
        nombre_solicitante, mayor_edad, direccion, tipo_vivienda,
        jardin, experiencia, otras_mascotas, motivo, situacion_laboral
    } = req.body

    // validamos los campos obligatorios
    if(!nombre_solicitante || !direccion || !tipo_vivienda || !motivo || !situacion_laboral){
        return res.status(400).json({mensaje:"Faltan campos obligatorios"})
    }

    if(!mayor_edad){
        return res.status(400).json({mensaje:"Debes ser mayor de edad para adoptar"})
    }

    // primero comprobamos que la mascota exista y esté disponible
    const checkSql = "SELECT estado FROM mascotas WHERE id = ?"

    db.query(checkSql, [mascota_id], (err, result) => {

        if(err){
            return res.status(500).json({mensaje:"Error"})
        }

        if(result.length === 0){
            return res.status(404).json({mensaje:"Mascota no encontrada"})
        }

        // si ya no está disponible (reservada o adoptada), no aceptamos más solicitudes
        if(result[0].estado !== "disponible"){
            return res.status(400).json({mensaje:"Esta mascota ya no está disponible"})
        }

        // comprobamos que el usuario no tenga ya una solicitud pendiente para esta mascota
        const checkSolicitud = `
            SELECT id FROM solicitudes_adopcion
            WHERE usuario_id = ? AND mascota_id = ? AND estado IN ('pendiente', 'en_revision', 'aprobada')
        `

        db.query(checkSolicitud, [req.usuario.id, mascota_id], (err, result) => {

            if(err){
                return res.status(500).json({mensaje:"Error"})
            }

            if(result.length > 0){
                return res.status(400).json({mensaje:"Ya tienes una solicitud activa para esta mascota"})
            }

            // creamos la solicitud con todos los datos.
            // incluimos también el campo "mensaje" (vacío) por compatibilidad con
            // versiones antiguas de la tabla donde esa columna era NOT NULL.
            const sql = `
                INSERT INTO solicitudes_adopcion
                (usuario_id, mascota_id, mensaje, nombre_solicitante, mayor_edad, direccion,
                 tipo_vivienda, jardin, experiencia, otras_mascotas, motivo, situacion_laboral)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `

            const params = [
                req.usuario.id, mascota_id, "",
                nombre_solicitante, mayor_edad ? 1 : 0,
                direccion, tipo_vivienda, jardin ? 1 : 0, experiencia ? 1 : 0,
                otras_mascotas || null, motivo, situacion_laboral
            ]

            db.query(sql, params, (err) => {
                if(err){
                    console.log("ERROR SQL al crear solicitud:", err)
                    return res.status(500).json({mensaje:"Error al solicitar", detalle: err.message})
                }
                res.json({mensaje:"Solicitud enviada correctamente"})
            })

        })

    })

}


// MIS SOLICITUDES (vista del adoptante)
// Devuelve todas las solicitudes que ha enviado el adoptante logueado,
// con la info de la mascota que solicitó.
exports.misSolicitudesAdoptante = (req, res) => {

    if(req.usuario.tipo !== "adoptante"){
        return res.status(403).json({mensaje:"Solo los adoptantes pueden ver sus solicitudes"})
    }

    const sql = `
        SELECT s.id, s.estado, s.fecha,
               m.id AS mascota_id, m.nombre AS mascota_nombre, m.imagen AS mascota_imagen,
               u.nombre AS refugio_nombre
        FROM solicitudes_adopcion s
        JOIN mascotas m ON m.id = s.mascota_id
        JOIN usuarios u ON u.id = m.usuario_id
        WHERE s.usuario_id = ?
        ORDER BY s.fecha DESC
    `

    db.query(sql, [req.usuario.id], (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }
        res.json(result)
    })

}
