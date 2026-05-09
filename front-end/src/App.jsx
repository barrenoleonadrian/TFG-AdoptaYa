import { useState, useEffect } from "react"
import Home from "./pages/Home.jsx"
import Adoptar from "./pages/Adoptar.jsx"
import Mascota from "./pages/Mascota.jsx"
import Login from "./pages/Login.jsx"
import NuevaMascota from "./pages/NuevaMascota.jsx"
import Admin from "./pages/Admin.jsx"
import Refugios from "./pages/Refugios.jsx"
import MiRefugio from "./pages/MiRefugio.jsx"
import MisMascotas from "./pages/MisMascotas.jsx"
import MisSolicitudes from "./pages/MisSolicitudes.jsx"
import Mensajes from "./pages/Mensajes.jsx"

// Router sencillo hecho con useState.
// La ruta es un string tipo "home", "adoptar", "login", "mascota", "nueva-mascota"
// y se guarda en la URL con location.hash para poder refrescar sin perderla.

export default function App() {

    // lee la ruta inicial del hash (ej: "#adoptar" → "adoptar")
    const [ruta, setRuta] = useState(window.location.hash.replace("#", "") || "home")

    // parámetro extra (usado sobre todo para el id de la mascota)
    const [param, setParam] = useState(null)

    // usuario logueado (se guarda en localStorage)
    const [usuario, setUsuario] = useState(() => {
        const guardado = localStorage.getItem("usuario")
        return guardado ? JSON.parse(guardado) : null
    })


    // sincroniza el hash con el estado cuando el usuario navega
    useEffect(() => {
        function handleHash(){
            const hash = window.location.hash.replace("#", "")
            if(hash.startsWith("mascota/")){
                setRuta("mascota")
                setParam(hash.split("/")[1])
            }else{
                setRuta(hash || "home")
                setParam(null)
            }
        }
        window.addEventListener("hashchange", handleHash)
        handleHash()
        return () => window.removeEventListener("hashchange", handleHash)
    }, [])


    // función para navegar desde cualquier componente
    function navegar(nuevaRuta, nuevoParam){
        if(nuevoParam){
            window.location.hash = nuevaRuta + "/" + nuevoParam
        }else{
            window.location.hash = nuevaRuta
        }
    }


    // login: guarda usuario y token
    function hacerLogin(data){
        localStorage.setItem("usuario", JSON.stringify(data.usuario))
        localStorage.setItem("token", data.token)
        setUsuario(data.usuario)
    }


    // cierra sesión
    function hacerLogout(){
        localStorage.removeItem("usuario")
        localStorage.removeItem("token")
        setUsuario(null)
        navegar("home")
    }


    // decide qué página mostrar y la guarda en una variable
    let pagina

    if(ruta === "adoptar"){
        pagina = <Adoptar usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }
    else if(ruta === "mascota"){
        pagina = <Mascota id={param} usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }
    else if(ruta === "login"){
        pagina = <Login onLogin={hacerLogin} navegar={navegar} />
    }
    else if(ruta === "nueva-mascota"){
        // si no eres refugio, te mandamos al home
        if(!usuario || usuario.tipo !== "protectora"){
            navegar("home")
            return null
        }
        pagina = <NuevaMascota usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }
    else if(ruta === "admin"){
        // solo el admin puede entrar
        if(!usuario || usuario.tipo !== "admin"){
            navegar("home")
            return null
        }
        pagina = <Admin usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }
    else if(ruta === "refugios"){
        pagina = <Refugios usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }
    else if(ruta === "mi-refugio"){
        // solo los refugios pueden editar su perfil
        if(!usuario || usuario.tipo !== "protectora"){
            navegar("home")
            return null
        }
        pagina = <MiRefugio usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }
    else if(ruta === "mis-mascotas"){
        // solo los refugios pueden ver sus mascotas y solicitudes
        if(!usuario || usuario.tipo !== "protectora"){
            navegar("home")
            return null
        }
        pagina = <MisMascotas usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }
    else if(ruta === "mis-solicitudes"){
        // solo los adoptantes pueden ver sus solicitudes
        if(!usuario || usuario.tipo !== "adoptante"){
            navegar("home")
            return null
        }
        pagina = <MisSolicitudes usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }
    else if(ruta === "mensajes"){
        // solo los usuarios logueados pueden ver mensajes
        if(!usuario){
            navegar("login")
            return null
        }

        // si venimos de una mascota con un refugio para contactar,
        // lo recogemos del sessionStorage
        let contactarCon = null
        const guardado = sessionStorage.getItem("contactarCon")
        if(guardado){
            contactarCon = JSON.parse(guardado)
            sessionStorage.removeItem("contactarCon")
        }

        pagina = <Mensajes usuario={usuario} onLogout={hacerLogout} navegar={navegar} contactarCon={contactarCon} />
    }
    else {
        // por defecto → home
        pagina = <Home usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }


    // devolvemos la página seleccionada
    return pagina

}
