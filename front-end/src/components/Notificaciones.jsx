import { useState, useEffect, useRef } from "react"

const API = import.meta.env.VITE_API_URL || ""

// Campanita de notificaciones para el navbar.
// Funcionamiento:
//   - Cada 30 segundos pide al backend cuántas notificaciones sin leer hay.
//   - Si > 0, muestra un contador rojo sobre la campana.
//   - Al hacer click se abre un panel desplegable con las últimas 20.
//   - Al pulsar una notificación: se marca como leída y, si tiene
//     enlace, navega a la página correspondiente.
//
// Props:
//   - usuario: usuario logueado.
//   - navegar: función para cambiar de página.

export default function Notificaciones({ usuario, navegar }) {

    const [sinLeer, setSinLeer] = useState(0)
    const [abierto, setAbierto] = useState(false)
    const [notificaciones, setNotificaciones] = useState([])

    const panelRef = useRef(null)
    const botonRef = useRef(null)


    // polling para contar las no leídas cada 30 segundos
    useEffect(() => {

        if(!usuario) return

        contarSinLeer()
        const intervalo = setInterval(contarSinLeer, 30000)
        return () => clearInterval(intervalo)

    }, [usuario])


    // cerrar al hacer clic fuera o pulsar Escape
    useEffect(() => {

        function clicFuera(e){
            if(panelRef.current && !panelRef.current.contains(e.target)
                && botonRef.current && !botonRef.current.contains(e.target)){
                setAbierto(false)
            }
        }

        function teclaPulsada(e){
            if(e.key === "Escape" && abierto){
                setAbierto(false)
                if(botonRef.current) botonRef.current.focus()
            }
        }

        document.addEventListener("mousedown", clicFuera)
        document.addEventListener("keydown", teclaPulsada)

        return () => {
            document.removeEventListener("mousedown", clicFuera)
            document.removeEventListener("keydown", teclaPulsada)
        }

    }, [abierto])


    async function contarSinLeer(){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/notificaciones/sin-leer", {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            setSinLeer(data.total || 0)
        }catch(err){
            // ignorar errores aquí (poll silencioso)
        }
    }


    async function cargarNotificaciones(){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/notificaciones", {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            if(Array.isArray(data)){
                setNotificaciones(data)
            }
        }catch(err){
            console.log("Error al cargar notificaciones:", err)
        }
    }


    // al abrir el panel cargamos las notificaciones y las marcamos todas como leídas
    async function alAbrir(){

        setAbierto(true)
        await cargarNotificaciones()

        // si hay notificaciones sin leer, las marcamos como leídas
        if(sinLeer > 0){
            try{
                const token = localStorage.getItem("token")
                await fetch(API + "/notificaciones/leer-todas", {
                    method: "PUT",
                    headers: {"Authorization": "Bearer " + token}
                })
                setSinLeer(0)
            }catch(err){
                console.log("Error al marcar como leídas:", err)
            }
        }

    }


    // al pulsar una notificación: navegar si tiene enlace
    function alPulsar(n){
        setAbierto(false)
        if(n.enlace){
            navegar(n.enlace)
        }
    }


    // formatea la fecha de forma corta y amigable
    // (hace 2 min, hace 1 h, hace 3 días, etc.)
    function tiempoRelativo(fecha){

        const ahora = new Date()
        const cuando = new Date(fecha)
        const segundos = Math.floor((ahora - cuando) / 1000)

        if(segundos < 60) return "hace un momento"

        const minutos = Math.floor(segundos / 60)
        if(minutos < 60) return `hace ${minutos} min`

        const horas = Math.floor(minutos / 60)
        if(horas < 24) return `hace ${horas} h`

        const dias = Math.floor(horas / 24)
        if(dias < 7) return `hace ${dias} ${dias === 1 ? "día" : "días"}`

        // si es más antiguo, mostramos la fecha en formato corto
        return cuando.toLocaleDateString("es-ES", {day: "2-digit", month: "short"})

    }


    if(!usuario) return null


    return (
        <div className="notif-contenedor">

            <button
                ref={botonRef}
                type="button"
                className="notif-boton"
                onClick={() => abierto ? setAbierto(false) : alAbrir()}
                aria-label={sinLeer > 0
                    ? `Notificaciones, ${sinLeer} sin leer`
                    : "Notificaciones"}
                aria-haspopup="menu"
                aria-expanded={abierto}>

                {/* SVG de campana */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>

                {sinLeer > 0 && (
                    <span className="notif-contador" aria-hidden="true">
                        {sinLeer > 9 ? "9+" : sinLeer}
                    </span>
                )}

            </button>

            {abierto && (
                <div
                    ref={panelRef}
                    className="notif-panel"
                    role="menu"
                    aria-label="Lista de notificaciones">

                    <div className="notif-cabecera">
                        <h3>Notificaciones</h3>
                    </div>

                    {notificaciones.length === 0 ? (
                        <p className="notif-vacio">
                            No tienes notificaciones todavía.
                        </p>
                    ) : (
                        <ul className="notif-lista">
                            {notificaciones.map((n) => (
                                <li key={n.id}>
                                    <button
                                        type="button"
                                        className={"notif-item " + (n.leida ? "" : "no-leida")}
                                        onClick={() => alPulsar(n)}
                                        role="menuitem">

                                        <span className={"notif-icono notif-icono-" + n.tipo} aria-hidden="true">
                                            <IconoNotificacion tipo={n.tipo} />
                                        </span>

                                        <div className="notif-info">
                                            <p className="notif-texto">{n.texto}</p>
                                            <span className="notif-fecha">{tiempoRelativo(n.fecha)}</span>
                                        </div>

                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                </div>
            )}

        </div>
    )
}


// Icono SVG según el tipo de notificación.
// Cada uno tiene su color definido en el CSS (.notif-icono-solicitud_aprobada, etc).
function IconoNotificacion({ tipo }){

    // CHECK (✓) — aprobada, verificado
    if(tipo === "solicitud_aprobada" || tipo === "refugio_verificado"){
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        )
    }

    // CRUZ (×) — rechazada
    if(tipo === "solicitud_rechazada"){
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        )
    }

    // CARTA — solicitud nueva
    if(tipo === "solicitud_nueva"){
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
            </svg>
        )
    }

    // BOCADILLO — mensaje
    if(tipo === "mensaje_nuevo"){
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
        )
    }

    // ESTRELLA — valoración
    if(tipo === "valoracion_nueva"){
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        )
    }

    // por defecto: campanita
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
    )

}