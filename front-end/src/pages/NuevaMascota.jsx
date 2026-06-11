import { useState } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import Toast from "../components/Toast.jsx"

const API = import.meta.env.VITE_API_URL || ""

export default function NuevaMascota({ usuario, onLogout, navegar }) {

    const [nombre, setNombre] = useState("")
    const [tipo, setTipo] = useState("perro")
    const [raza, setRaza] = useState("")
    const [sexo, setSexo] = useState("macho")
    const [edad, setEdad] = useState("")
    const [ciudad, setCiudad] = useState("")
    const [descripcion, setDescripcion] = useState("")
    const [imagen, setImagen] = useState(null)
    const [error, setError] = useState("")

    const [toast, setToast] = useState(null)
    function mostrar(texto, tipoToast = "ok"){
        setToast({ texto, tipo: tipoToast })
    }


    async function publicar(e){

        e.preventDefault()
        setError("")

        if(!nombre || !tipo){
            setError("Nombre y tipo son obligatorios")
            return
        }

        try{
            const token = localStorage.getItem("token")

            const formData = new FormData()
            formData.append("nombre", nombre)
            formData.append("tipo", tipo)
            formData.append("raza", raza)
            formData.append("sexo", sexo)
            formData.append("edad", edad)
            formData.append("ciudad", ciudad)
            formData.append("descripcion", descripcion)
            if(imagen){ formData.append("imagen", imagen) }

            const res = await fetch(API + "/mascotas", {
                method: "POST",
                headers: { "Authorization": "Bearer " + token },
                body: formData
            })

            const data = await res.json()
            if(!res.ok){ setError(data.mensaje || "Error al publicar"); return }

            mostrar("Mascota publicada correctamente", "ok")
            navegar("adoptar")

        }catch(err){
            setError("Error de conexión con el servidor")
        }

    }


    return (
        <>
            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} />

            <main id="contenido-principal" tabIndex="-1">

                <section className="seccion" style={{paddingTop: "64px"}} aria-labelledby="nueva-mascota-titulo">
                    <div className="contenedor">

                        <header className="seccion-cabecera" style={{textAlign: "left", marginBottom: "32px", maxWidth: "100%"}}>
                            <span className="eyebrow">Refugio</span>
                            <h1 id="nueva-mascota-titulo">Publicar una mascota</h1>
                            <p>Añade los datos del animal para que las familias puedan conocerlo.</p>
                        </header>

                        <form className="form-caja" onSubmit={publicar} noValidate>

                            {error && <div className="error" role="alert">{error}</div>}

                            <div className="campos-fila">
                                <div className="campo">
                                    <label htmlFor="nm-nombre" data-required>Nombre</label>
                                    <input
                                        id="nm-nombre"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        required
                                        aria-required="true" />
                                </div>
                                <div className="campo">
                                    <label htmlFor="nm-tipo" data-required>Tipo</label>
                                    <select
                                        id="nm-tipo"
                                        value={tipo}
                                        onChange={(e) => setTipo(e.target.value)}
                                        required
                                        aria-required="true">
                                        <option value="perro">Perro</option>
                                        <option value="gato">Gato</option>
                                        <option value="conejo">Conejo</option>
                                        <option value="pajaro">Pájaro</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="campos-fila">
                                <div className="campo">
                                    <label htmlFor="nm-raza">Raza</label>
                                    <input
                                        id="nm-raza"
                                        value={raza}
                                        onChange={(e) => setRaza(e.target.value)} />
                                </div>
                                <div className="campo">
                                    <label htmlFor="nm-sexo">Sexo</label>
                                    <select
                                        id="nm-sexo"
                                        value={sexo}
                                        onChange={(e) => setSexo(e.target.value)}>
                                        <option value="macho">Macho</option>
                                        <option value="hembra">Hembra</option>
                                    </select>
                                </div>
                            </div>

                            <div className="campos-fila">
                                <div className="campo">
                                    <label htmlFor="nm-edad">Edad (años)</label>
                                    <input
                                        id="nm-edad"
                                        type="number"
                                        min="0"
                                        max="30"
                                        value={edad}
                                        onChange={(e) => setEdad(e.target.value)} />
                                </div>
                                <div className="campo">
                                    <label htmlFor="nm-ciudad">Ciudad</label>
                                    <input
                                        id="nm-ciudad"
                                        value={ciudad}
                                        onChange={(e) => setCiudad(e.target.value)}
                                        autoComplete="address-level2" />
                                </div>
                            </div>

                            <div className="campo">
                                <label htmlFor="nm-imagen">Foto de la mascota</label>
                                <input
                                    id="nm-imagen"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImagen(e.target.files[0])}
                                    aria-describedby="nm-imagen-ayuda" />
                                <small id="nm-imagen-ayuda" className="campo-ayuda">
                                    Formatos admitidos: JPG, PNG o WEBP. Máximo 5 MB.
                                </small>
                            </div>

                            <div className="campo">
                                <label htmlFor="nm-descripcion">Descripción</label>
                                <textarea
                                    id="nm-descripcion"
                                    rows="4"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Cuéntanos sobre su carácter, sus cuidados..." />
                            </div>

                            <button type="submit" className="btn btn-primario btn-ancho btn-grande">
                                Publicar mascota
                            </button>

                        </form>

                    </div>
                </section>

            </main>

            <Footer navegar={navegar} />

            {toast && (
                <Toast
                    mensaje={toast.texto}
                    tipo={toast.tipo}
                    onCerrar={() => setToast(null)}
                />
            )}
        </>
    )
}