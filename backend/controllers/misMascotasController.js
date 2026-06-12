// Controlador de la zona privada de los refugios.
// Aquí van las funciones que usa la página "Mis mascotas":
// listar las mascotas del refugio, cambiar su estado, y gestionar
// las solicitudes de adopción que ha recibido.
//
// Todas las funciones requieren que el usuario logueado sea de tipo "protectora".

const db = require("../db")
const notificacionesService = require("../services/notificacionesService")


// función auxiliar: comprobar que el usuario es refugio
function comprobarRefugio(req, res){
    if(req.usuario.tipo !== "protectora"){
        res.status(403).json({mensaje: "Solo los refugios pueden hacer esto"})
        return false
    }
    return true
}


// LISTAR MIS MASCOTAS
exports.misMascotas = (req, res) => {

    if(!comprobarRefugio(req, res)) return

    const sql = "SELECT * FROM mascotas WHERE usuario_id = ? ORDER BY id DESC"

    db.query(sql, [req.usuario.id], (err, result) => {
        if(err){
            console.log("ERROR SQL en misMascotas:", err)
            return res.status(500).json({mensaje: "Error del servidor"})
        }
        res.json(result)
    })

}


// CAMBIAR EL ESTADO DE UNA MASCOTA (disponible / pendiente / adoptado)
exports.cambiarEstadoMascota = (req, res) => {

    if(!comprobarRefugio(req, res)) return

    const id = req.params.id
    const {estado} = req.body

    const estadosValidos = ["disponible", "pendiente", "adoptado"]
    if(!estadosValidos.includes(estado)){
        return res.status(400).json({mensaje: "Estado no válido"})
    }

    const checkSql = "SELECT usuario_id FROM mascotas WHERE id = ?"

    db.query(checkSql, [id], (err, result) => {

        if(err){
            console.log("ERROR SQL en cambiarEstadoMascota (check):", err)
            return res.status(500).json({mensaje: "Error del servidor"})
        }

        if(result.length === 0){
            return res.status(404).json({mensaje: "Mascota no encontrada"})
        }

        if(result[0].usuario_id !== req.usuario.id){
            return res.status(403).json({mensaje: "Esta mascota no es tuya"})
        }

        const sql = "UPDATE mascotas SET estado = ? WHERE id = ?"

        db.query(sql, [estado, id], (err) => {
            if(err){
                console.log("ERROR SQL en cambiarEstadoMascota (update):", err)
                return res.status(500).json({mensaje: "Error al actualizar"})
            }
            res.json({mensaje: "Estado actualizado"})
        })

    })

}


// LISTAR LAS SOLICITUDES RECIBIDAS EN MIS MASCOTAS
exports.misSolicitudes = (req, res) => {

    if(!comprobarRefugio(req, res)) return

    const sql = `
        SELECT s.*, u.nombre AS usuario_nombre, u.email AS usuario_email,
               m.nombre AS mascota_nombre
        FROM solicitudes_adopcion s
        JOIN usuarios u ON u.id = s.usuario_id
        JOIN mascotas m ON m.id = s.mascota_id
        WHERE m.usuario_id = ?
        ORDER BY s.fecha DESC
    `

    db.query(sql, [req.usuario.id], (err, result) => {
        if(err){
            console.log("ERROR SQL en misSolicitudes:", err)
            return res.status(500).json({mensaje: "Error del servidor"})
        }
        res.json(result)
    })

}


