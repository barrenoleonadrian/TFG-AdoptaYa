import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import Toast from "../components/Toast.jsx"

const API = import.meta.env.VITE_API_URL || ""


function getImagenURL(m){
    if(m.imagen){
        return API + "/img/" + m.imagen
    }
    return API + "/img/" + m.nombre.toLowerCase() + ".jpg"
}


export default function Mascota({ id, usuario, onLogout, navegar }) {

    const [mascota, setMascota] = useState(null)

    // estado para el toast: { texto, tipo } o null
    const [toast, setToast] = useState(null)

    // si está abierto el modal con el formulario de adopción
    const [abrirForm, setAbrirForm] = useState(false)

    // muestra un mensaje. tipo: "ok" (verde) o "error" (rojo)
    function mostrar(texto, tipo = "ok"){
        setToast({ texto, tipo })
    }


    useEffect(() => {
        cargarMascota()
    }, [id])


    async function cargarMascota(){
        try{
            const res = await fetch(API + "/mascotas/" + id)
            const data = await res.json()
            setMascota(data)
        }catch(err){
            console.log("Error:", err)
        }
    }


    // al pulsar "Solicitar adopción": comprueba sesión y abre el formulario
    function abrirFormulario(){

        if(!usuario){
            mostrar("Debes iniciar sesión para adoptar", "error")
            sessionStorage.setItem("volver", "mascota/" + id)
            navegar("login")
            return
        }

        if(usuario.tipo !== "adoptante"){
            mostrar("Solo los usuarios normales pueden adoptar", "error")
            return
        }

        setAbrirForm(true)
    }


    // se llama desde el formulario una vez completado y validado
    async function enviarSolicitud(datos){

        try{

            const token = localStorage.getItem("token")

            const res = await fetch(API + "/mascotas/" + id + "/adoptar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(datos)
            })

            const data = await res.json()

            if(res.ok){
                setAbrirForm(false)
                mostrar("¡Solicitud enviada! El refugio se pondrá en contacto contigo.", "ok")
            }else{
                mostrar(data.mensaje || "Error al enviar la solicitud", "error")
            }

        }catch(err){
            mostrar("Error de conexión", "error")
        }

    }


    // contacta con el refugio que publicó esta mascota
    function contactar(){

        if(!usuario){
            mostrar("Debes iniciar sesión para contactar con el refugio", "error")
            sessionStorage.setItem("volver", "mascota/" + id)
            navegar("login")
            return
        }

        if(usuario.tipo !== "adoptante"){
            mostrar("Solo los adoptantes pueden contactar con los refugios", "error")
            return
        }

        sessionStorage.setItem("contactarCon", JSON.stringify({
            id: mascota.usuario_id,
            nombre: "Refugio"
        }))
        navegar("mensajes")

    }


    return (
        <div>

            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} />

            <section className="seccion" style={{paddingTop: "48px"}}>
                <div className="contenedor">

                    <a href="#adoptar" className="volver"
                       onClick={(e) => { e.preventDefault(); navegar("adoptar") }}>
                        ← Volver a adoptar
                    </a>

                    {!mascota ? (
                        <p className="vacio">Cargando...</p>
                    ) : (
                        <div className="detalle">

                            <div className="detalle-img">
                                <img src={getImagenURL(mascota)} alt={mascota.nombre} />
                            </div>

                            <div className="detalle-datos">

                                <span className="badge">{mascota.estado}</span>

                                <h1>{mascota.nombre}</h1>
                                <p className="detalle-meta">{mascota.raza} · {mascota.ciudad}</p>

                                <ul className="detalle-datos-lista">
                                    <li className="detalle-dato">
                                        <span className="etiqueta">Tipo</span>
                                        <span className="valor">{mascota.tipo}</span>
                                    </li>
                                    <li className="detalle-dato">
                                        <span className="etiqueta">Sexo</span>
                                        <span className="valor">{mascota.sexo}</span>
                                    </li>
                                    <li className="detalle-dato">
                                        <span className="etiqueta">Edad</span>
                                        <span className="valor">{mascota.edad} años</span>
                                    </li>
                                    <li className="detalle-dato">
                                        <span className="etiqueta">Ciudad</span>
                                        <span className="valor">{mascota.ciudad}</span>
                                    </li>
                                </ul>

                                {mascota.descripcion && (
                                    <p className="detalle-descripcion">{mascota.descripcion}</p>
                                )}

                                <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>
                                    {mascota.estado === "disponible" ? (
                                        <button onClick={abrirFormulario} className="btn btn-acento btn-grande">
                                            Solicitar adopción →
                                        </button>
                                    ) : (
                                        <button disabled className="btn btn-grande" style={{opacity: 0.5, cursor: "not-allowed"}}>
                                            {mascota.estado === "reservada" ? "Reservada" : "Adoptada"}
                                        </button>
                                    )}
                                    <button onClick={contactar} className="btn btn-ghost btn-grande">
                                        Contactar con el refugio
                                    </button>
                                </div>

                            </div>

                        </div>
                    )}

                </div>
            </section>

            <Footer navegar={navegar} />

            {/* modal con el formulario de adopción */}
            {abrirForm && (
                <FormularioAdopcion
                    mascotaNombre={mascota?.nombre}
                    onCerrar={() => setAbrirForm(false)}
                    onEnviar={enviarSolicitud}
                />
            )}

            {toast && (
                <Toast
                    mensaje={toast.texto}
                    tipo={toast.tipo}
                    onCerrar={() => setToast(null)}
                />
            )}

        </div>
    )
}


