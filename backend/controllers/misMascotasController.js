// Controlador de la zona privada de los refugios.
// Aquí van las funciones que usa la página "Mis mascotas":
// listar las mascotas del refugio, cambiar su estado, y gestionar
// las solicitudes de adopción que ha recibido.
//
// Todas las funciones requieren que el usuario logueado sea de tipo "protectora",
// y todas las rutas asociadas pasan antes por el middleware "verificarRefugioActivo"
// que comprueba además que el refugio esté verificado por el admin.

const db = require("../db")


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

    // validamos que el estado sea uno de los permitidos
    const estadosValidos = ["disponible", "pendiente", "adoptado"]
    if(!estadosValidos.includes(estado)){
        return res.status(400).json({mensaje: "Estado no válido"})
    }

    // primero comprobamos que la mascota es del refugio que está logueado
    // (para que un refugio no pueda cambiar mascotas de otro)
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

        // si todo bien, actualizamos el estado
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
// Cuando una solicitud se aprueba pasan tres cosas en cadena:
//   1. La solicitud queda como "aprobada"
//   2. La mascota pasa a estado "reservada"
//   3. Las demás solicitudes pendientes/en revisión de esa mascota se rechazan automáticamente
exports.cambiarEstadoSolicitud = (req, res) => {

    if(!comprobarRefugio(req, res)) return

    const id = req.params.id
    const {estado} = req.body

    if(!["en_revision", "aprobada", "rechazada"].includes(estado)){
        return res.status(400).json({mensaje: "Estado no válido"})
    }

    // primero comprobamos que la solicitud es para una mascota del refugio
    const checkSql = `
        SELECT m.usuario_id, s.mascota_id
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

        if(result[0].usuario_id !== req.usuario.id){
            return res.status(403).json({mensaje: "Esta solicitud no es tuya"})
        }

        const mascotaId = result[0].mascota_id

        // actualizamos el estado de la solicitud
        const sql = "UPDATE solicitudes_adopcion SET estado = ? WHERE id = ?"

        db.query(sql, [estado, id], (err) => {

            if(err){
                console.log("ERROR SQL en cambiarEstadoSolicitud (update):", err)
                return res.status(500).json({mensaje: "Error al actualizar"})
            }

            // CASO 1: si se aprueba la solicitud
            // → la mascota pasa a "reservada"
            // → las demás solicitudes activas se rechazan automáticamente
            if(estado === "aprobada"){

                const updateMascota = "UPDATE mascotas SET estado = 'reservada' WHERE id = ?"

                db.query(updateMascota, [mascotaId], (err) => {

                    if(err){
                        console.log("ERROR SQL al reservar mascota:", err)
                        return res.status(500).json({mensaje: "Error al actualizar la mascota"})
                    }

                    // rechazamos las demás solicitudes pendientes o en revisión de esa mascota
                    // (las que no son la que acabamos de aprobar)
                    const rechazarOtras = `
                        UPDATE solicitudes_adopcion
                        SET estado = 'rechazada'
                        WHERE mascota_id = ? AND id != ? AND estado IN ('pendiente', 'en_revision')
                    `

                    db.query(rechazarOtras, [mascotaId, id], () => {
                        res.json({mensaje: "Solicitud aprobada. Mascota reservada y otras solicitudes rechazadas."})
                    })

                })

            }
            // CASO 2: si se rechaza una solicitud que estaba aprobada
            // → la mascota vuelve a "disponible" (siempre que no haya otra solicitud aprobada activa)
            // así otra persona puede volver a pedir la adopción.
            else if(estado === "rechazada"){

                // miramos si queda alguna otra solicitud aprobada para esta mascota
                const checkAprobadas = `
                    SELECT COUNT(*) AS total FROM solicitudes_adopcion
                    WHERE mascota_id = ? AND estado = 'aprobada' AND id != ?
                `

                db.query(checkAprobadas, [mascotaId, id], (err, result) => {

                    if(err){
                        console.log("ERROR SQL al comprobar aprobadas:", err)
                        return res.json({mensaje: "Solicitud rechazada"})
                    }

                    // si NO quedan otras aprobadas: ponemos la mascota como disponible.
                    // (sólo afecta si la mascota estaba reservada o pendiente; si ya estaba
                    // disponible, este UPDATE no cambia nada).
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
            // CASO 3: si pasa a "en_revision", no hay que tocar la mascota
            else {
                res.json({mensaje: "Estado actualizado"})
            }

        })

    })

}


// MARCAR MASCOTA COMO ADOPTADA (paso final)
// Solo se puede llamar cuando la mascota está "reservada".
// Esto refleja el momento real de entrega del animal al adoptante.
exports.marcarAdoptada = (req, res) => {

    if(!comprobarRefugio(req, res)) return

    const id = req.params.id

    // comprobamos que la mascota es del refugio Y está reservada
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
