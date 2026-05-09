// Controlador para la página "Mis solicitudes" del adoptante.
// Devuelve las solicitudes que ha enviado el usuario logueado, con datos
// de la mascota y el estado actual.

const db = require("../db")


// LISTAR MIS SOLICITUDES (vista del adoptante)
exports.misSolicitudesAdoptante = (req, res) => {

    if(req.usuario.tipo !== "adoptante"){
        return res.status(403).json({mensaje: "Solo los adoptantes pueden ver esto"})
    }

    // sacamos cada solicitud con datos básicos de la mascota asociada
    const sql = `
        SELECT s.id, s.estado, s.fecha,
               m.id AS mascota_id, m.nombre AS mascota_nombre, m.imagen AS mascota_imagen,
               m.tipo AS mascota_tipo, m.ciudad AS mascota_ciudad
        FROM solicitudes_adopcion s
        JOIN mascotas m ON m.id = s.mascota_id
        WHERE s.usuario_id = ?
        ORDER BY s.fecha DESC
    `

    db.query(sql, [req.usuario.id], (err, result) => {
        if(err){
            console.log("ERROR SQL en misSolicitudesAdoptante:", err)
            return res.status(500).json({mensaje: "Error del servidor"})
        }
        res.json(result)
    })

}
