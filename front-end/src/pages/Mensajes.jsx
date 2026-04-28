import { useState, useEffect, useRef } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"

const API = "http://localhost:3000"

export default function Mensajes({ usuario, onLogout, navegar, contactarCon }) {

    const [conversaciones, setConversaciones] = useState([])

    // id del otro usuario con el que estoy hablando ahora
    const [activo, setActivo] = useState(null)

    // datos básicos del otro usuario (nombre)
    const [activoNombre, setActivoNombre] = useState("")

    // mensajes de la conversación actual
    const [mensajes, setMensajes] = useState([])

    // texto del campo de escribir
    const [texto, setTexto] = useState("")

    // referencia al final del chat para hacer scroll automático
    const finalChat = useRef(null)


    // al cargar, traemos las conversaciones
    useEffect(() => {
        cargarConversaciones()
    }, [])


    // si venimos de la página de mascota con un refugio para contactar,
    // abrimos directamente esa conversación
    useEffect(() => {
        if(contactarCon){
            setActivo(contactarCon.id)
            setActivoNombre(contactarCon.nombre)
        }
    }, [contactarCon])


    // cuando cambia la conversación activa, traemos sus mensajes
    // y configuramos el polling cada 5 segundos
    useEffect(() => {

        if(!activo) return

        cargarMensajes()

        // polling: cada 5 segundos pedimos los mensajes nuevos
        const intervalo = setInterval(cargarMensajes, 5000)

        return () => clearInterval(intervalo)

    }, [activo])


    // cuando llegan mensajes nuevos, hacemos scroll al final
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


    async function enviar(){

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
                cargarConversaciones()  // para actualizar el último mensaje
            }
        }catch(err){
            alert("Error al enviar")
        }

    }


    function abrirConversacion(c){
        setActivo(c.id)
        setActivoNombre(c.nombre)
    }


    // permite mandar el mensaje con Enter
    function manejarTecla(e){
        if(e.key === "Enter" && !e.shiftKey){
            e.preventDefault()
            enviar()
        }
    }


    // formatea la fecha del último mensaje (hoy → hora, otros días → fecha)
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
        <div>

            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} activo="mensajes" />

            <section className="seccion" style={{paddingTop: "64px"}}>
                <div className="contenedor">

                    <div className="seccion-cabecera" style={{textAlign: "left", maxWidth: "100%", marginBottom: "32px"}}>
                        <span className="eyebrow">Mensajes</span>
                        <h2>Tus conversaciones</h2>
                        <p>Habla directamente con los refugios o adoptantes.</p>
                    </div>

                    <div className="chat-layout">

                        {/* LISTA DE CONVERSACIONES */}
                        <div className="chat-lista">

                            {conversaciones.length === 0 && !activo ? (
                                <div className="chat-vacio">
                                    <p>Aún no tienes conversaciones.</p>
                                    <p style={{fontSize: "13px", marginTop: "8px"}}>
                                        Contacta con un refugio desde la ficha de una mascota.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* si abrimos un chat nuevo que aún no está en la lista, lo añadimos arriba */}
                                    {activo && !conversaciones.find((c) => c.id === activo) && (
                                        <div className="chat-item activo">
                                            <div className="chat-item-avatar">
                                                {activoNombre.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="chat-item-info">
                                                <h4>{activoNombre}</h4>
                                                <p>Nueva conversación</p>
                                            </div>
                                        </div>
                                    )}

                                    {conversaciones.map((c) => (
                                        <div
                                            key={c.id}
                                            className={"chat-item " + (activo === c.id ? "activo" : "")}
                                            onClick={() => abrirConversacion(c)}
                                        >
                                            <div className="chat-item-avatar">
                                                {c.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="chat-item-info">
                                                <h4>{c.nombre}</h4>
                                                <p>{c.ultimo_mensaje || "—"}</p>
                                            </div>
                                            <div className="chat-item-meta">
                                                <span className="chat-item-fecha">{formatearFecha(c.ultima_fecha)}</span>
                                                {c.sin_leer > 0 && (
                                                    <span className="chat-item-badge">{c.sin_leer}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                        </div>

                        {/* CHAT ACTIVO */}
                        <div className="chat-conversacion">

                            {!activo ? (
                                <div className="chat-vacio chat-vacio-grande">
                                    <p>Selecciona una conversación</p>
                                </div>
                            ) : (
                                <>
                                    <div className="chat-cabecera">
                                        <div className="chat-item-avatar">
                                            {activoNombre.charAt(0).toUpperCase()}
                                        </div>
                                        <h3>{activoNombre}</h3>
                                    </div>

                                    <div className="chat-mensajes">
                                        {mensajes.length === 0 ? (
                                            <p style={{textAlign: "center", color: "var(--gris-500)", marginTop: "40px"}}>
                                                Envía el primer mensaje para empezar la conversación.
                                            </p>
                                        ) : (
                                            mensajes.map((m) => (
                                                <div
                                                    key={m.id}
                                                    className={"mensaje " + (m.emisor_id === usuario.id ? "mensaje-mio" : "mensaje-otro")}
                                                >
                                                    <p>{m.texto}</p>
                                                    <span className="mensaje-hora">{formatearFecha(m.fecha)}</span>
                                                </div>
                                            ))
                                        )}
                                        <div ref={finalChat}></div>
                                    </div>

                                    <div className="chat-input">
                                        <textarea
                                            value={texto}
                                            onChange={(e) => setTexto(e.target.value)}
                                            onKeyDown={manejarTecla}
                                            placeholder="Escribe un mensaje..."
                                            rows="1"
                                        />
                                        <button onClick={enviar} className="btn btn-acento">
                                            Enviar
                                        </button>
                                    </div>
                                </>
                            )}

                        </div>

                    </div>

                </div>
            </section>

            <Footer navegar={navegar} />

        </div>
    )
}
