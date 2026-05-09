import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import Toast from "../components/Toast.jsx"
import Confirm from "../components/Confirm.jsx"

const API = "http://localhost:3000"


export default function Admin({ usuario, onLogout, navegar }) {

    // pestaña activa: "usuarios", "mascotas" o "solicitudes"
    const [pestana, setPestana] = useState("usuarios")

    // toast compartido por todas las pestañas
    const [toast, setToast] = useState(null)
    function mostrar(texto, tipo = "ok"){
        setToast({ texto, tipo })
    }

    return (
        <div>

            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} />

            <section className="seccion" style={{paddingTop: "64px"}}>
                <div className="contenedor">

                    <div className="seccion-cabecera" style={{textAlign: "left", maxWidth: "100%", marginBottom: "32px"}}>
                        <span className="eyebrow">Administración</span>
                        <h2>Panel de administración</h2>
                        <p>Gestiona usuarios, mascotas y solicitudes de adopción.</p>
                    </div>

                    {/* PESTAÑAS */}
                    <div className="tabs">
                        <button
                            className={"tab " + (pestana === "usuarios" ? "activo" : "")}
                            onClick={() => setPestana("usuarios")}>
                            Usuarios
                        </button>
                        <button
                            className={"tab " + (pestana === "mascotas" ? "activo" : "")}
                            onClick={() => setPestana("mascotas")}>
                            Mascotas
                        </button>
                        <button
                            className={"tab " + (pestana === "solicitudes" ? "activo" : "")}
                            onClick={() => setPestana("solicitudes")}>
                            Solicitudes
                        </button>
                    </div>

                    {/* CONTENIDO SEGÚN PESTAÑA */}
                    {pestana === "usuarios" && <TablaUsuarios mostrar={mostrar} />}
                    {pestana === "mascotas" && <TablaMascotas mostrar={mostrar} />}
                    {pestana === "solicitudes" && <TablaSolicitudes mostrar={mostrar} />}

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


// ====== PESTAÑA USUARIOS ======

function TablaUsuarios({ mostrar }){

    const [usuarios, setUsuarios] = useState([])

    // estado para el modal de confirmación: { mensaje, onConfirmar } o null
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
            // si la respuesta no es un array (porque hubo un error), lo dejamos vacío
            // así la página no se rompe al hacer .map()
            if(Array.isArray(data)){
                setUsuarios(data)
            }else{
                console.log("Error al cargar usuarios:", data)
                setUsuarios([])
            }
        }catch(err){
            console.log("Error:", err)
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

    // abre el modal de confirmación. La eliminación real se hace al confirmar.
    function pedirEliminar(id){
        setConfirmacion({
            mensaje: "¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer.",
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

    return (
        <>
            <div className="tabla-wrapper">
                <table className="tabla">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>CIF</th>
                            <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.nombre}</td>
                            <td>{u.email}</td>
                            <td>
                                <select
                                    value={u.tipo}
                                    onChange={(e) => cambiarRol(u.id, e.target.value)}
                                    className="select-mini"
                                >
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
                                        <button onClick={() => verificar(u.id)} className="btn btn-acento btn-pequeno">
                                            Verificar
                                        </button>
                                    )}
                                    <button onClick={() => pedirEliminar(u.id)} className="btn-peligro">
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

            {/* modal de confirmación al eliminar */}
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

    // estado para el modal de confirmación
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
                console.log("Error al cargar mascotas:", data)
                setMascotas([])
            }
        }catch(err){
            console.log("Error:", err)
            setMascotas([])
        }
    }

    function pedirEliminar(id){
        setConfirmacion({
            mensaje: "¿Seguro que quieres eliminar esta mascota? Esta acción no se puede deshacer.",
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

    return (
        <>
            <div className="tabla-wrapper">
                <table className="tabla">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Raza</th>
                            <th>Ciudad</th>
                            <th>Estado</th>
                            <th>Refugio</th>
                            <th>Acciones</th>
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
                                <button onClick={() => pedirEliminar(m.id)} className="btn-peligro">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

            {/* modal de confirmación al eliminar */}
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
                console.log("Error al cargar solicitudes:", data)
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

    return (
        <div className="tabla-wrapper">
            <table className="tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Mascota</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
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
                            <td>{new Date(s.fecha).toLocaleDateString()}</td>
                            <td>
                                {s.estado === "pendiente" ? (
                                    <div className="acciones-fila">
                                        <button
                                            onClick={() => cambiarEstado(s.id, "aceptada")}
                                            className="btn-mini btn-mini-ok">
                                            Aceptar
                                        </button>
                                        <button
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
