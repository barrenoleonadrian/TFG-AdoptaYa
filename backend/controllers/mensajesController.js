// Controlador del sistema de mensajería interna.
// Una "conversación" no es una entidad propia: es simplemente todos los
// mensajes intercambiados entre dos usuarios concretos. Esto simplifica
// el modelo de datos y evita una tabla extra que no aporta nada.

const db = require("../db")


// LISTAR MIS CONVERSACIONES
// Devuelve la lista de personas con las que el usuario ha hablado.
// Para cada una incluye el último mensaje, su fecha y cuántos hay sin leer.
// Se usa para pintar el listado de chats al estilo WhatsApp.
exports.listarConversaciones = (req, res) => {

    const miId = req.usuario.id

    // La consulta hace lo siguiente:
    // 1. Subconsulta del WHERE: saca los IDs de usuarios con los que he intercambiado
    //    mensajes (a los que les escribí + los que me escribieron, sin duplicados gracias a UNION).
    // 2. Por cada uno de esos usuarios, calculamos tres datos extra mediante subconsultas:
    //    el texto del último mensaje, su fecha, y cuántos mensajes me ha mandado sin leer.
    // 3. Ordenamos por fecha del último mensaje (el más reciente arriba).
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

    // se pasa el mismo "miId" 7 veces porque hay 7 placeholders ? en la consulta
    const params = [miId, miId, miId, miId, miId, miId, miId]

    db.query(sql, params, (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }
        res.json(result)
    })

}


// OBTENER MENSAJES DE UNA CONVERSACIÓN
// Devuelve todos los mensajes intercambiados con un usuario concreto,
// ordenados de más antiguos a más recientes (para mostrarlos en el chat).
// Además, los marca todos como leídos.
exports.obtenerMensajes = (req, res) => {

    const miId = req.usuario.id
    const otroId = req.params.usuarioId

    // sacamos los mensajes en cualquiera de los dos sentidos (yo->otro y otro->yo)
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

        // marcamos como leídos los mensajes que el otro usuario me ha enviado.
        // No esperamos a que termine para responder al cliente: lanzamos
        // la actualización en paralelo para no retrasar el chat.
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

    // un usuario no puede enviarse mensajes a sí mismo
    if(parseInt(receptor_id) === miId){
        return res.status(400).json({mensaje:"No puedes enviarte mensajes a ti mismo"})
    }

    // comprobamos que el receptor exista antes de guardar nada
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


// CONTAR MENSAJES SIN LEER
// Endpoint ligero que se usa desde el navbar para mostrar el badge
// con el número de mensajes sin leer. Lo consulta el frontend cada 30 segundos.
exports.contarSinLeer = (req, res) => {

    const sql = "SELECT COUNT(*) AS total FROM mensajes WHERE receptor_id = ? AND leido = FALSE"

    db.query(sql, [req.usuario.id], (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error"})
        }
        res.json({total: result[0].total})
    })

}
