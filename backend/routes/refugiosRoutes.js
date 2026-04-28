const express = require("express")
const multer = require("multer")
const path = require("path")

const router = express.Router()
const refugiosController = require("../controllers/refugiosController")
const {verificarToken} = require("../middleware/auth")


// configuración de multer (igual que en mascotas, para guardar imágenes en backend/img)
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "img/") },
    filename: (req, file, cb) => { cb(null, Date.now() + "-" + file.originalname) }
})

const fileFilter = (req, file, cb) => {
    const ok = [".jpg", ".jpeg", ".png", ".webp"]
    const ext = path.extname(file.originalname).toLowerCase()
    if(ok.includes(ext)){
        cb(null, true)
    }else{
        cb(new Error("Solo se permiten imágenes"))
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 5 * 1024 * 1024}
})


// rutas públicas
router.get("/refugios", refugiosController.listarRefugios)
router.get("/refugios/:id", refugiosController.obtenerRefugio)

// rutas privadas (solo el refugio logueado)
router.get("/mi-refugio", verificarToken, refugiosController.miRefugio)
router.post("/mi-refugio", verificarToken, upload.single("imagen"), refugiosController.guardarMiRefugio)

module.exports = router
