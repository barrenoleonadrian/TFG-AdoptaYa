import { useState, useEffect, useRef } from "react"
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
    const [toast, setToast] = useState(null)
    const [abrirForm, setAbrirForm] = useState(false)


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
        <>
            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} />

            <main id="contenido-principal" tabIndex="-1">

                <section className="seccion" style={{paddingTop: "48px"}}>
                    <div className="contenedor">

                        <a href="#adoptar" className="volver"
                           onClick={(e) => { e.preventDefault(); navegar("adoptar") }}>
                            <span aria-hidden="true">←</span> Volver a adoptar
                        </a>

                        {!mascota ? (
                            <p className="vacio" role="status" aria-live="polite">Cargando...</p>
                        ) : (
                            <article className="detalle" aria-labelledby="mascota-nombre">

                                <div className="detalle-img">
                                    <img src={getImagenURL(mascota)} alt={`Foto de ${mascota.nombre}`} />
                                </div>

                                <div className="detalle-datos">

                                    <span className="badge">{mascota.estado}</span>

                                    <h1 id="mascota-nombre">{mascota.nombre}</h1>
                                    <p className="detalle-meta">{mascota.raza} · {mascota.ciudad}</p>

                                    <dl className="detalle-datos-lista">
                                        <div className="detalle-dato">
                                            <dt className="etiqueta">Tipo</dt>
                                            <dd className="valor">{mascota.tipo}</dd>
                                        </div>
                                        <div className="detalle-dato">
                                            <dt className="etiqueta">Sexo</dt>
                                            <dd className="valor">{mascota.sexo}</dd>
                                        </div>
                                        <div className="detalle-dato">
                                            <dt className="etiqueta">Edad</dt>
                                            <dd className="valor">{mascota.edad} años</dd>
                                        </div>
                                        <div className="detalle-dato">
                                            <dt className="etiqueta">Ciudad</dt>
                                            <dd className="valor">{mascota.ciudad}</dd>
                                        </div>
                                    </dl>

                                    {mascota.descripcion && (
                                        <p className="detalle-descripcion">{mascota.descripcion}</p>
                                    )}

                                    <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>
                                        {mascota.estado === "disponible" ? (
                                            <button
                                                type="button"
                                                onClick={abrirFormulario}
                                                className="btn btn-acento btn-grande">
                                                Solicitar adopción
                                                <span aria-hidden="true"> →</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="btn btn-grande"
                                                style={{opacity: 0.5, cursor: "not-allowed"}}>
                                                {mascota.estado === "reservada" ? "Reservada" : "Adoptada"}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={contactar}
                                            className="btn btn-ghost btn-grande">
                                            Contactar con el refugio
                                        </button>
                                    </div>

                                </div>

                            </article>
                        )}

                    </div>
                </section>

            </main>

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
        </>
    )
}


