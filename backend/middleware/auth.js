// Middlewares de autenticación y autorización.
// Se aplican antes de los controladores en las rutas privadas
// para comprobar que el usuario tiene permiso para acceder.

const jwt = require("jsonwebtoken")
const db = require("../db")

const SECRET = process.env.JWT_SECRET


// Comprueba que la petición trae un token JWT válido.
// El token se envía desde el frontend en la cabecera "Authorization".
// Si es correcto, guarda los datos del usuario (id y tipo) en req.usuario
// para que el siguiente middleware o el controlador puedan usarlos.
function verificarToken(req, res, next){

    const header = req.headers.authorization

    if(!header){
        return res.status(401).json({mensaje:"No autorizado"})
    }

    // el header viene con el formato "Bearer eyJhbG..." y nos quedamos con el token
    const token = header.replace("Bearer ", "")

    try{
        const datos = jwt.verify(token, SECRET)
        req.usuario = datos
        next()
    }catch(err){
        // si el token está caducado o manipulado, jwt.verify lanza una excepción
        return res.status(401).json({mensaje:"Token inválido"})
    }

}


// Comprueba que el usuario es admin.
// Se usa SIEMPRE después de verificarToken (necesita req.usuario ya creado).
function verificarAdmin(req, res, next){

    if(!req.usuario || req.usuario.tipo !== "admin"){
        return res.status(403).json({mensaje:"Solo el administrador puede hacer esto"})
    }

    next()

}


// Comprueba que el usuario es un refugio Y está verificado por el admin.
// La verificación se consulta en la BBDD en cada petición (no en el token),
// para que si el admin retira la verificación a un refugio activo, este
// pierda el acceso de inmediato sin tener que volver a iniciar sesión.
function verificarRefugioActivo(req, res, next){

    if(!req.usuario || req.usuario.tipo !== "protectora"){
        return res.status(403).json({mensaje:"Solo los refugios pueden hacer esto"})
    }

    db.query("SELECT verificado FROM usuarios WHERE id = ?", [req.usuario.id], (err, result) => {

        if(err || result.length === 0){
            return res.status(500).json({mensaje:"Error del servidor"})
        }

        if(!result[0].verificado){
            return res.status(403).json({mensaje:"Tu cuenta está pendiente de verificación por el administrador"})
        }

        next()
    })

}


module.exports = {verificarToken, verificarAdmin, verificarRefugioActivo, SECRET}
