import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"

const API = import.meta.env.VITE_API_URL || ""

export default function MiRefugio({ usuario, onLogout, navegar }) {

    const [nombre, setNombre] = useState("")
    const [email, setEmail] = useState("")
    const [telefono, setTelefono] = useState("")
    const [ciudad, setCiudad] = useState("")
    const [descripcion, setDescripcion] = useState("")
    const [imagen, setImagen] = useState(null)

    const [imagenActual, setImagenActual] = useState(null)

    const [error, setError] = useState("")
    const [ok, setOk] = useState("")


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

            if(data){
                setNombre(data.nombre || "")
                setEmail(data.email || "")
                setTelefono(data.telefono || "")
                setCiudad(data.ciudad || "")
                setDescripcion(data.descripcion || "")
                setImagenActual(data.imagen)
            }else{
                setNombre(usuario.nombre || "")
            }

        }catch(err){
            console.log("Error:", err)
        }
    }


    async function guardar(e){

        e.preventDefault()
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
            cargar()

        }catch(err){
            setError("Error de conexión")
        }

    }


    return (
        <>
            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} />

            <main id="contenido-principal" tabIndex="-1">

                <section className="seccion" style={{paddingTop: "64px"}} aria-labelledby="mi-refugio-titulo">
                    <div className="contenedor">

                        <header className="seccion-cabecera" style={{textAlign: "left", maxWidth: "100%", marginBottom: "32px"}}>
                            <span className="eyebrow">Mi refugio</span>
                            <h1 id="mi-refugio-titulo">Información del refugio</h1>
                            <p>Los datos que pongas aquí aparecerán en la página pública de refugios.</p>
                        </header>

                        <form className="form-caja" onSubmit={guardar} noValidate>

                            {error && <div className="error" role="alert">{error}</div>}
                            {ok && <div className="exito" role="status">{ok}</div>}

                            {imagenActual && (
                                <div className="campo">
                                    <p className="campo-ayuda" style={{marginBottom: "8px", fontWeight: 600, color: "var(--negro)"}}>
                                        Imagen actual
                                    </p>
                                    <img
                                        src={API + "/img/" + imagenActual}
                                        alt="Imagen actual del refugio"
                                        style={{width: "120px", height: "120px", borderRadius: "12px", objectFit: "cover"}}
                                    />
                                </div>
                            )}

                            <div className="campo">
                                <label htmlFor="mr-nombre" data-required>Nombre del refugio</label>
                                <input
                                    id="mr-nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    autoComplete="organization"
                                    required
                                    aria-required="true" />
                            </div>

                            <div className="campos-fila">
                                <div className="campo">
                                    <label htmlFor="mr-email">Email de contacto</label>
                                    <input
                                        id="mr-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email" />
                                </div>
                                <div className="campo">
                                    <label htmlFor="mr-telefono">Teléfono</label>
                                    <input
                                        id="mr-telefono"
                                        type="tel"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        autoComplete="tel" />
                                </div>
                            </div>

                            <div className="campo">
                                <label htmlFor="mr-ciudad">Ciudad</label>
                                <input
                                    id="mr-ciudad"
                                    value={ciudad}
                                    onChange={(e) => setCiudad(e.target.value)}
                                    autoComplete="address-level2" />
                            </div>

                            <div className="campo">
                                <label htmlFor="mr-imagen">
                                    {imagenActual ? "Cambiar imagen (opcional)" : "Imagen del refugio"}
                                </label>
                                <input
                                    id="mr-imagen"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImagen(e.target.files[0])}
                                    aria-describedby="mr-imagen-ayuda" />
                                <small id="mr-imagen-ayuda" className="campo-ayuda">
                                    Formatos admitidos: JPG, PNG o WEBP. Máximo 5 MB.
                                </small>
                            </div>

                            <div className="campo">
                                <label htmlFor="mr-descripcion">Descripción</label>
                                <textarea
                                    id="mr-descripcion"
                                    rows="5"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Cuéntanos sobre tu refugio: desde cuándo estáis activos, qué tipo de animales acogéis, cómo trabajáis..."
                                />
                            </div>

                            <button type="submit" className="btn btn-primario btn-ancho btn-grande">
                                Guardar cambios
                            </button>

                        </form>

                    </div>
                </section>

            </main>

            <Footer navegar={navegar} />
        </>
    )
}