// ====== FORMULARIO DE ADOPCIÓN (modal accesible) ======
// Se abre al pulsar "Solicitar adopción". Recoge los datos del adoptante
// para que el refugio pueda evaluar su perfil.
//
// Mejoras de accesibilidad:
//   - role="dialog" + aria-modal + aria-labelledby
//   - foco inicial en el primer campo
//   - se cierra con la tecla Escape
//   - todos los campos con labels conectados (htmlFor/id)

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

    const primerCampoRef = useRef(null)


    // al abrir el modal: poner el foco en el primer campo
    useEffect(() => {
        if(primerCampoRef.current){
            primerCampoRef.current.focus()
        }
    }, [])


    // cerrar con Escape
    useEffect(() => {
        function teclaPulsada(e){
            if(e.key === "Escape"){
                onCerrar()
            }
        }
        document.addEventListener("keydown", teclaPulsada)
        return () => document.removeEventListener("keydown", teclaPulsada)
    }, [onCerrar])


    function enviar(e){

        e.preventDefault()

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
            <div
                className="modal-caja"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="form-adopcion-titulo">

                <header className="modal-cabecera">
                    <h2 id="form-adopcion-titulo">
                        Solicitud de adopción{mascotaNombre && " — " + mascotaNombre}
                    </h2>
                    <button
                        type="button"
                        className="modal-cerrar"
                        onClick={onCerrar}
                        aria-label="Cerrar formulario">
                        <span aria-hidden="true">×</span>
                    </button>
                </header>

                <p style={{fontSize: "14px", color: "var(--gris-500)", marginBottom: "20px"}}>
                    Cuéntanos un poco sobre ti para que el refugio pueda valorar tu solicitud.
                </p>

                {error && <div className="error-box" role="alert">{error}</div>}

                <form onSubmit={enviar} noValidate>

                    <div className="campo">
                        <label htmlFor="ad-nombre" data-required>Nombre completo</label>
                        <input
                            ref={primerCampoRef}
                            id="ad-nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            autoComplete="name"
                            required
                            aria-required="true" />
                    </div>

                    <div className="campo">
                        <label htmlFor="ad-mayor-edad" data-required>¿Eres mayor de edad?</label>
                        <label className="check-opcion">
                            <input
                                id="ad-mayor-edad"
                                type="checkbox"
                                checked={mayorEdad}
                                onChange={(e) => setMayorEdad(e.target.checked)}
                                required
                                aria-required="true" />
                            Sí, confirmo que soy mayor de edad
                        </label>
                    </div>

                    <div className="campo">
                        <label htmlFor="ad-direccion" data-required>Dirección</label>
                        <input
                            id="ad-direccion"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            placeholder="Calle, número, ciudad"
                            autoComplete="street-address"
                            required
                            aria-required="true" />
                    </div>

                    <div className="campo">
                        <label htmlFor="ad-vivienda" data-required>Tipo de vivienda</label>
                        <select
                            id="ad-vivienda"
                            value={tipoVivienda}
                            onChange={(e) => setTipoVivienda(e.target.value)}>
                            <option value="piso">Piso</option>
                            <option value="casa">Casa</option>
                            <option value="atico">Ático</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    <div className="campo">
                        <label htmlFor="ad-jardin">¿Tienes jardín o terraza?</label>
                        <label className="check-opcion">
                            <input
                                id="ad-jardin"
                                type="checkbox"
                                checked={jardin}
                                onChange={(e) => setJardin(e.target.checked)} />
                            Sí, dispongo de jardín o terraza
                        </label>
                    </div>

                    <div className="campo">
                        <label htmlFor="ad-experiencia">¿Tienes experiencia previa con mascotas?</label>
                        <label className="check-opcion">
                            <input
                                id="ad-experiencia"
                                type="checkbox"
                                checked={experiencia}
                                onChange={(e) => setExperiencia(e.target.checked)} />
                            Sí, ya he tenido mascotas antes
                        </label>
                    </div>

                    <div className="campo">
                        <label htmlFor="ad-otras">¿Tienes otras mascotas? (opcional)</label>
                        <input
                            id="ad-otras"
                            value={otrasMascotas}
                            onChange={(e) => setOtrasMascotas(e.target.value)}
                            placeholder="Ej: un perro de 5 años" />
                    </div>

                    <div className="campo">
                        <label htmlFor="ad-motivo" data-required>Motivo de la adopción</label>
                        <textarea
                            id="ad-motivo"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            rows="4"
                            placeholder="Cuéntanos por qué quieres adoptar a esta mascota"
                            required
                            aria-required="true" />
                    </div>

                    <div className="campo">
                        <label htmlFor="ad-laboral" data-required>Situación laboral</label>
                        <select
                            id="ad-laboral"
                            value={situacionLaboral}
                            onChange={(e) => setSituacionLaboral(e.target.value)}>
                            <option value="trabajo_fijo">Trabajo fijo</option>
                            <option value="autonomo">Autónomo</option>
                            <option value="estudiante">Estudiante</option>
                            <option value="desempleado">Desempleado</option>
                            <option value="jubilado">Jubilado</option>
                        </select>
                    </div>

                    <div style={{display: "flex", gap: "12px", marginTop: "20px"}}>
                        <button type="button" onClick={onCerrar} className="btn btn-ghost">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-acento" style={{flex: 1}}>
                            Enviar solicitud
                        </button>
                    </div>

                </form>

            </div>
        </div>
    )
}