// Script que actualiza la contraseña del admin dejándola hasheada.
//
// Tu BBDD tiene el admin con password = "1234" en texto plano.
// Como ahora usamos bcrypt, hay que pasarla a hash o no podrás entrar.
//
// Ejecutar UNA sola vez:
//     npm run seed-admin
//
// Después, el login del admin seguirá siendo:
//     email:    admin@adoptaya.com
//     password: 1234

const bcrypt = require("bcryptjs")
const db = require("./db")

const email = "admin@adoptaya.com"
const passwordOriginal = "1234"

const hash = bcrypt.hashSync(passwordOriginal, 10)

const sql = "UPDATE usuarios SET password = ? WHERE email = ?"

db.query(sql, [hash, email], (err, result) => {

    if(err){
        console.log("Error:", err)
        process.exit(1)
    }

    if(result.affectedRows === 0){
        console.log("⚠  No se encontró el admin. Asegúrate de haber importado adoptaya.sql")
    }else{
        console.log("✅ Contraseña del admin hasheada correctamente")
        console.log("   Email:    " + email)
        console.log("   Password: " + passwordOriginal)
    }

    process.exit(0)

})
