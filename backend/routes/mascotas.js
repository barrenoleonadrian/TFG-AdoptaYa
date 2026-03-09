const express = require("express");
const router = express.Router();

const mascotasController = require("../controllers/mascotasController");

router.get("/", mascotasController.obtenerMascotas);

router.get("/:id", mascotasController.obtenerMascota);

router.post("/", mascotasController.crearMascota);

router.delete("/:id", mascotasController.eliminarMascota);

module.exports = router;