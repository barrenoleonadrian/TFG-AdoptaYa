const db = require("../db")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const {SECRET} = require("../middleware/auth")


// LOGIN
exports.login = (req, res) => {

    const {email, password} = req.body

    // buscamos el usuario solo por email (la contraseña se comprueba después)
    const sql = "SELECT * FROM usuarios WHERE email = ?"

    db.query(sql, [email], (err, result) => {

        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }

        if(result.length === 0){
            return res.status(401).json({mensaje:"Email o contraseña incorrectos"})
        }

        const usuario = result[0]

        // comparamos la contraseña escrita con el hash guardado en la BBDD
        const valido = bcrypt.compareSync(password, usuario.password)

        if(!valido){
            return res.status(401).json({mensaje:"Email o contraseña incorrectos"})
        }

        // si coincide, generamos el token
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
                tipo: usuario.tipo
            }
        })

    })

}


// REGISTER
exports.register = (req, res) => {

    const {nombre, email, password, tipo, telefono, ciudad} = req.body

    if(!nombre || !email || !password){
        return res.status(400).json({mensaje:"Faltan datos"})
    }

    if(tipo !== "adoptante" && tipo !== "protectora"){
        return res.status(400).json({mensaje:"Tipo de usuario no válido"})
    }

    // comprobamos que el email no exista
    const checkSql = "SELECT id FROM usuarios WHERE email = ?"

    db.query(checkSql, [email], (err, result) => {

        if(err){
            return res.status(500).json({mensaje:"Error del servidor"})
        }

        if(result.length > 0){
            return res.status(400).json({mensaje:"El email ya está registrado"})
        }

        // hasheamos la contraseña antes de guardarla.
        // el 10 es el número de rondas: cuanto más alto más seguro pero más lento.
        const hash = bcrypt.hashSync(password, 10)

        const sql = `
            INSERT INTO usuarios (nombre, email, password, tipo, telefono, ciudad)
            VALUES (?, ?, ?, ?, ?, ?)
        `

        db.query(sql, [nombre, email, hash, tipo, telefono, ciudad], (err, result) => {

            if(err){
                return res.status(500).json({mensaje:"Error del servidor"})
            }

            // login automático al registrarse
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
                    tipo: tipo
                }
            })

        })

    })

}
