import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import Toast from "../components/Toast.jsx"
import Confirm from "../components/Confirm.jsx"

const API = import.meta.env.VITE_API_URL || ""

export default function MisMascotas({ usuario, onLogout, navegar }) {

    // pestaña activa: "mascotas" o "solicitudes"
    const [pestana, setPestana] = useState("mascotas")

    // toast
    const [toast, setToast] = useState(null)
    function mostrar(texto, tipo = "ok"){
        setToast({ texto, tipo })
    }


    return (
        <div>

            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} activo="mis-mascotas" />

            <section className="seccion" style={{paddingTop: "64px"}}>
                <div className="contenedor">

                    <div className="seccion-cabecera" style={{textAlign: "left", maxWidth: "100%", marginBottom: "32px"}}>
                        <span className="eyebrow">Refugio</span>
                        <h2>Mis mascotas</h2>
                        <p>Gestiona tus mascotas publicadas y las solicitudes de adopción que recibas.</p>
                    </div>

                    {/* PESTAÑAS */}
                    <div className="tabs">
                        <button
                            className={"tab " + (pestana === "mascotas" ? "activo" : "")}
                            onClick={() => setPestana("mascotas")}>
                            Mis mascotas
                        </button>
                        <button
                            className={"tab " + (pestana === "solicitudes" ? "activo" : "")}
                            onClick={() => setPestana("solicitudes")}>
                            Solicitudes recibidas
                        </button>
                    </div>

                    {/* CONTENIDO */}
                    {pestana === "mascotas" && <ListaMascotas mostrar={mostrar} />}
                    {pestana === "solicitudes" && <ListaSolicitudes mostrar={mostrar} />}

                </div>
            </section>

            <Footer navegar={navegar} />

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


// ====== LISTA DE MASCOTAS DEL REFUGIO ======

function ListaMascotas({ mostrar }){

    const [mascotas, setMascotas] = useState([])

    // estado para el modal de confirmación
    const [confirmacion, setConfirmacion] = useState(null)

    useEffect(() => {
        cargar()
    }, [])

    async function cargar(){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/mis-mascotas", {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            setMascotas(data)
        }catch(err){
            console.log("Error:", err)
        }
    }


    async function cambiarEstado(id, nuevoEstado){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/mis-mascotas/" + id + "/estado", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({estado: nuevoEstado})
            })
            const data = await res.json()
            if(!res.ok){
                mostrar(data.mensaje, "error")
                return
            }
            mostrar("Estado actualizado")
            cargar()
        }catch(err){
            mostrar("Error de conexión", "error")
        }
    }


    // pide confirmación al refugio antes de marcar la mascota como adoptada
    function pedirMarcarAdoptada(id){
        setConfirmacion({
            mensaje: "¿Confirmar que esta mascota ha sido adoptada? Esta acción no se puede deshacer.",
            onConfirmar: () => marcarAdoptada(id)
        })
    }

    // ejecuta la actualización en el backend
    async function marcarAdoptada(id){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/mis-mascotas/" + id + "/adoptada", {
                method: "PUT",
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            if(!res.ok){
                mostrar(data.mensaje, "error")
                return
            }
            mostrar("¡Mascota adoptada! Felicidades.")
            cargar()
        }catch(err){
            mostrar("Error de conexión", "error")
        }
    }


    if(mascotas.length === 0){
        return (
            <div className="vacio">
                <p>Aún no has publicado ninguna mascota.</p>
            </div>
        )
    }


    return (
        <>
            <div className="tabla-wrapper">
                <table className="tabla">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Ciudad</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {mascotas.map((m) => (
                        <tr key={m.id}>
                            <td>
                                <img
                                    src={m.imagen ? API + "/img/" + m.imagen : API + "/img/" + m.nombre.toLowerCase() + ".jpg"}
                                    alt={m.nombre}
                                    style={{width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover"}}
                                />
                            </td>
                            <td>{m.nombre}</td>
                            <td>{m.tipo}</td>
                            <td>{m.ciudad}</td>
                            <td>
                                <span className={"badge badge-" + m.estado}>
                                    {m.estado}
                                </span>
                            </td>
                            <td>
                                {/* si está reservada: botón para confirmar adopción.
                                    si está adoptada: ya no se puede cambiar.
                                    en otros casos: selector libre para volver a disponible o pendiente. */}
                                {m.estado === "reservada" ? (
                                    <button
                                        onClick={() => pedirMarcarAdoptada(m.id)}
                                        className="btn btn-acento btn-pequeno">
                                        Marcar como adoptada
                                    </button>
                                ) : m.estado === "adoptado" ? (
                                    <span style={{color: "var(--gris-500)", fontSize: "13px"}}>Cerrada</span>
                                ) : (
                                    <select
                                        value={m.estado}
                                        onChange={(e) => cambiarEstado(m.id, e.target.value)}
                                        className="select-pequeno"
                                    >
                                        <option value="disponible">Disponible</option>
                                        <option value="pendiente">Pendiente</option>
                                    </select>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

            {/* modal de confirmación al marcar como adoptada */}
            {confirmacion && (
                <Confirm
                    mensaje={confirmacion.mensaje}
                    textoConfirmar="Confirmar adopción"
                    onConfirmar={confirmacion.onConfirmar}
                    onCancelar={() => setConfirmacion(null)}
                />
            )}
        </>
    )

}


// ====== LISTA DE SOLICITUDES RECIBIDAS ======

function ListaSolicitudes({ mostrar }){

    const [solicitudes, setSolicitudes] = useState([])

    // controla qué tarjeta está expandida (mostrando todos los datos)
    const [expandida, setExpandida] = useState(null)

    useEffect(() => {
        cargar()
    }, [])

    async function cargar(){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/mis-solicitudes", {
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


    async function cambiarEstado(id, nuevoEstado){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/mis-solicitudes/" + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({estado: nuevoEstado})
            })
            const data = await res.json()
            if(!res.ok){
                mostrar(data.mensaje, "error")
                return
            }
            // mensaje según el nuevo estado
            const mensajes = {
                "en_revision": "Solicitud marcada como en revisión",
                "aprobada": "Solicitud aprobada. La mascota queda reservada.",
                "rechazada": "Solicitud rechazada"
            }
            mostrar(mensajes[nuevoEstado] || "Estado actualizado")
            cargar()
        }catch(err){
            mostrar("Error de conexión", "error")
        }
    }


    // formatea valores para hacerlos legibles (ej: "trabajo_fijo" → "Trabajo fijo")
    function formatear(valor){
        if(valor === null || valor === undefined || valor === "") return "—"
        if(typeof valor === "number") return valor === 1 ? "Sí" : "No"
        // sustituimos guiones bajos por espacios y ponemos primera letra en mayúscula
        const texto = String(valor).replace(/_/g, " ")
        return texto.charAt(0).toUpperCase() + texto.slice(1)
    }


    if(solicitudes.length === 0){
        return (
            <div className="vacio">
                <p>Aún no has recibido ninguna solicitud.</p>
            </div>
        )
    }


    return (
        <div className="solicitudes-lista">

            {solicitudes.map((s) => {

                const estaExpandida = expandida === s.id

                return (
                    <div key={s.id} className="solicitud-tarjeta">

                        {/* CABECERA: información resumida */}
                        <div className="solicitud-cabecera">
                            <div>
                                <h4>{s.nombre_solicitante || s.usuario_nombre}</h4>
                                <p className="solicitud-meta">
                                    Solicita adoptar a <strong>{s.mascota_nombre}</strong>
                                    {" · "}
                                    {new Date(s.fecha).toLocaleDateString("es-ES")}
                                </p>
                            </div>

                            <span className={"badge badge-" + s.estado}>
                                {formatear(s.estado)}
                            </span>
                        </div>

                        {/* botón para mostrar/ocultar los detalles */}
                        <button
                            className="btn-link-pequeno"
                            onClick={() => setExpandida(estaExpandida ? null : s.id)}>
                            {estaExpandida ? "Ocultar datos del adoptante ▲" : "Ver datos del adoptante ▼"}
                        </button>

                        {/* DETALLES (solo se muestran si la tarjeta está expandida) */}
                        {estaExpandida && (
                            <div className="solicitud-detalles">

                                <div className="dato">
                                    <span className="dato-label">Email de contacto</span>
                                    <span className="dato-valor">{s.usuario_email}</span>
                                </div>

                                <div className="dato">
                                    <span className="dato-label">Dirección</span>
                                    <span className="dato-valor">{formatear(s.direccion)}</span>
                                </div>

                                <div className="dato">
                                    <span className="dato-label">Tipo de vivienda</span>
                                    <span className="dato-valor">{formatear(s.tipo_vivienda)}</span>
                                </div>

                                <div className="dato">
                                    <span className="dato-label">Jardín o terraza</span>
                                    <span className="dato-valor">{formatear(s.jardin)}</span>
                                </div>

                                <div className="dato">
                                    <span className="dato-label">Experiencia con mascotas</span>
                                    <span className="dato-valor">{formatear(s.experiencia)}</span>
                                </div>

                                <div className="dato">
                                    <span className="dato-label">Otras mascotas</span>
                                    <span className="dato-valor">{formatear(s.otras_mascotas)}</span>
                                </div>

                                <div className="dato">
                                    <span className="dato-label">Situación laboral</span>
                                    <span className="dato-valor">{formatear(s.situacion_laboral)}</span>
                                </div>

                                <div className="dato dato-ancho">
                                    <span className="dato-label">Motivo de la adopción</span>
                                    <p className="dato-valor">{formatear(s.motivo)}</p>
                                </div>

                            </div>
                        )}

                        {/* ACCIONES: cambian según el estado actual de la solicitud */}
                        <div className="solicitud-acciones">

                            {s.estado === "pendiente" && (
                                <>
                                    <button
                                        onClick={() => cambiarEstado(s.id, "en_revision")}
                                        className="btn btn-ghost btn-pequeno">
                                        Marcar en revisión
                                    </button>
                                    <button
                                        onClick={() => cambiarEstado(s.id, "aprobada")}
                                        className="btn btn-acento btn-pequeno">
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => cambiarEstado(s.id, "rechazada")}
                                        className="btn-peligro btn-pequeno">
                                        Rechazar
                                    </button>
                                </>
                            )}

                            {s.estado === "en_revision" && (
                                <>
                                    <button
                                        onClick={() => cambiarEstado(s.id, "aprobada")}
                                        className="btn btn-acento btn-pequeno">
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => cambiarEstado(s.id, "rechazada")}
                                        className="btn-peligro btn-pequeno">
                                        Rechazar
                                    </button>
                                </>
                            )}

                            {(s.estado === "aprobada" || s.estado === "rechazada") && (
                                <span style={{color: "var(--gris-500)", fontSize: "13px"}}>
                                    Solicitud cerrada
                                </span>
                            )}

                        </div>

                    </div>
                )
            })}

        </div>
    )

}
