import { useState } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"

const API = "http://localhost:3000"

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


    async function publicar(){

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

            alert("Mascota publicada correctamente")
            navegar("adoptar")

        }catch(err){
            setError("Error de conexión con el servidor")
        }

    }


    return (
        <div>

            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} />

            <section className="seccion" style={{paddingTop: "64px"}}>
                <div className="contenedor">

                    <div className="seccion-cabecera" style={{textAlign: "left", marginBottom: "32px", maxWidth: "100%"}}>
                        <span className="eyebrow">Refugio</span>
                        <h2>Publicar una mascota</h2>
                        <p>Añade los datos del animal para que las familias puedan conocerlo.</p>
                    </div>

                    <div className="form-caja">

                        {error && <div className="error">{error}</div>}

                        <div className="campos-fila">
                            <div className="campo">
                                <label>Nombre *</label>
                                <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                            </div>
                            <div className="campo">
                                <label>Tipo *</label>
                                <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
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
                                <label>Raza</label>
                                <input value={raza} onChange={(e) => setRaza(e.target.value)} />
                            </div>
                            <div className="campo">
                                <label>Sexo</label>
                                <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
                                    <option value="macho">Macho</option>
                                    <option value="hembra">Hembra</option>
                                </select>
                            </div>
                        </div>

                        <div className="campos-fila">
                            <div className="campo">
                                <label>Edad (años)</label>
                                <input type="number" min="0" value={edad} onChange={(e) => setEdad(e.target.value)} />
                            </div>
                            <div className="campo">
                                <label>Ciudad</label>
                                <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
                            </div>
                        </div>

                        <div className="campo">
                            <label>Foto de la mascota</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImagen(e.target.files[0])}
                            />
                        </div>

                        <div className="campo">
                            <label>Descripción</label>
                            <textarea rows="4" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                                      placeholder="Cuéntanos sobre su carácter, sus cuidados..."></textarea>
                        </div>

                        <button onClick={publicar} className="btn btn-primario btn-ancho btn-grande">
                            Publicar mascota
                        </button>

                    </div>

                </div>
            </section>

            <Footer navegar={navegar} />

        </div>
    )
}
