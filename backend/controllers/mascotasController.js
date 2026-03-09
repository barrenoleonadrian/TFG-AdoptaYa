const db = require("../db");


exports.obtenerMascotas = (req, res) => {

    const sql = "SELECT * FROM mascotas";

    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json(err);
            return;
        }

        res.json(result);
    });

};


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