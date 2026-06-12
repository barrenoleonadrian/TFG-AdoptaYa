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
import MisFavoritos from "./pages/MisFavoritos.jsx"

// Router sencillo hecho con useState.
// La ruta es un string tipo "home", "adoptar", "login", "mascota", "nueva-mascota"
// y se guarda en la URL con location.hash para poder refrescar sin perderla.

export default function App() {

    const [ruta, setRuta] = useState(window.location.hash.replace("#", "") || "home")
    const [param, setParam] = useState(null)

    const [usuario, setUsuario] = useState(() => {
        const guardado = localStorage.getItem("usuario")
        return guardado ? JSON.parse(guardado) : null
    })


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


    function navegar(nuevaRuta, nuevoParam){
        if(nuevoParam){
            window.location.hash = nuevaRuta + "/" + nuevoParam
        }else{
            window.location.hash = nuevaRuta
        }
    }


    function hacerLogin(data){
        localStorage.setItem("usuario", JSON.stringify(data.usuario))
        localStorage.setItem("token", data.token)
        setUsuario(data.usuario)
    }


    function hacerLogout(){
        localStorage.removeItem("usuario")
        localStorage.removeItem("token")
        setUsuario(null)
        navegar("home")
    }


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
        if(!usuario || usuario.tipo !== "protectora"){
            navegar("home")
            return null
        }
        pagina = <NuevaMascota usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }
    else if(ruta === "admin"){
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
        if(!usuario || usuario.tipo !== "protectora"){
            navegar("home")
            return null
        }
        pagina = <MiRefugio usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }
    else if(ruta === "mis-mascotas"){
        if(!usuario || usuario.tipo !== "protectora"){
            navegar("home")
            return null
        }
        pagina = <MisMascotas usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }
    else if(ruta === "mis-solicitudes"){
        if(!usuario || usuario.tipo !== "adoptante"){
            navegar("home")
            return null
        }
        pagina = <MisSolicitudes usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }
    else if(ruta === "mis-favoritos"){
        if(!usuario || usuario.tipo !== "adoptante"){
            navegar("home")
            return null
        }
        pagina = <MisFavoritos usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }
    else if(ruta === "mensajes"){
        if(!usuario){
            navegar("login")
            return null
        }

        let contactarCon = null
        const guardado = sessionStorage.getItem("contactarCon")
        if(guardado){
            contactarCon = JSON.parse(guardado)
            sessionStorage.removeItem("contactarCon")
        }

        pagina = <Mensajes usuario={usuario} onLogout={hacerLogout} navegar={navegar} contactarCon={contactarCon} />
    }
    else {
        pagina = <Home usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }


    // devolvemos la página seleccionada.
    // Cada página renderiza su propio Navbar y Footer.
    // El skip link del Navbar enlaza a #contenido-principal,
    // que está en el <main> de cada página.
    return pagina

}