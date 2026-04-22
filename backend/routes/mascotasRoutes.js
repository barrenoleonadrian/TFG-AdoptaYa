const express = require("express")
const multer = require("multer")
const path = require("path")

const router = express.Router()
const mascotasController = require("../controllers/mascotasController")
const {verificarToken} = require("../middleware/auth")


// ====== CONFIGURACIÓN DE MULTER ======
// Multer es la librería que procesa los archivos que llegan del navegador
// cuando se envía un formulario con una imagen.

const storage = multer.diskStorage({

    // carpeta donde se guardan las imágenes subidas
    destination: (req, file, cb) => {
        cb(null, "img/")
    },

    // nombre del archivo guardado.
    // le ponemos la fecha actual delante para que no se repitan:
    //    1729598412345-perro.jpg
    filename: (req, file, cb) => {
        const nombreUnico = Date.now() + "-" + file.originalname
        cb(null, nombreUnico)
    }

})


// solo permitimos imágenes (jpg, jpeg, png, webp)
const fileFilter = (req, file, cb) => {

    const extensionesOk = [".jpg", ".jpeg", ".png", ".webp"]
    const ext = path.extname(file.originalname).toLowerCase()

    if(extensionesOk.includes(ext)){
        cb(null, true)
    }else{
        cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"))
    }

}


const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 5 * 1024 * 1024}   // máximo 5 MB por imagen
})


// ====== RUTAS ======

// públicas
router.get("/mascotas", mascotasController.obtenerMascotas)
router.get("/mascotas/:id", mascotasController.obtenerMascota)

// crear mascota: requiere token + procesar imagen con multer.
// upload.single("imagen") lee el campo "imagen" del FormData y lo guarda.
router.post(
    "/mascotas",
    verificarToken,
    upload.single("imagen"),
    mascotasController.crearMascota
)

// adoptar: solo token
router.post("/mascotas/:id/adoptar", verificarToken, mascotasController.adoptar)


module.exports = router
