const db = require("../db")


// LISTAR MIS CONVERSACIONES
// Devuelve la lista de personas con las que el usuario ha hablado.
// Para cada una, incluye el último mensaje y cuántos hay sin leer.
exports.listarConversaciones = (req, res) => {

    const miId = req.usuario.id

    // sacamos a todos los usuarios con los que he intercambiado mensajes
    // (los que me han escrito o a los que he escrito)
    const sql = `
        SELECT
            u.id, u.nombre, u.tipo,
            (SELECT texto FROM mensajes
             WHERE (emisor_id = u.id AND receptor_id = ?)
                OR (emisor_id = ? AND receptor_id = u.id)
             ORDER BY fecha DESC LIMIT 1) AS ultimo_mensaje,
            (SELECT fecha FROM mensajes
             WHERE (emisor_id = u.id AND receptor_id = ?)
                OR (emisor_id = ? AND receptor_id = u.id)
             ORDER BY fecha DESC LIMIT 1) AS ultima_fecha,
            (SELECT COUNT(*) FROM mensajes
             WHERE emisor_id = u.id AND receptor_id = ? AND leido = FALSE) AS sin_leer
        FROM usuarios u
        WHERE u.id IN (
            SELECT receptor_id FROM mensajes WHERE emisor_id = ?
            UNION
            SELECT emisor_id FROM mensajes WHERE receptor_id = ?
        )
        ORDER BY ultima_fecha DESC
    `

    const params = [miId, miId, miId, miId, miId, miId, miId]

    db.query(sql, params, (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }
        res.json(result)
    })

}


// OBTENER MENSAJES DE UNA CONVERSACIÓN
// Devuelve todos los mensajes intercambiados con un usuario concreto
exports.obtenerMensajes = (req, res) => {

    const miId = req.usuario.id
    const otroId = req.params.usuarioId

    const sql = `
        SELECT m.*, u.nombre AS emisor_nombre
        FROM mensajes m
        JOIN usuarios u ON u.id = m.emisor_id
        WHERE (emisor_id = ? AND receptor_id = ?)
           OR (emisor_id = ? AND receptor_id = ?)
        ORDER BY fecha ASC
    `

    db.query(sql, [miId, otroId, otroId, miId], (err, result) => {

        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }

        // marcamos como leídos los mensajes que el otro usuario me ha enviado
        const updateSql = "UPDATE mensajes SET leido = TRUE WHERE emisor_id = ? AND receptor_id = ?"
        db.query(updateSql, [otroId, miId], () => {
            res.json(result)
        })

    })

}


// ENVIAR MENSAJE
exports.enviarMensaje = (req, res) => {

    const miId = req.usuario.id
    const {receptor_id, texto} = req.body

    if(!receptor_id || !texto || texto.trim() === ""){
        return res.status(400).json({mensaje:"Faltan datos"})
    }

    if(parseInt(receptor_id) === miId){
        return res.status(400).json({mensaje:"No puedes enviarte mensajes a ti mismo"})
    }

    // comprobar que el receptor existe
    const checkSql = "SELECT id FROM usuarios WHERE id = ?"

    db.query(checkSql, [receptor_id], (err, result) => {

        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }

        if(result.length === 0){
            return res.status(404).json({mensaje:"Usuario no encontrado"})
        }

        const sql = "INSERT INTO mensajes (emisor_id, receptor_id, texto) VALUES (?, ?, ?)"

        db.query(sql, [miId, receptor_id, texto.trim()], (err, result) => {
            if(err){
                return res.status(500).json({mensaje:"Error al enviar el mensaje"})
            }
            res.json({mensaje:"Mensaje enviado", id: result.insertId})
        })

    })

}


// CONTAR MENSAJES SIN LEER (para el badge del navbar)
exports.contarSinLeer = (req, res) => {

    const sql = "SELECT COUNT(*) AS total FROM mensajes WHERE receptor_id = ? AND leido = FALSE"

    db.query(sql, [req.usuario.id], (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error"})
        }
        res.json({total: result[0].total})
    })

}
