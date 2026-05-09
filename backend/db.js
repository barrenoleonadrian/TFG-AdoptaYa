// Conexión a la base de datos MySQL.
// Se exporta una única instancia que reutilizan todos los controladores,
// para no abrir una conexión nueva en cada consulta.

const mysql = require("mysql2")

const db = mysql.createConnection({
    host: "localhost",
    user: "adrian",
    password: "mysql",
    database: "adoptaya"
})

db.connect((err) => {
    if(err){
        console.log("Error conectando a la base de datos")
        return
    }
    console.log("Conectado a MySQL")
})

module.exports = db
