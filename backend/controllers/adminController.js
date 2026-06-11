const db = require("../db")


// ====== USUARIOS ======

// Listar todos los usuarios. Para los refugios traemos también el CIF
// haciendo LEFT JOIN con la tabla `refugios`. Los adoptantes y admins
// no tienen fila en `refugios`, por eso es LEFT JOIN (cif = NULL para ellos).
exports.listarUsuarios = (req, res) => {

    const sql = `
        SELECT
            u.id, u.nombre, u.email, u.tipo, u.verificado,
            u.telefono, u.ciudad, u.fecha_registro,
            r.cif
        FROM usuarios u
        LEFT JOIN refugios r ON r.usuario_id = u.id
        ORDER BY u.id DESC
    `

    db.query(sql, (err, result) => {
        if(err){
            console.log("ERROR SQL listarUsuarios:", err)
            return res.status(500).json({mensaje:"Error del servidor"})
        }
        res.json(result)
    })

}


// Verificar un refugio (cambiar verificado a true)
exports.verificarRefugio = (req, res) => {

    const id = req.params.id

    const sql = "UPDATE usuarios SET verificado = TRUE WHERE id = ? AND tipo = 'protectora'"

    db.query(sql, [id], (err, result) => {
        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }
        if(result.affectedRows === 0){
            return res.status(404).json({mensaje:"Refugio no encontrado"})
        }
        res.json({mensaje:"Refugio verificado"})
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


// Eliminar usuario.
// Las claves foráneas con ON DELETE CASCADE se encargan de borrar también
// sus mascotas, solicitudes, mensajes y fila de refugio (si la tuviera).
exports.eliminarUsuario = (req, res) => {

    const id = req.params.id

    // un admin no puede borrarse a sí mismo
    if(parseInt(id) === req.usuario.id){
        return res.status(400).json({mensaje:"No puedes eliminarte a ti mismo"})
    }

    const sql = "DELETE FROM usuarios WHERE id = ?"

    db.query(sql, [id], (err) => {
        if(err){
            console.log("ERROR SQL eliminarUsuario:", err)
            return res.status(500).json({mensaje:"Error al eliminar el usuario"})
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
            return res.status(500).json({mensaje:"No se puede borrar la mascota"})
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