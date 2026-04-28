import { useState, useEffect } from "react"

const API = "http://localhost:3000"

export default function Navbar({ usuario, onLogout, navegar, activo }) {

    const [abierto, setAbierto] = useState(false)
    const [scrolleado, setScrolleado] = useState(false)
    const [sinLeer, setSinLeer] = useState(0)


    // detectamos el scroll para añadir una sombra sutil al navbar
    useEffect(() => {
        function handleScroll(){
            setScrolleado(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])


    // comprobamos cada 30 segundos cuántos mensajes sin leer hay
    useEffect(() => {
        if(!usuario) return

        comprobarMensajes()
        const intervalo = setInterval(comprobarMensajes, 30000)
        return () => clearInterval(intervalo)
    }, [usuario])


    async function comprobarMensajes(){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/mensajes/sin-leer", {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            setSinLeer(data.total || 0)
        }catch(err){
            // ignoramos errores aquí
        }
    }


    function ir(ruta){
        setAbierto(false)
        navegar(ruta)
    }

    return (
        <nav className={"navbar " + (scrolleado ? "scrolleada" : "")}>
            <div className="navbar-inner">

                <a href="#home" className="logo" onClick={(e) => { e.preventDefault(); ir("home") }}>
                    <img src="/img/logo.png" alt="" />
                    Adopta<span>Ya</span>
                </a>

                <div className="navbar-links">
                    <a href="#home"
                       className={activo === "home" ? "activo" : ""}
                       onClick={(e) => { e.preventDefault(); ir("home") }}>
                        Inicio
                    </a>
                    <a href="#adoptar"
                       className={activo === "adoptar" ? "activo" : ""}
                       onClick={(e) => { e.preventDefault(); ir("adoptar") }}>
                        Adoptar
                    </a>
                    <a href="#refugios"
                       className={activo === "refugios" ? "activo" : ""}
                       onClick={(e) => { e.preventDefault(); ir("refugios") }}>
                        Refugios
                    </a>
                    <a href="#">Cómo funciona</a>
                </div>

                <div className="navbar-acciones">

                    {usuario ? (
                        <>
                            <a href="#mensajes"
                               className={"btn-link nav-mensajes " + (activo === "mensajes" ? "activo" : "")}
                               onClick={(e) => { e.preventDefault(); ir("mensajes") }}>
                                Mensajes
                                {sinLeer > 0 && <span className="nav-badge">{sinLeer}</span>}
                            </a>

                            {usuario.tipo === "protectora" && (
                                <>
                                    <a href="#mi-refugio"
                                       className="btn-link"
                                       onClick={(e) => { e.preventDefault(); ir("mi-refugio") }}>
                                        Mi refugio
                                    </a>
                                    <a href="#nueva-mascota"
                                       className="btn btn-acento"
                                       onClick={(e) => { e.preventDefault(); ir("nueva-mascota") }}>
                                        Añadir mascota
                                    </a>
                                </>
                            )}
                            {usuario.tipo === "admin" && (
                                <a href="#admin"
                                   className="btn btn-acento"
                                   onClick={(e) => { e.preventDefault(); ir("admin") }}>
                                    Panel admin
                                </a>
                            )}
                            <span className="navbar-hola">Hola, {usuario.nombre}</span>
                            <button onClick={onLogout} className="btn-link">
                                Salir
                            </button>
                        </>
                    ) : (
                        <>
                            <a href="#login"
                               className="btn-link"
                               onClick={(e) => { e.preventDefault(); ir("login") }}>
                                Iniciar sesión
                            </a>
                            <a href="#login"
                               className="btn btn-primario"
                               onClick={(e) => { e.preventDefault(); ir("login") }}>
                                Regístrate
                            </a>
                        </>
                    )}

                </div>

            </div>
        </nav>
    )
}