// ====== FORMULARIO DE ADOPCIÓN (modal) ======
// Se abre al pulsar "Solicitar adopción". Recoge los datos del adoptante
// para que el refugio pueda evaluar su perfil antes de aceptar la adopción.

function FormularioAdopcion({ mascotaNombre, onCerrar, onEnviar }){

    const [nombre, setNombre] = useState("")
    const [mayorEdad, setMayorEdad] = useState(false)
    const [direccion, setDireccion] = useState("")
    const [tipoVivienda, setTipoVivienda] = useState("piso")
    const [jardin, setJardin] = useState(false)
    const [experiencia, setExperiencia] = useState(false)
    const [otrasMascotas, setOtrasMascotas] = useState("")
    const [motivo, setMotivo] = useState("")
    const [situacionLaboral, setSituacionLaboral] = useState("trabajo_fijo")

    const [error, setError] = useState("")


    function enviar(){

        // validación básica de los campos obligatorios
        if(!nombre || !direccion || !motivo){
            setError("Por favor, rellena todos los campos obligatorios")
            return
        }

        if(!mayorEdad){
            setError("Tienes que ser mayor de edad para poder adoptar")
            return
        }

        setError("")

        onEnviar({
            nombre_solicitante: nombre,
            mayor_edad: mayorEdad,
            direccion: direccion,
            tipo_vivienda: tipoVivienda,
            jardin: jardin,
            experiencia: experiencia,
            otras_mascotas: otrasMascotas,
            motivo: motivo,
            situacion_laboral: situacionLaboral
        })

    }


    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div className="modal-caja" onClick={(e) => e.stopPropagation()}>

                <div className="modal-cabecera">
                    <h3>Solicitud de adopción {mascotaNombre && "— " + mascotaNombre}</h3>
                    <button className="modal-cerrar" onClick={onCerrar}>×</button>
                </div>

                <p style={{fontSize: "14px", color: "var(--gris-500)", marginBottom: "20px"}}>
                    Cuéntanos un poco sobre ti para que el refugio pueda valorar tu solicitud.
                </p>

                {error && <div className="error-box">{error}</div>}

                <div className="campo">
                    <label>Nombre completo *</label>
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>

                <div className="campo">
                    <label>¿Eres mayor de edad? *</label>
                    <label className="check-opcion">
                        <input type="checkbox" checked={mayorEdad} onChange={(e) => setMayorEdad(e.target.checked)} />
                        Sí, confirmo que soy mayor de edad
                    </label>
                </div>

                <div className="campo">
                    <label>Dirección *</label>
                    <input value={direccion} onChange={(e) => setDireccion(e.target.value)}
                           placeholder="Calle, número, ciudad" />
                </div>

                <div className="campo">
                    <label>Tipo de vivienda *</label>
                    <select value={tipoVivienda} onChange={(e) => setTipoVivienda(e.target.value)}>
                        <option value="piso">Piso</option>
                        <option value="casa">Casa</option>
                        <option value="atico">Ático</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>

                <div className="campo">
                    <label>¿Tienes jardín o terraza?</label>
                    <label className="check-opcion">
                        <input type="checkbox" checked={jardin} onChange={(e) => setJardin(e.target.checked)} />
                        Sí, dispongo de jardín o terraza
                    </label>
                </div>

                <div className="campo">
                    <label>¿Tienes experiencia previa con mascotas?</label>
                    <label className="check-opcion">
                        <input type="checkbox" checked={experiencia} onChange={(e) => setExperiencia(e.target.checked)} />
                        Sí, ya he tenido mascotas antes
                    </label>
                </div>

                <div className="campo">
                    <label>¿Tienes otras mascotas? (opcional)</label>
                    <input value={otrasMascotas} onChange={(e) => setOtrasMascotas(e.target.value)}
                           placeholder="Ej: un perro de 5 años" />
                </div>

                <div className="campo">
                    <label>Motivo de la adopción *</label>
                    <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)}
                              rows="4"
                              placeholder="Cuéntanos por qué quieres adoptar a esta mascota"></textarea>
                </div>

                <div className="campo">
                    <label>Situación laboral *</label>
                    <select value={situacionLaboral} onChange={(e) => setSituacionLaboral(e.target.value)}>
                        <option value="trabajo_fijo">Trabajo fijo</option>
                        <option value="autonomo">Autónomo</option>
                        <option value="estudiante">Estudiante</option>
                        <option value="desempleado">Desempleado</option>
                        <option value="jubilado">Jubilado</option>
                    </select>
                </div>

                <div style={{display: "flex", gap: "12px", marginTop: "20px"}}>
                    <button onClick={onCerrar} className="btn btn-ghost">Cancelar</button>
                    <button onClick={enviar} className="btn btn-acento" style={{flex: 1}}>
                        Enviar solicitud
                    </button>
                </div>

            </div>
        </div>
    )
}