// CAMBIAR ESTADO DE UNA SOLICITUD
// Estados posibles: "en_revision", "aprobada", "rechazada"
// Cuando una solicitud se aprueba:
//   1. La solicitud queda como "aprobada"
//   2. La mascota pasa a estado "reservada"
//   3. Las demás solicitudes pendientes/en revisión de esa mascota se rechazan automáticamente
//   4. Se crean notificaciones para los adoptantes afectados
exports.cambiarEstadoSolicitud = (req, res) => {

    if(!comprobarRefugio(req, res)) return

    const id = req.params.id
    const {estado} = req.body

    if(!["en_revision", "aprobada", "rechazada"].includes(estado)){
        return res.status(400).json({mensaje: "Estado no válido"})
    }

    // primero recogemos información completa: refugio dueño, mascota, adoptante
    // y nombre de la mascota (para el texto de la notificación)
    const checkSql = `
        SELECT m.usuario_id AS refugio_id, s.mascota_id, s.usuario_id AS adoptante_id,
               m.nombre AS mascota_nombre
        FROM solicitudes_adopcion s
        JOIN mascotas m ON m.id = s.mascota_id
        WHERE s.id = ?
    `

    db.query(checkSql, [id], (err, result) => {

        if(err){
            console.log("ERROR SQL en cambiarEstadoSolicitud (check):", err)
            return res.status(500).json({mensaje: "Error del servidor"})
        }

        if(result.length === 0){
            return res.status(404).json({mensaje: "Solicitud no encontrada"})
        }

        if(result[0].refugio_id !== req.usuario.id){
            return res.status(403).json({mensaje: "Esta solicitud no es tuya"})
        }

        const mascotaId = result[0].mascota_id
        const adoptanteId = result[0].adoptante_id
        const mascotaNombre = result[0].mascota_nombre

        // actualizamos el estado de la solicitud
        const sql = "UPDATE solicitudes_adopcion SET estado = ? WHERE id = ?"

        db.query(sql, [estado, id], (err) => {

            if(err){
                console.log("ERROR SQL en cambiarEstadoSolicitud (update):", err)
                return res.status(500).json({mensaje: "Error al actualizar"})
            }

            // CASO 1: solicitud aprobada
            if(estado === "aprobada"){

                // notificamos al adoptante que su solicitud ha sido aprobada
                notificacionesService.crear(
                    adoptanteId,
                    "solicitud_aprobada",
                    `¡Tu solicitud para adoptar a ${mascotaNombre} ha sido aprobada!`,
                    "mis-solicitudes"
                )

                const updateMascota = "UPDATE mascotas SET estado = 'reservada' WHERE id = ?"

                db.query(updateMascota, [mascotaId], (err) => {

                    if(err){
                        console.log("ERROR SQL al reservar mascota:", err)
                        return res.status(500).json({mensaje: "Error al actualizar la mascota"})
                    }

                    // antes de rechazar las demás solicitudes, recogemos los ids
                    // de los adoptantes afectados para notificarlos.
                    const buscarAfectados = `
                        SELECT usuario_id FROM solicitudes_adopcion
                        WHERE mascota_id = ? AND id != ? AND estado IN ('pendiente', 'en_revision')
                    `

                    db.query(buscarAfectados, [mascotaId, id], (err, afectados) => {

                        // si falla la consulta, seguimos sin notificar a los otros
                        // (no es crítico para el flujo principal)
                        const idsAfectados = err ? [] : afectados.map(a => a.usuario_id)

                        // ahora sí rechazamos las demás solicitudes activas
                        const rechazarOtras = `
                            UPDATE solicitudes_adopcion
                            SET estado = 'rechazada'
                            WHERE mascota_id = ? AND id != ? AND estado IN ('pendiente', 'en_revision')
                        `

                        db.query(rechazarOtras, [mascotaId, id], () => {

                            // notificamos a cada uno de los rechazados automáticamente
                            for(const otroId of idsAfectados){
                                notificacionesService.crear(
                                    otroId,
                                    "solicitud_rechazada",
                                    `Tu solicitud para adoptar a ${mascotaNombre} ha sido rechazada.`,
                                    "mis-solicitudes"
                                )
                            }

                            res.json({mensaje: "Solicitud aprobada. Mascota reservada y otras solicitudes rechazadas."})

                        })

                    })

                })

            }
            // CASO 2: solicitud rechazada
            else if(estado === "rechazada"){

                // notificamos al adoptante del rechazo
                notificacionesService.crear(
                    adoptanteId,
                    "solicitud_rechazada",
                    `Tu solicitud para adoptar a ${mascotaNombre} ha sido rechazada.`,
                    "mis-solicitudes"
                )

                const checkAprobadas = `
                    SELECT COUNT(*) AS total FROM solicitudes_adopcion
                    WHERE mascota_id = ? AND estado = 'aprobada' AND id != ?
                `

                db.query(checkAprobadas, [mascotaId, id], (err, result) => {

                    if(err){
                        console.log("ERROR SQL al comprobar aprobadas:", err)
                        return res.json({mensaje: "Solicitud rechazada"})
                    }

                    if(result[0].total === 0){
                        const liberarMascota = `
                            UPDATE mascotas SET estado = 'disponible'
                            WHERE id = ? AND estado IN ('reservada', 'pendiente')
                        `
                        db.query(liberarMascota, [mascotaId], () => {
                            res.json({mensaje: "Solicitud rechazada. La mascota vuelve a estar disponible."})
                        })
                    }else{
                        res.json({mensaje: "Solicitud rechazada"})
                    }

                })

            }
            // CASO 3: en_revision, no hay que notificar nada
            else {
                res.json({mensaje: "Estado actualizado"})
            }

        })

    })

}


// MARCAR MASCOTA COMO ADOPTADA (paso final)
exports.marcarAdoptada = (req, res) => {

    if(!comprobarRefugio(req, res)) return

    const id = req.params.id

    const checkSql = "SELECT usuario_id, estado FROM mascotas WHERE id = ?"

    db.query(checkSql, [id], (err, result) => {

        if(err){
            console.log("ERROR SQL en marcarAdoptada (check):", err)
            return res.status(500).json({mensaje: "Error del servidor"})
        }

        if(result.length === 0){
            return res.status(404).json({mensaje: "Mascota no encontrada"})
        }

        if(result[0].usuario_id !== req.usuario.id){
            return res.status(403).json({mensaje: "Esta mascota no es tuya"})
        }

        if(result[0].estado !== "reservada"){
            return res.status(400).json({mensaje: "La mascota debe estar reservada antes de marcarse como adoptada"})
        }

        const sql = "UPDATE mascotas SET estado = 'adoptado' WHERE id = ?"

        db.query(sql, [id], (err) => {
            if(err){
                console.log("ERROR SQL en marcarAdoptada:", err)
                return res.status(500).json({mensaje: "Error al actualizar"})
            }
            res.json({mensaje: "Mascota marcada como adoptada"})
        })

    })

}