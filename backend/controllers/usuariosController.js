// Controlador de usuarios: gestiona el login y el registro.
// Aquí se hashean las contraseñas con bcrypt y se generan los tokens JWT
// que el frontend usará para autenticarse en las peticiones siguientes.

const db = require("../db")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const {SECRET} = require("../middleware/auth")


// LOGIN
// Comprueba el email/contraseña y, si todo está bien, devuelve un token JWT
// que el frontend guardará en localStorage. Los refugios sin verificar
// no pueden iniciar sesión.
exports.login = (req, res) => {

    const {email, password} = req.body

    // buscamos el usuario solo por email; la contraseña se comprueba después
    const sql = "SELECT * FROM usuarios WHERE email = ?"

    db.query(sql, [email], (err, result) => {

        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }

        // mensaje genérico cuando el email no existe (por seguridad,
        // no decimos si falló el email o la contraseña)
        if(result.length === 0){
            return res.status(401).json({mensaje:"Email o contraseña incorrectos"})
        }

        const usuario = result[0]

        // comparamos la contraseña escrita con el hash guardado.
        // bcrypt usa un algoritmo que es lento a propósito, para dificultar
        // los ataques por fuerza bruta.
        const valido = bcrypt.compareSync(password, usuario.password)

        if(!valido){
            return res.status(401).json({mensaje:"Email o contraseña incorrectos"})
        }

        // los refugios sin verificar no pueden entrar hasta que el admin los apruebe
        if(usuario.tipo === "protectora" && !usuario.verificado){
            return res.status(403).json({
                mensaje: "Tu cuenta está pendiente de verificación. Te avisaremos cuando el administrador la apruebe."
            })
        }

        // generamos el token con id y tipo del usuario, válido durante 7 días
        const token = jwt.sign(
            {id: usuario.id, tipo: usuario.tipo},
            SECRET,
            {expiresIn: "7d"}
        )

        res.json({
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                tipo: usuario.tipo,
                verificado: usuario.verificado ? true : false
            }
        })

    })

}


// REGISTER
// Crea una cuenta nueva. Hay dos flujos distintos según el tipo de usuario:
//   - Adoptantes: se crean ya verificados y reciben un token (login automático).
//   - Refugios: se crean en estado "pendiente" y NO reciben token; tienen que
//     esperar a que el administrador les verifique manualmente.
exports.register = (req, res) => {

    const {nombre, email, password, tipo, telefono, ciudad, cif} = req.body

    if(!nombre || !email || !password){
        return res.status(400).json({mensaje:"Faltan datos"})
    }

    if(tipo !== "adoptante" && tipo !== "protectora"){
        return res.status(400).json({mensaje:"Tipo de usuario no válido"})
    }

    // los refugios deben aportar su CIF para que el admin pueda verificarlos
    if(tipo === "protectora" && !cif){
        return res.status(400).json({mensaje:"El CIF es obligatorio para refugios"})
    }

    // los adoptantes nacen verificados; los refugios necesitan aprobación
    const verificado = tipo === "adoptante"

    // comprobamos que el email no esté ya registrado
    const checkSql = "SELECT id FROM usuarios WHERE email = ?"

    db.query(checkSql, [email], (err, result) => {

        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }

        if(result.length > 0){
            return res.status(400).json({mensaje:"El email ya está registrado"})
        }

        // hasheamos la contraseña antes de guardarla.
        // el 10 es el número de rondas: más alto = más seguro pero más lento.
        const hash = bcrypt.hashSync(password, 10)

        const sql = `
            INSERT INTO usuarios (nombre, email, password, tipo, cif, verificado, telefono, ciudad)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `

        db.query(sql, [nombre, email, hash, tipo, cif || null, verificado, telefono, ciudad], (err, result) => {

            if(err){
                return res.status(500).json({mensaje:"Error del servidor"})
            }

            // si es un refugio, no le iniciamos sesión: tiene que esperar al admin
            if(tipo === "protectora"){
                return res.json({
                    pendiente: true,
                    mensaje: "Hemos recibido tu solicitud. Te avisaremos cuando el administrador verifique tu refugio."
                })
            }

            // login automático para adoptantes (les damos el token directamente)
            const token = jwt.sign(
                {id: result.insertId, tipo: tipo},
                SECRET,
                {expiresIn: "7d"}
            )

            res.json({
                token: token,
                usuario: {
                    id: result.insertId,
                    nombre: nombre,
                    email: email,
                    tipo: tipo,
                    verificado: true
                }
            })

        })

    })

}
