import { useState, useEffect, useRef } from "react"

const API = "http://localhost:3000"

export default function Navbar({ usuario, onLogout, navegar, activo }) {

    const [scrolleado, setScrolleado] = useState(false)
    const [sinLeer, setSinLeer] = useState(0)

    // si el menú de usuario está abierto
    const [menuAbierto, setMenuAbierto] = useState(false)
    const menuRef = useRef(null)


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


    // cerrar el menú al hacer clic fuera
    useEffect(() => {
        function clicFuera(e){
            if(menuRef.current && !menuRef.current.contains(e.target)){
                setMenuAbierto(false)
            }
        }
        document.addEventListener("mousedown", clicFuera)
        return () => document.removeEventListener("mousedown", clicFuera)
    }, [])


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
        setMenuAbierto(false)
        navegar(ruta)
    }


    // primera letra del nombre, para el avatar
    const inicial = usuario ? usuario.nombre.charAt(0).toUpperCase() : ""


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
                </div>

                <div className="navbar-acciones">

                    {usuario ? (
                        <>
                            {/* enlace mensajes con badge */}
                            <a href="#mensajes"
                               className={"nav-mensajes-link " + (activo === "mensajes" ? "activo" : "")}
                               onClick={(e) => { e.preventDefault(); ir("mensajes") }}>
                                Mensajes
                                {sinLeer > 0 && <span className="nav-badge">{sinLeer}</span>}
                            </a>

                            {/* botón principal: añadir mascota (solo refugios) */}
                            {usuario.tipo === "protectora" && (
                                <a href="#nueva-mascota"
                                   className="btn btn-acento btn-pequeno"
                                   onClick={(e) => { e.preventDefault(); ir("nueva-mascota") }}>
                                    + Añadir mascota
                                </a>
                            )}

                            {/* avatar con menú desplegable */}
                            <div className="menu-usuario" ref={menuRef}>

                                <button
                                    className="avatar-boton"
                                    onClick={() => setMenuAbierto(!menuAbierto)}>
                                    {inicial}
                                </button>

                                {menuAbierto && (
                                    <div className="menu-desplegable">

                                        <div className="menu-cabecera">
                                            <p className="menu-nombre">{usuario.nombre}</p>
                                            <p className="menu-tipo">{usuario.tipo}</p>
                                        </div>

                                        <div className="menu-separador"></div>

                                        {usuario.tipo === "protectora" && (
                                            <>
                                                <a href="#mi-refugio"
                                                   className="menu-item"
                                                   onClick={(e) => { e.preventDefault(); ir("mi-refugio") }}>
                                                    Mi refugio
                                                </a>
                                                <a href="#mis-mascotas"
                                                   className="menu-item"
                                                   onClick={(e) => { e.preventDefault(); ir("mis-mascotas") }}>
                                                    Mis mascotas
                                                </a>
                                                <div className="menu-separador"></div>
                                            </>
                                        )}

                                        {usuario.tipo === "adoptante" && (
                                            <>
                                                <a href="#mis-solicitudes"
                                                   className="menu-item"
                                                   onClick={(e) => { e.preventDefault(); ir("mis-solicitudes") }}>
                                                    Mis solicitudes
                                                </a>
                                                <div className="menu-separador"></div>
                                            </>
                                        )}

                                        {usuario.tipo === "admin" && (
                                            <>
                                                <a href="#admin"
                                                   className="menu-item"
                                                   onClick={(e) => { e.preventDefault(); ir("admin") }}>
                                                    Panel de administración
                                                </a>
                                                <div className="menu-separador"></div>
                                            </>
                                        )}

                                        <button onClick={onLogout} className="menu-item menu-salir">
                                            Cerrar sesión
                                        </button>

                                    </div>
                                )}

                            </div>
                        </>
                    ) : (
                        <>
                            <a href="#login"
                               className="btn-link"
                               onClick={(e) => { e.preventDefault(); ir("login") }}>
                                Iniciar sesión
                            </a>
                            <a href="#login"
                               className="btn btn-primario btn-pequeno"
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
