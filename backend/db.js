const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "adrian",
    password: "mysql",
    database: "adoptaya"
});

db.connect((err) => {
    if (err) {
        console.log("Error conectando a la base de datos");
        return;
    }
    console.log("Conectado a MySQL");
});

module.exports = db;