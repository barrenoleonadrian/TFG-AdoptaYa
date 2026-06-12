import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import Toast from "../components/Toast.jsx"
import Confirm from "../components/Confirm.jsx"

const API = import.meta.env.VITE_API_URL || ""


export default function Admin({ usuario, onLogout, navegar }) {

    const [pestana, setPestana] = useState("usuarios")

    const [toast, setToast] = useState(null)
    function mostrar(texto, tipo = "ok"){
        setToast({ texto, tipo })
    }

    return (
        <>
            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} />

            <main id="contenido-principal" tabIndex="-1">

                <section className="seccion" style={{paddingTop: "64px"}} aria-labelledby="admin-titulo">
                    <div className="contenedor">

                        <header className="seccion-cabecera" style={{textAlign: "left", maxWidth: "100%", marginBottom: "32px"}}>
                            <span className="eyebrow">Administración</span>
                            <h1 id="admin-titulo">Panel de administración</h1>
                            <p>Gestiona usuarios, mascotas y solicitudes de adopción.</p>
                        </header>

                        {/* PESTAÑAS con patrón WAI-ARIA */}
                        <div className="tabs" role="tablist" aria-label="Secciones del panel de administración">
                            <button
                                type="button"
                                role="tab"
                                id="tab-admin-usuarios"
                                aria-selected={pestana === "usuarios"}
                                aria-controls="panel-admin-usuarios"
                                className={"tab " + (pestana === "usuarios" ? "activo" : "")}
                                onClick={() => setPestana("usuarios")}>
                                Usuarios
                            </button>
                            <button
                                type="button"
                                role="tab"
                                id="tab-admin-mascotas"
                                aria-selected={pestana === "mascotas"}
                                aria-controls="panel-admin-mascotas"
                                className={"tab " + (pestana === "mascotas" ? "activo" : "")}
                                onClick={() => setPestana("mascotas")}>
                                Mascotas
                            </button>
                            <button
                                type="button"
                                role="tab"
                                id="tab-admin-solicitudes"
                                aria-selected={pestana === "solicitudes"}
                                aria-controls="panel-admin-solicitudes"
                                className={"tab " + (pestana === "solicitudes" ? "activo" : "")}
                                onClick={() => setPestana("solicitudes")}>
                                Solicitudes
                            </button>
                        </div>

                        {pestana === "usuarios" && (
                            <div role="tabpanel" id="panel-admin-usuarios" aria-labelledby="tab-admin-usuarios">
                                <TablaUsuarios mostrar={mostrar} />
                            </div>
                        )}
                        {pestana === "mascotas" && (
                            <div role="tabpanel" id="panel-admin-mascotas" aria-labelledby="tab-admin-mascotas">
                                <TablaMascotas mostrar={mostrar} />
                            </div>
                        )}
                        {pestana === "solicitudes" && (
                            <div role="tabpanel" id="panel-admin-solicitudes" aria-labelledby="tab-admin-solicitudes">
                                <TablaSolicitudes mostrar={mostrar} />
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


// ====== PESTAÑA USUARIOS ======

function TablaUsuarios({ mostrar }){

    const [usuarios, setUsuarios] = useState([])
    const [confirmacion, setConfirmacion] = useState(null)

    useEffect(() => {
        cargar()
    }, [])

    async function cargar(){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/admin/usuarios", {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            if(Array.isArray(data)){
                setUsuarios(data)
            }else{
                setUsuarios([])
            }
        }catch(err){
            setUsuarios([])
        }
    }

    async function cambiarRol(id, nuevoTipo){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/admin/usuarios/" + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({tipo: nuevoTipo})
            })
            const data = await res.json()
            if(!res.ok){
                mostrar(data.mensaje, "error")
                return
            }
            mostrar("Rol actualizado")
            cargar()
        }catch(err){ mostrar("Error de conexión", "error") }
    }

    function pedirEliminar(id, nombre){
        setConfirmacion({
            mensaje: `¿Seguro que quieres eliminar a ${nombre}? Esta acción no se puede deshacer.`,
            onConfirmar: () => eliminar(id)
        })
    }

    async function eliminar(id){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/admin/usuarios/" + id, {
                method: "DELETE",
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            if(!res.ok){
                mostrar(data.mensaje, "error")
                return
            }
            mostrar("Usuario eliminado")
            cargar()
        }catch(err){ mostrar("Error de conexión", "error") }
    }

    async function verificar(id){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/admin/usuarios/" + id + "/verificar", {
                method: "PUT",
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            if(!res.ok){
                mostrar(data.mensaje, "error")
                return
            }
            mostrar("Refugio verificado")
            cargar()
        }catch(err){ mostrar("Error de conexión", "error") }
    }

    if(usuarios.length === 0){
        return <p className="vacio" role="status">No hay usuarios registrados.</p>
    }

    return (
        <>
            <div className="tabla-wrapper">
                <table className="tabla">
                    <caption className="sr-only">Listado de usuarios registrados en la plataforma</caption>
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Email</th>
                            <th scope="col">Rol</th>
                            <th scope="col">CIF</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((u) => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.nombre}</td>
                                <td>{u.email}</td>
                                <td>
                                    <label htmlFor={`rol-${u.id}`} className="sr-only">
                                        Rol de {u.nombre}
                                    </label>
                                    <select
                                        id={`rol-${u.id}`}
                                        value={u.tipo}
                                        onChange={(e) => cambiarRol(u.id, e.target.value)}
                                        className="select-mini">
                                        <option value="adoptante">Usuario</option>
                                        <option value="protectora">Refugio</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>{u.cif || "—"}</td>
                                <td>
                                    {u.tipo === "protectora" ? (
                                        u.verificado ? (
                                            <span className="badge badge-disponible">Verificado</span>
                                        ) : (
                                            <span className="badge badge-pendiente">Pendiente</span>
                                        )
                                    ) : (
                                        <span style={{color: "var(--gris-500)", fontSize: "13px"}}>—</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{display: "flex", gap: "6px"}}>
                                        {u.tipo === "protectora" && !u.verificado && (
                                            <button
                                                type="button"
                                                onClick={() => verificar(u.id)}
                                                className="btn btn-acento btn-pequeno">
                                                Verificar
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => pedirEliminar(u.id, u.nombre)}
                                            className="btn-peligro"
                                            aria-label={`Eliminar usuario ${u.nombre}`}>
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {confirmacion && (
                <Confirm
                    mensaje={confirmacion.mensaje}
                    textoConfirmar="Eliminar"
                    onConfirmar={confirmacion.onConfirmar}
                    onCancelar={() => setConfirmacion(null)}
                />
            )}
        </>
    )

}


// ====== PESTAÑA MASCOTAS ======

function TablaMascotas({ mostrar }){

    const [mascotas, setMascotas] = useState([])
    const [confirmacion, setConfirmacion] = useState(null)

    useEffect(() => {
        cargar()
    }, [])

    async function cargar(){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/admin/mascotas", {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            if(Array.isArray(data)){
                setMascotas(data)
            }else{
                setMascotas([])
            }
        }catch(err){
            setMascotas([])
        }
    }

    function pedirEliminar(id, nombre){
        setConfirmacion({
            mensaje: `¿Seguro que quieres eliminar a ${nombre}? Esta acción no se puede deshacer.`,
            onConfirmar: () => eliminar(id)
        })
    }

    async function eliminar(id){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/admin/mascotas/" + id, {
                method: "DELETE",
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            if(!res.ok){
                mostrar(data.mensaje, "error")
                return
            }
            mostrar("Mascota eliminada")
            cargar()
        }catch(err){ mostrar("Error de conexión", "error") }
    }

    if(mascotas.length === 0){
        return <p className="vacio" role="status">No hay mascotas publicadas.</p>
    }

    return (
        <>
            <div className="tabla-wrapper">
                <table className="tabla">
                    <caption className="sr-only">Listado de mascotas publicadas en la plataforma</caption>
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Tipo</th>
                            <th scope="col">Raza</th>
                            <th scope="col">Ciudad</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Refugio</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mascotas.map((m) => (
                            <tr key={m.id}>
                                <td>{m.id}</td>
                                <td>{m.nombre}</td>
                                <td>{m.tipo}</td>
                                <td>{m.raza}</td>
                                <td>{m.ciudad}</td>
                                <td>
                                    <span className={"badge-mini badge-" + m.estado}>
                                        {m.estado}
                                    </span>
                                </td>
                                <td>{m.refugio_nombre || "—"}</td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => pedirEliminar(m.id, m.nombre)}
                                        className="btn-peligro"
                                        aria-label={`Eliminar mascota ${m.nombre}`}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {confirmacion && (
                <Confirm
                    mensaje={confirmacion.mensaje}
                    textoConfirmar="Eliminar"
                    onConfirmar={confirmacion.onConfirmar}
                    onCancelar={() => setConfirmacion(null)}
                />
            )}
        </>
    )

}


