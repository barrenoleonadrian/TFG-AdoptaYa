import { useState, useEffect, useRef } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import Toast from "../components/Toast.jsx"

const API = import.meta.env.VITE_API_URL || ""

export default function Mensajes({ usuario, onLogout, navegar, contactarCon }) {

    const [conversaciones, setConversaciones] = useState([])
    const [activo, setActivo] = useState(null)
    const [activoNombre, setActivoNombre] = useState("")
    const [mensajes, setMensajes] = useState([])
    const [texto, setTexto] = useState("")

    const finalChat = useRef(null)

    const [toast, setToast] = useState(null)
    function mostrar(mensajeToast, tipo = "ok"){
        setToast({ texto: mensajeToast, tipo })
    }


    useEffect(() => {
        cargarConversaciones()
    }, [])


    useEffect(() => {
        if(contactarCon){
            setActivo(contactarCon.id)
            setActivoNombre(contactarCon.nombre)
        }
    }, [contactarCon])


    useEffect(() => {

        if(!activo) return

        cargarMensajes()
        const intervalo = setInterval(cargarMensajes, 5000)

        return () => clearInterval(intervalo)

    }, [activo])


    useEffect(() => {
        if(finalChat.current){
            finalChat.current.scrollIntoView({behavior: "smooth"})
        }
    }, [mensajes])


    async function cargarConversaciones(){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/mensajes/conversaciones", {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            setConversaciones(data)
        }catch(err){
            console.log("Error:", err)
        }
    }


    async function cargarMensajes(){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/mensajes/" + activo, {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            setMensajes(data)
        }catch(err){
            console.log("Error:", err)
        }
    }


    async function enviar(e){

        if(e) e.preventDefault()
        if(!texto.trim()) return

        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/mensajes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    receptor_id: activo,
                    texto: texto
                })
            })

            if(res.ok){
                setTexto("")
                cargarMensajes()
                cargarConversaciones()
            }
        }catch(err){
            mostrar("Error al enviar el mensaje", "error")
        }

    }


    function abrirConversacion(c){
        setActivo(c.id)
        setActivoNombre(c.nombre)
    }


    // permite mandar con Enter, salto de línea con Shift+Enter
    function manejarTecla(e){
        if(e.key === "Enter" && !e.shiftKey){
            e.preventDefault()
            enviar()
        }
    }


    function formatearFecha(fecha){
        if(!fecha) return ""
        const f = new Date(fecha)
        const hoy = new Date()
        if(f.toDateString() === hoy.toDateString()){
            return f.toLocaleTimeString("es-ES", {hour: "2-digit", minute: "2-digit"})
        }
        return f.toLocaleDateString("es-ES", {day: "2-digit", month: "short"})
    }


    return (
        <>
            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} activo="mensajes" />

            <main id="contenido-principal" tabIndex="-1">

                <section className="seccion" style={{paddingTop: "64px"}} aria-labelledby="mensajes-titulo">
                    <div className="contenedor">

                        <header className="seccion-cabecera" style={{textAlign: "left", maxWidth: "100%", marginBottom: "32px"}}>
                            <span className="eyebrow">Mensajes</span>
                            <h1 id="mensajes-titulo">Tus conversaciones</h1>
                            <p>Habla directamente con los refugios o adoptantes.</p>
                        </header>

                        <div className="chat-layout">

                            {/* LISTA DE CONVERSACIONES */}
                            <nav className="chat-lista" aria-label="Lista de conversaciones">

                                {conversaciones.length === 0 && !activo ? (
                                    <div className="chat-vacio" role="status">
                                        <p>Aún no tienes conversaciones.</p>
                                        <p style={{fontSize: "13px", marginTop: "8px"}}>
                                            Contacta con un refugio desde la ficha de una mascota.
                                        </p>
                                    </div>
                                ) : (
                                    <ul style={{listStyle: "none", padding: 0, margin: 0}}>

                                        {activo && !conversaciones.find((c) => c.id === activo) && (
                                            <li>
                                                <div className="chat-item activo" aria-current="true">
                                                    <div className="chat-item-avatar" aria-hidden="true">
                                                        {activoNombre.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="chat-item-info">
                                                        <h2 style={{fontSize: "14px", margin: "0 0 2px 0"}}>{activoNombre}</h2>
                                                        <p>Nueva conversación</p>
                                                    </div>
                                                </div>
                                            </li>
                                        )}

                                        {conversaciones.map((c) => (
                                            <li key={c.id}>
                                                <button
                                                    type="button"
                                                    className={"chat-item " + (activo === c.id ? "activo" : "")}
                                                    onClick={() => abrirConversacion(c)}
                                                    aria-current={activo === c.id ? "true" : undefined}
                                                    aria-label={`Conversación con ${c.nombre}${c.sin_leer > 0 ? `, ${c.sin_leer} mensajes sin leer` : ""}`}>
                                                    <div className="chat-item-avatar" aria-hidden="true">
                                                        {c.nombre.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="chat-item-info">
                                                        <h2 style={{fontSize: "14px", margin: "0 0 2px 0"}}>{c.nombre}</h2>
                                                        <p>{c.ultimo_mensaje || "—"}</p>
                                                    </div>
                                                    <div className="chat-item-meta">
                                                        <span className="chat-item-fecha">{formatearFecha(c.ultima_fecha)}</span>
                                                        {c.sin_leer > 0 && (
                                                            <span className="chat-item-badge" aria-hidden="true">{c.sin_leer}</span>
                                                        )}
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                            </nav>

                            {/* CHAT ACTIVO */}
                            <div className="chat-conversacion">

                                {!activo ? (
                                    <p className="chat-vacio chat-vacio-grande" role="status">
                                        Selecciona una conversación
                                    </p>
                                ) : (
                                    <>
                                        <header className="chat-cabecera">
                                            <div className="chat-item-avatar" aria-hidden="true">
                                                {activoNombre.charAt(0).toUpperCase()}
                                            </div>
                                            <h2 style={{fontSize: "16px", margin: 0}}>{activoNombre}</h2>
                                        </header>

                                        <div
                                            className="chat-mensajes"
                                            role="log"
                                            aria-live="polite"
                                            aria-label="Mensajes de la conversación">
                                            {mensajes.length === 0 ? (
                                                <p style={{textAlign: "center", color: "var(--gris-500)", marginTop: "40px"}}>
                                                    Envía el primer mensaje para empezar la conversación.
                                                </p>
                                            ) : (
                                                mensajes.map((m) => (
                                                    <div
                                                        key={m.id}
                                                        className={"mensaje " + (m.emisor_id === usuario.id ? "mensaje-mio" : "mensaje-otro")}>
                                                        <p>{m.texto}</p>
                                                        <time
                                                            dateTime={m.fecha}
                                                            className="mensaje-hora">
                                                            {formatearFecha(m.fecha)}
                                                        </time>
                                                    </div>
                                                ))
                                            )}
                                            <div ref={finalChat}></div>
                                        </div>

                                        <form className="chat-input" onSubmit={enviar}>
                                            <label htmlFor="chat-texto" className="sr-only">
                                                Escribe un mensaje
                                            </label>
                                            <textarea
                                                id="chat-texto"
                                                value={texto}
                                                onChange={(e) => setTexto(e.target.value)}
                                                onKeyDown={manejarTecla}
                                                placeholder="Escribe un mensaje..."
                                                rows="1"
                                                aria-describedby="chat-ayuda" />
                                            <span id="chat-ayuda" className="sr-only">
                                                Pulsa Enter para enviar, o Mayúsculas más Enter para hacer un salto de línea.
                                            </span>
                                            <button type="submit" className="btn btn-acento">
                                                Enviar
                                            </button>
                                        </form>
                                    </>
                                )}

                            </div>

                        </div>

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