import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import Toast from "../components/Toast.jsx"
import Confirm from "../components/Confirm.jsx"

const API = import.meta.env.VITE_API_URL || ""

export default function MisMascotas({ usuario, onLogout, navegar }) {

    const [pestana, setPestana] = useState("mascotas")

    const [toast, setToast] = useState(null)
    function mostrar(texto, tipo = "ok"){
        setToast({ texto, tipo })
    }


    return (
        <>
            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} activo="mis-mascotas" />

            <main id="contenido-principal" tabIndex="-1">

                <section className="seccion" style={{paddingTop: "64px"}} aria-labelledby="mis-mascotas-titulo">
                    <div className="contenedor">

                        <header className="seccion-cabecera" style={{textAlign: "left", maxWidth: "100%", marginBottom: "32px"}}>
                            <span className="eyebrow">Refugio</span>
                            <h1 id="mis-mascotas-titulo">Mis mascotas</h1>
                            <p>Gestiona tus mascotas publicadas y las solicitudes de adopción que recibas.</p>
                        </header>

                        {/* PESTAÑAS con role="tablist" */}
                        <div className="tabs" role="tablist" aria-label="Secciones de gestión">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={pestana === "mascotas"}
                                aria-controls="panel-mascotas"
                                id="tab-mascotas"
                                className={"tab " + (pestana === "mascotas" ? "activo" : "")}
                                onClick={() => setPestana("mascotas")}>
                                Mis mascotas
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={pestana === "solicitudes"}
                                aria-controls="panel-solicitudes"
                                id="tab-solicitudes"
                                className={"tab " + (pestana === "solicitudes" ? "activo" : "")}
                                onClick={() => setPestana("solicitudes")}>
                                Solicitudes recibidas
                            </button>
                        </div>

                        {/* CONTENIDO con role="tabpanel" */}
                        {pestana === "mascotas" && (
                            <div role="tabpanel" id="panel-mascotas" aria-labelledby="tab-mascotas">
                                <ListaMascotas mostrar={mostrar} />
                            </div>
                        )}
                        {pestana === "solicitudes" && (
                            <div role="tabpanel" id="panel-solicitudes" aria-labelledby="tab-solicitudes">
                                <ListaSolicitudes mostrar={mostrar} />
                            </div>
                        )}

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


// ====== LISTA DE MASCOTAS DEL REFUGIO ======

function ListaMascotas({ mostrar }){

    const [mascotas, setMascotas] = useState([])
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


    function pedirMarcarAdoptada(id){
        setConfirmacion({
            mensaje: "¿Confirmar que esta mascota ha sido adoptada? Esta acción no se puede deshacer.",
            onConfirmar: () => marcarAdoptada(id)
        })
    }

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
            <p className="vacio" role="status">Aún no has publicado ninguna mascota.</p>
        )
    }


    return (
        <>
            <div className="tabla-wrapper">
                <table className="tabla">
                    <caption className="sr-only">Listado de mascotas publicadas por el refugio</caption>
                    <thead>
                        <tr>
                            <th scope="col">Imagen</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Tipo</th>
                            <th scope="col">Ciudad</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mascotas.map((m) => (
                            <tr key={m.id}>
                                <td>
                                    <img
                                        src={m.imagen ? API + "/img/" + m.imagen : API + "/img/" + m.nombre.toLowerCase() + ".jpg"}
                                        alt={`Foto de ${m.nombre}`}
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
                                    {m.estado === "reservada" ? (
                                        <button
                                            type="button"
                                            onClick={() => pedirMarcarAdoptada(m.id)}
                                            className="btn btn-acento btn-pequeno">
                                            Marcar como adoptada
                                        </button>
                                    ) : m.estado === "adoptado" ? (
                                        <span style={{color: "var(--gris-500)", fontSize: "13px"}}>Cerrada</span>
                                    ) : (
                                        <>
                                            <label htmlFor={`estado-${m.id}`} className="sr-only">
                                                Estado de {m.nombre}
                                            </label>
                                            <select
                                                id={`estado-${m.id}`}
                                                value={m.estado}
                                                onChange={(e) => cambiarEstado(m.id, e.target.value)}
                                                className="select-pequeno">
                                                <option value="disponible">Disponible</option>
                                                <option value="pendiente">Pendiente</option>
                                            </select>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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


    function formatear(valor){
        if(valor === null || valor === undefined || valor === "") return "—"
        if(typeof valor === "number") return valor === 1 ? "Sí" : "No"
        const texto = String(valor).replace(/_/g, " ")
        return texto.charAt(0).toUpperCase() + texto.slice(1)
    }


    if(solicitudes.length === 0){
        return (
            <p className="vacio" role="status">Aún no has recibido ninguna solicitud.</p>
        )
    }


    return (
        <ul className="solicitudes-lista" aria-label="Solicitudes de adopción recibidas">

            {solicitudes.map((s) => {

                const estaExpandida = expandida === s.id
                const detallesId = `detalles-${s.id}`

                return (
                    <li key={s.id}>
                        <article className="solicitud-tarjeta" aria-labelledby={`sol-${s.id}-titulo`}>

                            <div className="solicitud-cabecera">
                                <div>
                                    <h3 id={`sol-${s.id}-titulo`} style={{fontSize: "16px", margin: "0 0 4px 0"}}>
                                        {s.nombre_solicitante || s.usuario_nombre}
                                    </h3>
                                    <p className="solicitud-meta">
                                        Solicita adoptar a <strong>{s.mascota_nombre}</strong>
                                        {" · "}
                                        <time dateTime={s.fecha}>
                                            {new Date(s.fecha).toLocaleDateString("es-ES")}
                                        </time>
                                    </p>
                                </div>

                                <span className={"badge badge-" + s.estado} aria-label={`Estado: ${formatear(s.estado)}`}>
                                    {formatear(s.estado)}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="btn-link-pequeno"
                                onClick={() => setExpandida(estaExpandida ? null : s.id)}
                                aria-expanded={estaExpandida}
                                aria-controls={detallesId}>
                                {estaExpandida ? "Ocultar datos del adoptante" : "Ver datos del adoptante"}
                                <span aria-hidden="true">{estaExpandida ? " ▲" : " ▼"}</span>
                            </button>

                            {estaExpandida && (
                                <dl id={detallesId} className="solicitud-detalles">

                                    <div className="dato">
                                        <dt className="dato-label">Email de contacto</dt>
                                        <dd className="dato-valor">{s.usuario_email}</dd>
                                    </div>

                                    <div className="dato">
                                        <dt className="dato-label">Dirección</dt>
                                        <dd className="dato-valor">{formatear(s.direccion)}</dd>
                                    </div>

                                    <div className="dato">
                                        <dt className="dato-label">Tipo de vivienda</dt>
                                        <dd className="dato-valor">{formatear(s.tipo_vivienda)}</dd>
                                    </div>

                                    <div className="dato">
                                        <dt className="dato-label">Jardín o terraza</dt>
                                        <dd className="dato-valor">{formatear(s.jardin)}</dd>
                                    </div>

                                    <div className="dato">
                                        <dt className="dato-label">Experiencia con mascotas</dt>
                                        <dd className="dato-valor">{formatear(s.experiencia)}</dd>
                                    </div>

                                    <div className="dato">
                                        <dt className="dato-label">Otras mascotas</dt>
                                        <dd className="dato-valor">{formatear(s.otras_mascotas)}</dd>
                                    </div>

                                    <div className="dato">
                                        <dt className="dato-label">Situación laboral</dt>
                                        <dd className="dato-valor">{formatear(s.situacion_laboral)}</dd>
                                    </div>

                                    <div className="dato dato-ancho">
                                        <dt className="dato-label">Motivo de la adopción</dt>
                                        <dd className="dato-valor">{formatear(s.motivo)}</dd>
                                    </div>

                                </dl>
                            )}

                            <div className="solicitud-acciones">

                                {s.estado === "pendiente" && (
                                    <>
                                        <button type="button" onClick={() => cambiarEstado(s.id, "en_revision")} className="btn btn-ghost btn-pequeno">
                                            Marcar en revisión
                                        </button>
                                        <button type="button" onClick={() => cambiarEstado(s.id, "aprobada")} className="btn btn-acento btn-pequeno">
                                            Aprobar
                                        </button>
                                        <button type="button" onClick={() => cambiarEstado(s.id, "rechazada")} className="btn-peligro btn-pequeno">
                                            Rechazar
                                        </button>
                                    </>
                                )}

                                {s.estado === "en_revision" && (
                                    <>
                                        <button type="button" onClick={() => cambiarEstado(s.id, "aprobada")} className="btn btn-acento btn-pequeno">
                                            Aprobar
                                        </button>
                                        <button type="button" onClick={() => cambiarEstado(s.id, "rechazada")} className="btn-peligro btn-pequeno">
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

                        </article>
                    </li>
                )
            })}

        </ul>
    )

}