// ====== PESTAÑA SOLICITUDES ======

function TablaSolicitudes({ mostrar }){

    const [solicitudes, setSolicitudes] = useState([])

    useEffect(() => {
        cargar()
    }, [])

    async function cargar(){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/admin/solicitudes", {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            if(Array.isArray(data)){
                setSolicitudes(data)
            }else{
                setSolicitudes([])
            }
        }catch(err){
            setSolicitudes([])
        }
    }

    async function cambiarEstado(id, nuevoEstado){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/admin/solicitudes/" + id, {
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
            mostrar(nuevoEstado === "aceptada" ? "Solicitud aceptada" : "Solicitud rechazada")
            cargar()
        }catch(err){ mostrar("Error de conexión", "error") }
    }

    if(solicitudes.length === 0){
        return <p className="vacio" role="status">No hay solicitudes registradas.</p>
    }

    return (
        <div className="tabla-wrapper">
            <table className="tabla">
                <caption className="sr-only">Listado de solicitudes de adopción de la plataforma</caption>
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Usuario</th>
                        <th scope="col">Email</th>
                        <th scope="col">Mascota</th>
                        <th scope="col">Estado</th>
                        <th scope="col">Fecha</th>
                        <th scope="col">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitudes.map((s) => (
                        <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{s.usuario_nombre}</td>
                            <td>{s.usuario_email}</td>
                            <td>{s.mascota_nombre}</td>
                            <td>
                                <span className={"badge-mini badge-" + s.estado}>
                                    {s.estado}
                                </span>
                            </td>
                            <td>
                                <time dateTime={s.fecha}>
                                    {new Date(s.fecha).toLocaleDateString("es-ES")}
                                </time>
                            </td>
                            <td>
                                {s.estado === "pendiente" ? (
                                    <div className="acciones-fila">
                                        <button
                                            type="button"
                                            onClick={() => cambiarEstado(s.id, "aceptada")}
                                            className="btn-mini btn-mini-ok">
                                            Aceptar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => cambiarEstado(s.id, "rechazada")}
                                            className="btn-mini btn-mini-no">
                                            Rechazar
                                        </button>
                                    </div>
                                ) : (
                                    <span style={{color: "var(--gris-500)", fontSize: "13px"}}>—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

}