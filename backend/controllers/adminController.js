const db = require("../db")


// ====== USUARIOS ======

// Listar todos los usuarios
exports.listarUsuarios = (req, res) => {

    const sql = "SELECT id, nombre, email, tipo, telefono, ciudad, fecha_registro FROM usuarios ORDER BY id DESC"

    db.query(sql, (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }
        res.json(result)
    })

}


// Cambiar el rol de un usuario
exports.cambiarRolUsuario = (req, res) => {

    const id = req.params.id
    const {tipo} = req.body

    // solo permitimos estos 3 tipos
    if(tipo !== "adoptante" && tipo !== "protectora" && tipo !== "admin"){
        return res.status(400).json({mensaje:"Rol no válido"})
    }

    // no se puede cambiar a uno mismo (así evitamos quedarnos sin admin)
    if(parseInt(id) === req.usuario.id){
        return res.status(400).json({mensaje:"No puedes cambiar tu propio rol"})
    }

    const sql = "UPDATE usuarios SET tipo = ? WHERE id = ?"

    db.query(sql, [tipo, id], (err) => {
        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }
        res.json({mensaje:"Rol actualizado"})
    })

}


// Eliminar usuario
exports.eliminarUsuario = (req, res) => {

    const id = req.params.id

    // un admin no puede borrarse a sí mismo
    if(parseInt(id) === req.usuario.id){
        return res.status(400).json({mensaje:"No puedes eliminarte a ti mismo"})
    }

    const sql = "DELETE FROM usuarios WHERE id = ?"

    db.query(sql, [id], (err) => {
        if(err){
            // si hay mascotas o solicitudes ligadas, MySQL dará error por la foreign key
            return res.status(500).json({mensaje:"No se puede borrar: el usuario tiene mascotas o solicitudes asociadas"})
        }
        res.json({mensaje:"Usuario eliminado"})
    })

}


// ====== MASCOTAS ======

// Listar todas las mascotas (con info del refugio que las publicó)
exports.listarMascotas = (req, res) => {

    const sql = `
        SELECT m.*, u.nombre AS refugio_nombre
        FROM mascotas m
        LEFT JOIN usuarios u ON u.id = m.usuario_id
        ORDER BY m.id DESC
    `

    db.query(sql, (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }
        res.json(result)
    })

}


// Eliminar mascota
exports.eliminarMascota = (req, res) => {

    const id = req.params.id
    const sql = "DELETE FROM mascotas WHERE id = ?"

    db.query(sql, [id], (err) => {
        if(err){
            return res.status(500).json({mensaje:"No se puede borrar: la mascota tiene solicitudes asociadas"})
        }
        res.json({mensaje:"Mascota eliminada"})
    })

}


// ====== SOLICITUDES DE ADOPCIÓN ======

// Listar todas las solicitudes (con datos del usuario y la mascota)
exports.listarSolicitudes = (req, res) => {

    const sql = `
        SELECT
            s.id, s.estado, s.fecha, s.mensaje,
            u.nombre AS usuario_nombre, u.email AS usuario_email,
            m.nombre AS mascota_nombre, m.id AS mascota_id
        FROM solicitudes_adopcion s
        LEFT JOIN usuarios u ON u.id = s.usuario_id
        LEFT JOIN mascotas m ON m.id = s.mascota_id
        ORDER BY s.fecha DESC
    `

    db.query(sql, (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }
        res.json(result)
    })

}


// Cambiar estado de una solicitud (aceptada o rechazada)
exports.cambiarEstadoSolicitud = (req, res) => {

    const id = req.params.id
    const {estado} = req.body

    if(estado !== "pendiente" && estado !== "aceptada" && estado !== "rechazada"){
        return res.status(400).json({mensaje:"Estado no válido"})
    }

    const sql = "UPDATE solicitudes_adopcion SET estado = ? WHERE id = ?"

    db.query(sql, [estado, id], (err) => {
        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }

        // si la solicitud se acepta, marcamos la mascota como adoptada
        if(estado === "aceptada"){
            const sqlMascota = `
                UPDATE mascotas m
                JOIN solicitudes_adopcion s ON s.mascota_id = m.id
                SET m.estado = 'adoptado'
                WHERE s.id = ?
            `
            db.query(sqlMascota, [id], () => {
                res.json({mensaje:"Solicitud aceptada y mascota marcada como adoptada"})
            })
        }else{
            res.json({mensaje:"Estado actualizado"})
        }

    })

}
