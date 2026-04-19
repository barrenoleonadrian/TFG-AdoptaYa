const db = require("../db")

exports.login = (req,res)=>{

    const {email,password} = req.body

    const sql = "SELECT * FROM usuarios WHERE email=? AND password=?"

    db.query(sql,[email,password],(err,result)=>{

        if(err){
            res.status(500).json(err)
            return
        }

        if(result.length === 0){
            res.json({mensaje:"Usuario incorrecto"})
            return
        }

        res.json(result[0])

    })
}


// REGISTER
exports.register = (req,res)=>{

    const {nombre,email,password,tipo,telefono,ciudad} = req.body

    // comprobar si ya existe email
    const checkSql = "SELECT * FROM usuarios WHERE email=?"

    db.query(checkSql,[email],(err,result)=>{

        if(result.length > 0){
            res.json({mensaje:"El email ya existe"})
            return
        }

        const sql = `
        INSERT INTO usuarios (nombre,email,password,tipo,telefono,ciudad)
        VALUES (?,?,?,?,?,?)
        `

        db.query(sql,[nombre,email,password,tipo,telefono,ciudad],(err,result)=>{

            if(err){
                res.status(500).json(err)
                return
            }

            res.json({mensaje:"Usuario registrado"})

        })

    })

}