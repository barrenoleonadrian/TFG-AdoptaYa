import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"

const API = "http://localhost:3000"

export default function MiRefugio({ usuario, onLogout, navegar }) {

    const [nombre, setNombre] = useState("")
    const [email, setEmail] = useState("")
    const [telefono, setTelefono] = useState("")
    const [ciudad, setCiudad] = useState("")
    const [descripcion, setDescripcion] = useState("")
    const [imagen, setImagen] = useState(null)

    // si ya hay perfil creado, guardamos la imagen actual para mostrarla
    const [imagenActual, setImagenActual] = useState(null)

    const [error, setError] = useState("")
    const [ok, setOk] = useState("")


    // al entrar, traemos el perfil si ya existe y precargamos los campos
    useEffect(() => {
        cargar()
    }, [])


    async function cargar(){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/mi-refugio", {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()

            // si el refugio ya tiene perfil, precargamos los campos
            if(data){
                setNombre(data.nombre || "")
                setEmail(data.email || "")
                setTelefono(data.telefono || "")
                setCiudad(data.ciudad || "")
                setDescripcion(data.descripcion || "")
                setImagenActual(data.imagen)
            }else{
                // si es la primera vez, ponemos el nombre del usuario como default
                setNombre(usuario.nombre || "")
            }

        }catch(err){
            console.log("Error:", err)
        }
    }


    async function guardar(){

        setError("")
        setOk("")

        if(!nombre){
            setError("El nombre del refugio es obligatorio")
            return
        }

        try{
            const token = localStorage.getItem("token")

            const formData = new FormData()
            formData.append("nombre", nombre)
            formData.append("email", email)
            formData.append("telefono", telefono)
            formData.append("ciudad", ciudad)
            formData.append("descripcion", descripcion)
            if(imagen){ formData.append("imagen", imagen) }

            const res = await fetch(API + "/mi-refugio", {
                method: "POST",
                headers: {"Authorization": "Bearer " + token},
                body: formData
            })

            const data = await res.json()

            if(!res.ok){
                setError(data.mensaje || "Error al guardar")
                return
            }

            setOk("Información guardada correctamente")
            cargar()   // recarga para ver la imagen nueva si se subió

        }catch(err){
            setError("Error de conexión")
        }

    }


    return (
        <div>

            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} />

            <section className="seccion" style={{paddingTop: "64px"}}>
                <div className="contenedor">

                    <div className="seccion-cabecera" style={{textAlign: "left", maxWidth: "100%", marginBottom: "32px"}}>
                        <span className="eyebrow">Mi refugio</span>
                        <h2>Información del refugio</h2>
                        <p>Los datos que pongas aquí aparecerán en la página pública de refugios.</p>
                    </div>

                    <div className="form-caja">

                        {error && <div className="error">{error}</div>}
                        {ok && <div className="exito">{ok}</div>}

                        {imagenActual && (
                            <div className="campo">
                                <label>Imagen actual</label>
                                <img
                                    src={API + "/img/" + imagenActual}
                                    alt="Logo del refugio"
                                    style={{width: "120px", height: "120px", borderRadius: "12px", objectFit: "cover"}}
                                />
                            </div>
                        )}

                        <div className="campo">
                            <label>Nombre del refugio *</label>
                            <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                        </div>

                        <div className="campos-fila">
                            <div className="campo">
                                <label>Email de contacto</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="campo">
                                <label>Teléfono</label>
                                <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                            </div>
                        </div>

                        <div className="campo">
                            <label>Ciudad</label>
                            <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
                        </div>

                        <div className="campo">
                            <label>
                                {imagenActual ? "Cambiar imagen (opcional)" : "Imagen del refugio"}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImagen(e.target.files[0])}
                            />
                        </div>

                        <div className="campo">
                            <label>Descripción</label>
                            <textarea
                                rows="5"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Cuéntanos sobre tu refugio: desde cuándo estáis activos, qué tipo de animales acogéis, cómo trabajáis..."
                            />
                        </div>

                        <button onClick={guardar} className="btn btn-primario btn-ancho btn-grande">
                            Guardar cambios
                        </button>

                    </div>

                </div>
            </section>

            <Footer navegar={navegar} />

        </div>
    )
}
