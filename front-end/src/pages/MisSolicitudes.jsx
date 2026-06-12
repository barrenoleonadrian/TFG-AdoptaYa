import { useState, useEffect, useRef } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import Estrellas from "../components/Estrellas.jsx"
import Toast from "../components/Toast.jsx"

const API = import.meta.env.VITE_API_URL || ""


// Página donde los adoptantes ven sus solicitudes enviadas y el estado de cada una.
// Además, en las solicitudes APROBADAS pueden dejar una valoración al refugio.
export default function MisSolicitudes({ usuario, onLogout, navegar }) {

    const [solicitudes, setSolicitudes] = useState([])

    // datos para abrir el modal de valoración: { refugioId, refugioNombre } o null
    const [valorando, setValorando] = useState(null)

    // toast
    const [toast, setToast] = useState(null)
    function mostrar(texto, tipo = "ok"){
        setToast({ texto, tipo })
    }


    useEffect(() => {
        cargar()
    }, [])


    async function cargar(){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/mis-solicitudes-adoptante", {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            if(Array.isArray(data)){
                setSolicitudes(data)
            }else{
                setSolicitudes([])
            }
        }catch(err){
            console.log("Error:", err)
            setSolicitudes([])
        }
    }


    function textoEstado(estado){
        const textos = {
            "pendiente": "Pendiente de revisar",
            "en_revision": "En revisión",
            "aprobada": "Aprobada",
            "rechazada": "Rechazada"
        }
        return textos[estado] || estado
    }


    function explicacionEstado(estado){
        const explicaciones = {
            "pendiente": "El refugio aún no ha revisado tu solicitud.",
            "en_revision": "El refugio está revisando tu solicitud.",
            "aprobada": "¡Enhorabuena! El refugio ha aprobado tu solicitud y se pondrá en contacto contigo.",
            "rechazada": "Lamentablemente esta solicitud no ha salido adelante."
        }
        return explicaciones[estado] || ""
    }


    function abrirModalValoracion(refugioId, refugioNombre){
        setValorando({ refugioId, refugioNombre })
    }


    return (
        <>
            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} activo="mis-solicitudes" />

            <main id="contenido-principal" tabIndex="-1">

                <section className="seccion" style={{paddingTop: "64px"}} aria-labelledby="mis-solicitudes-titulo">
                    <div className="contenedor">

                        <header className="seccion-cabecera" style={{textAlign: "left", maxWidth: "100%", marginBottom: "32px"}}>
                            <span className="eyebrow">Mi cuenta</span>
                            <h1 id="mis-solicitudes-titulo">Mis solicitudes</h1>
                            <p>Aquí puedes ver el estado de las solicitudes de adopción que has enviado.</p>
                        </header>


                        {solicitudes.length === 0 ? (
                            <div className="vacio" role="status">
                                <p>Aún no has enviado ninguna solicitud de adopción.</p>
                                <button
                                    type="button"
                                    onClick={() => navegar("adoptar")}
                                    className="btn btn-acento"
                                    style={{marginTop: "16px"}}>
                                    Ver mascotas en adopción
                                </button>
                            </div>
                        ) : (
                            <ul className="solicitudes-lista" aria-label="Lista de solicitudes enviadas">

                                {solicitudes.map((s) => (
                                    <li key={s.id}>
                                        <article className="solicitud-tarjeta" aria-labelledby={`solicitud-${s.id}-titulo`}>

                                            <div className="solicitud-cabecera">
                                                <div style={{display: "flex", gap: "16px", alignItems: "center"}}>
                                                    <img
                                                        src={s.mascota_imagen
                                                            ? API + "/img/" + s.mascota_imagen
                                                            : API + "/img/" + s.mascota_nombre.toLowerCase() + ".jpg"}
                                                        alt={`Foto de ${s.mascota_nombre}`}
                                                        style={{width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover"}}
                                                    />
                                                    <div>
                                                        <h2 id={`solicitud-${s.id}-titulo`} style={{fontSize: "16px", margin: "0 0 4px 0"}}>
                                                            {s.mascota_nombre}
                                                        </h2>
                                                        <p className="solicitud-meta">
                                                            Refugio: <strong>{s.refugio_nombre}</strong>
                                                            {" · "}
                                                            Solicitada el <time dateTime={s.fecha}>
                                                                {new Date(s.fecha).toLocaleDateString("es-ES")}
                                                            </time>
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className={"badge badge-" + s.estado} aria-label={`Estado: ${textoEstado(s.estado)}`}>
                                                    {textoEstado(s.estado)}
                                                </span>
                                            </div>

                                            <p style={{fontSize: "14px", color: "var(--gris-700)", margin: "12px 0 0 0"}}>
                                                {explicacionEstado(s.estado)}
                                            </p>

                                            {/* botón para valorar al refugio (solo si la solicitud está aprobada) */}
                                            {s.estado === "aprobada" && (
                                                <div style={{marginTop: "12px"}}>
                                                    <button
                                                        type="button"
                                                        onClick={() => abrirModalValoracion(s.refugio_id, s.refugio_nombre)}
                                                        className="btn btn-ghost btn-pequeno">
                                                        Valorar al refugio
                                                    </button>
                                                </div>
                                            )}

                                        </article>
                                    </li>
                                ))}

                            </ul>
                        )}

                    </div>
                </section>

            </main>

            <Footer navegar={navegar} />

            {valorando && (
                <ModalValoracion
                    refugioId={valorando.refugioId}
                    refugioNombre={valorando.refugioNombre}
                    onCerrar={() => setValorando(null)}
                    onExito={(mensaje) => {
                        mostrar(mensaje)
                        setValorando(null)
                    }}
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


// ====== MODAL DE VALORACIÓN ======
// Permite al adoptante dejar (o editar) una valoración al refugio.
// Si ya valoró antes, precargamos los datos para que pueda editar.

function ModalValoracion({ refugioId, refugioNombre, onCerrar, onExito }){

    const [estrellas, setEstrellas] = useState(0)
    const [comentario, setComentario] = useState("")
    const [error, setError] = useState("")
    const [enviando, setEnviando] = useState(false)

    const primerCampoRef = useRef(null)


    // al abrir, miramos si ya hay una valoración previa para precargar
    useEffect(() => {
        cargarValoracionPrevia()
    }, [])


    // foco al abrir + cerrar con Escape
    useEffect(() => {
        if(primerCampoRef.current){
            primerCampoRef.current.focus()
        }

        function teclaPulsada(e){
            if(e.key === "Escape") onCerrar()
        }
        document.addEventListener("keydown", teclaPulsada)
        return () => document.removeEventListener("keydown", teclaPulsada)
    }, [onCerrar])


    async function cargarValoracionPrevia(){

        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/refugios/" + refugioId + "/valoraciones/mia", {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()

            if(data){
                setEstrellas(data.estrellas || 0)
                setComentario(data.comentario || "")
            }

        }catch(err){
            // si falla, simplemente no precargamos nada
        }

    }


    async function enviar(e){

        e.preventDefault()
        setError("")

        if(estrellas < 1 || estrellas > 5){
            setError("Por favor, selecciona una valoración del 1 al 5")
            return
        }

        setEnviando(true)

        try{

            const token = localStorage.getItem("token")
            const res = await fetch(API + "/refugios/" + refugioId + "/valoraciones", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ estrellas, comentario })
            })

            const data = await res.json()

            if(!res.ok){
                setError(data.mensaje || "Error al enviar la valoración")
                setEnviando(false)
                return
            }

            onExito(data.mensaje || "Valoración guardada")

        }catch(err){
            setError("Error de conexión con el servidor")
            setEnviando(false)
        }

    }


    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div
                className="modal-caja"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="valoracion-titulo">

                <header className="modal-cabecera">
                    <h2 id="valoracion-titulo">Valorar a {refugioNombre}</h2>
                    <button
                        type="button"
                        className="modal-cerrar"
                        onClick={onCerrar}
                        aria-label="Cerrar formulario de valoración">
                        <span aria-hidden="true">×</span>
                    </button>
                </header>

                <p style={{fontSize: "14px", color: "var(--gris-500)", marginBottom: "24px"}}>
                    Comparte tu experiencia con este refugio para ayudar a otros adoptantes.
                </p>

                {error && <div className="error-box" role="alert">{error}</div>}

                <form onSubmit={enviar} noValidate>

                    <div className="campo" ref={primerCampoRef} tabIndex="-1">
                        <label data-required style={{marginBottom: "12px"}}>Tu puntuación</label>
                        <Estrellas
                            valor={estrellas}
                            onCambio={setEstrellas}
                            interactivo={true}
                            tamano="grande" />
                    </div>

                    <div className="campo">
                        <label htmlFor="val-comentario">Comentario (opcional)</label>
                        <textarea
                            id="val-comentario"
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            rows="5"
                            maxLength="500"
                            placeholder="Cuenta cómo fue tu experiencia con el refugio: trato recibido, proceso de adopción, atención posterior..." />
                        <small className="campo-ayuda">
                            {comentario.length} / 500 caracteres.
                        </small>
                    </div>

                    <div style={{display: "flex", gap: "12px", marginTop: "20px"}}>
                        <button type="button" onClick={onCerrar} className="btn btn-ghost">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={enviando}
                            className="btn btn-acento"
                            style={{flex: 1}}>
                            {enviando ? "Enviando..." : "Publicar valoración"}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    )
}