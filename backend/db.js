// Conexión a la base de datos MySQL usando POOL.
// Un pool gestiona automáticamente las conexiones: si alguna se cae,
// abre otra nueva sin que tengamos que reconectarnos a mano.
// Esto es necesario en producción (especialmente con Docker) porque
// MySQL puede tardar unos segundos en aceptar conexiones al arrancar,
// y porque las conexiones inactivas pueden cerrarse por timeout.

const mysql = require("mysql2")

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "adrian",
    password: process.env.DB_PASSWORD || "mysql",
    database: process.env.DB_NAME || "adoptaya",

    // máximo de conexiones simultáneas en el pool
    connectionLimit: 10,

    // si todas están ocupadas, las siguientes peticiones esperan
    waitForConnections: true,
    queueLimit: 0
})

// hacemos una conexión de prueba al arrancar para verificar que va
pool.getConnection((err, connection) => {
    if(err){
        console.log("Error conectando a la base de datos:", err.message)
        return
    }
    console.log("Conectado a MySQL")
    connection.release()
})

module.exports = pool