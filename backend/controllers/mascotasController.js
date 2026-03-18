const db = require("../db");


//  OBTENER TODAS LAS MASCOTAS (con filtros)
exports.obtenerMascotas = (req, res) => {

    let { tipo, ciudad, busqueda } = req.query

    let sql = "SELECT * FROM mascotas WHERE 1=1"
    let params = []

    if(tipo){
        sql += " AND LOWER(tipo) = LOWER(?)"
        params.push(tipo)
    }

    if(ciudad){
        sql += " AND LOWER(ciudad) = LOWER(?)"
        params.push(ciudad)
    }

    if(busqueda){
        sql += " AND (nombre LIKE ? OR raza LIKE ?)"
        params.push("%" + busqueda + "%")
        params.push("%" + busqueda + "%")
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(500).json(err)
            return
        }

        res.json(result)
    })
}


//  OBTENER UNA MASCOTA POR ID
exports.obtenerMascota = (req, res) => {

    const id = req.params.id;

    const sql = "SELECT * FROM mascotas WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).json(err);
            return;
        }

        res.json(result[0]);
    });

};


//  CREAR UNA MASCOTA
exports.crearMascota = (req, res) => {

    const { nombre, tipo, raza, edad, ciudad } = req.body;

    const sql = `
        INSERT INTO mascotas (nombre, tipo, raza, edad, ciudad)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [nombre, tipo, raza, edad, ciudad], (err, result) => {
        if (err) {
            res.status(500).json(err);
            return;
        }

        res.json({
            mensaje: "Mascota creada",
            id: result.insertId
        });
    });

};


//  ELIMINAR MASCOTA
exports.eliminarMascota = (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM mascotas WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).json(err);
            return;
        }

        res.json({
            mensaje: "Mascota eliminada"
        });
    });

};