import { useState, useEffect, useRef } from "react"
import Notificaciones from "./Notificaciones.jsx"

const API = import.meta.env.VITE_API_URL || ""

export default function Navbar({ usuario, onLogout, navegar, activo }) {

    const [scrolleado, setScrolleado] = useState(false)
    const [sinLeer, setSinLeer] = useState(0)
    const [menuAbierto, setMenuAbierto] = useState(false)

    const menuRef = useRef(null)
    const botonMenuRef = useRef(null)


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


    // cerrar el menú al hacer clic fuera o al pulsar Escape.
    // Cuando se cierra con Escape devolvemos el foco al botón del menú
    // para que el usuario no pierda la posición de navegación con teclado.
    useEffect(() => {

        function clicFuera(e){
            if(menuRef.current && !menuRef.current.contains(e.target)){
                setMenuAbierto(false)
            }
        }

        function teclaPulsada(e){
            if(e.key === "Escape" && menuAbierto){
                setMenuAbierto(false)
                if(botonMenuRef.current){
                    botonMenuRef.current.focus()
                }
            }
        }

        document.addEventListener("mousedown", clicFuera)
        document.addEventListener("keydown", teclaPulsada)

        return () => {
            document.removeEventListener("mousedown", clicFuera)
            document.removeEventListener("keydown", teclaPulsada)
        }

    }, [menuAbierto])


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


    const inicial = usuario ? usuario.nombre.charAt(0).toUpperCase() : ""


    return (
        <>
            {/* skip link: aparece al pulsar Tab al inicio de la página y
                permite saltarse el navbar para ir directo al contenido.
                Es un estándar de accesibilidad (WCAG 2.4.1). */}
            <a href="#contenido-principal" className="skip-link">
                Saltar al contenido principal
            </a>

            <header className={"navbar " + (scrolleado ? "scrolleada" : "")}>

                <nav className="navbar-inner" aria-label="Navegación principal">

                    <a href="#home"
                       className="logo"
                       onClick={(e) => { e.preventDefault(); ir("home") }}
                       aria-label="AdoptaYa, ir a la página de inicio">
                        <img src="/img/logo.png" alt="" />
                        Adopta<span>Ya</span>
                    </a>

                    <ul className="navbar-links">
                        <li>
                            <a href="#home"
                               className={activo === "home" ? "activo" : ""}
                               onClick={(e) => { e.preventDefault(); ir("home") }}
                               aria-current={activo === "home" ? "page" : undefined}>
                                Inicio
                            </a>
                        </li>
                        <li>
                            <a href="#adoptar"
                               className={activo === "adoptar" ? "activo" : ""}
                               onClick={(e) => { e.preventDefault(); ir("adoptar") }}
                               aria-current={activo === "adoptar" ? "page" : undefined}>
                                Adoptar
                            </a>
                        </li>
                        <li>
                            <a href="#refugios"
                               className={activo === "refugios" ? "activo" : ""}
                               onClick={(e) => { e.preventDefault(); ir("refugios") }}
                               aria-current={activo === "refugios" ? "page" : undefined}>
                                Refugios
                            </a>
                        </li>
                    </ul>

                    <div className="navbar-acciones">

                        {usuario ? (
                            <>
                                <Notificaciones usuario={usuario} navegar={ir} />
                                
                                <a href="#mensajes"
                                   className={"nav-mensajes-link " + (activo === "mensajes" ? "activo" : "")}
                                   onClick={(e) => { e.preventDefault(); ir("mensajes") }}
                                   aria-current={activo === "mensajes" ? "page" : undefined}
                                   aria-label={sinLeer > 0
                                       ? `Mensajes, ${sinLeer} sin leer`
                                       : "Mensajes"}>
                                    Mensajes
                                    {sinLeer > 0 && (
                                        <span className="nav-badge" aria-hidden="true">{sinLeer}</span>
                                    )}
                                </a>

                                {usuario.tipo === "protectora" && (
                                    <a href="#nueva-mascota"
                                       className="btn btn-acento btn-pequeno"
                                       onClick={(e) => { e.preventDefault(); ir("nueva-mascota") }}>
                                        + Añadir mascota
                                    </a>
                                )}

                                <div className="menu-usuario" ref={menuRef}>

                                    <button
                                        ref={botonMenuRef}
                                        type="button"
                                        className="avatar-boton"
                                        onClick={() => setMenuAbierto(!menuAbierto)}
                                        aria-label={`Menú de usuario, ${usuario.nombre}`}
                                        aria-haspopup="menu"
                                        aria-expanded={menuAbierto}>
                                        <span aria-hidden="true">{inicial}</span>
                                    </button>

                                    {menuAbierto && (
                                        <div className="menu-desplegable" role="menu">

                                            <div className="menu-cabecera">
                                                <p className="menu-nombre">{usuario.nombre}</p>
                                                <p className="menu-tipo">{usuario.tipo}</p>
                                            </div>

                                            <div className="menu-separador" aria-hidden="true"></div>

                                            {usuario.tipo === "protectora" && (
                                                <>
                                                    <a href="#mi-refugio"
                                                       className="menu-item"
                                                       role="menuitem"
                                                       onClick={(e) => { e.preventDefault(); ir("mi-refugio") }}>
                                                        Mi refugio
                                                    </a>
                                                    <a href="#mis-mascotas"
                                                       className="menu-item"
                                                       role="menuitem"
                                                       onClick={(e) => { e.preventDefault(); ir("mis-mascotas") }}>
                                                        Mis mascotas
                                                    </a>
                                                    <div className="menu-separador" aria-hidden="true"></div>
                                                </>
                                            )}

                                            {usuario.tipo === "adoptante" && (
                                                <>
                                                    <a href="#mis-favoritos"
                                                    className="menu-item"
                                                    role="menuitem"
                                                    onClick={(e) => { e.preventDefault(); ir("mis-favoritos") }}>
                                                        Mis favoritos
                                                    </a>
                                                    <a href="#mis-solicitudes"
                                                    className="menu-item"
                                                    role="menuitem"
                                                    onClick={(e) => { e.preventDefault(); ir("mis-solicitudes") }}>
                                                        Mis solicitudes
                                                    </a>
                                                    <div className="menu-separador" aria-hidden="true"></div>
                                                </>
                                            )}

                                            {usuario.tipo === "admin" && (
                                                <>
                                                    <a href="#admin"
                                                       className="menu-item"
                                                       role="menuitem"
                                                       onClick={(e) => { e.preventDefault(); ir("admin") }}>
                                                        Panel de administración
                                                    </a>
                                                    <div className="menu-separador" aria-hidden="true"></div>
                                                </>
                                            )}

                                            <button
                                                type="button"
                                                onClick={onLogout}
                                                role="menuitem"
                                                className="menu-item menu-salir">
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

                </nav>

            </header>
        </>
    )
}