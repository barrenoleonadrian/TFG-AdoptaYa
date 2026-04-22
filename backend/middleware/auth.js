const jwt = require("jsonwebtoken")

const SECRET = "adoptaya_secret"


// Comprueba que la petición trae un token válido
function verificarToken(req, res, next){

    const header = req.headers.authorization

    if(!header){
        return res.status(401).json({mensaje:"No autorizado"})
    }

    const token = header.replace("Bearer ", "")

    try{
        const datos = jwt.verify(token, SECRET)
        req.usuario = datos
        next()
    }catch(err){
        return res.status(401).json({mensaje:"Token inválido"})
    }

}


// Comprueba que el usuario es admin.
// Se usa SIEMPRE después de verificarToken.
function verificarAdmin(req, res, next){

    if(!req.usuario || req.usuario.tipo !== "admin"){
        return res.status(403).json({mensaje:"Solo el administrador puede hacer esto"})
    }

    next()

}


module.exports = {verificarToken, verificarAdmin, SECRET}
