import { useState } from "react"

export default function Navbar({ usuario, onLogout, navegar, activo }) {

    const [abierto, setAbierto] = useState(false)

    function ir(ruta){
        setAbierto(false)
        navegar(ruta)
    }

    return (
        <nav className="navbar">
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
                    <a href="#">Refugios</a>
                    <a href="#">Cómo funciona</a>
                </div>

                <div className="navbar-acciones">

                    {usuario ? (
                        <>
                            {usuario.tipo === "protectora" && (
                                <a href="#nueva-mascota"
                                   className="btn btn-acento"
                                   onClick={(e) => { e.preventDefault(); ir("nueva-mascota") }}>
                                    Añadir mascota
                                </a>
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
