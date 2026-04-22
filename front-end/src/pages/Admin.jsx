import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"

const API = "http://localhost:3000"


export default function Admin({ usuario, onLogout, navegar }) {

    // pestaña activa: "usuarios", "mascotas" o "solicitudes"
    const [pestana, setPestana] = useState("usuarios")

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
                    {pestana === "usuarios" && <TablaUsuarios />}
                    {pestana === "mascotas" && <TablaMascotas />}
                    {pestana === "solicitudes" && <TablaSolicitudes />}

                </div>
            </section>

            <Footer navegar={navegar} />

        </div>
    )
}


// ====== PESTAÑA USUARIOS ======

function TablaUsuarios(){

    const [usuarios, setUsuarios] = useState([])

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
            setUsuarios(data)
        }catch(err){
            console.log("Error:", err)
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
                alert(data.mensaje)
                return
            }
            cargar()
        }catch(err){ alert("Error de conexión") }
    }

    async function eliminar(id){
        if(!confirm("¿Seguro que quieres eliminar este usuario?")) return
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/admin/usuarios/" + id, {
                method: "DELETE",
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            if(!res.ok){
                alert(data.mensaje)
                return
            }
            cargar()
        }catch(err){ alert("Error de conexión") }
    }

    return (
        <div className="tabla-wrapper">
            <table className="tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Ciudad</th>
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
                            <td>{u.ciudad || "—"}</td>
                            <td>
                                <button onClick={() => eliminar(u.id)} className="btn-peligro">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

}


// ====== PESTAÑA MASCOTAS ======

function TablaMascotas(){

    const [mascotas, setMascotas] = useState([])

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
            setMascotas(data)
        }catch(err){ console.log("Error:", err) }
    }

    async function eliminar(id){
        if(!confirm("¿Seguro que quieres eliminar esta mascota?")) return
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/admin/mascotas/" + id, {
                method: "DELETE",
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            if(!res.ok){
                alert(data.mensaje)
                return
            }
            cargar()
        }catch(err){ alert("Error de conexión") }
    }

    return (
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
                                <button onClick={() => eliminar(m.id)} className="btn-peligro">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

}


// ====== PESTAÑA SOLICITUDES ======

function TablaSolicitudes(){

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
            setSolicitudes(data)
        }catch(err){ console.log("Error:", err) }
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
                alert(data.mensaje)
                return
            }
            cargar()
        }catch(err){ alert("Error de conexión") }
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
