import { useState, useEffect } from "react"
import Home from "./pages/Home.jsx"
import Adoptar from "./pages/Adoptar.jsx"
import Mascota from "./pages/Mascota.jsx"
import Login from "./pages/Login.jsx"
import NuevaMascota from "./pages/NuevaMascota.jsx"
import Admin from "./pages/Admin.jsx"

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


    // decide qué página mostrar
    if(ruta === "adoptar"){
        return <Adoptar usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }

    if(ruta === "mascota"){
        return <Mascota id={param} usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }

    if(ruta === "login"){
        return <Login onLogin={hacerLogin} navegar={navegar} />
    }

    if(ruta === "nueva-mascota"){
        // si no eres refugio, te mandamos al home
        if(!usuario || usuario.tipo !== "protectora"){
            navegar("home")
            return null
        }
        return <NuevaMascota usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }

    if(ruta === "admin"){
        // solo el admin puede entrar
        if(!usuario || usuario.tipo !== "admin"){
            navegar("home")
            return null
        }
        return <Admin usuario={usuario} onLogout={hacerLogout} navegar={navegar} />
    }

    // por defecto → home
    return <Home usuario={usuario} onLogout={hacerLogout} navegar={navegar} />

}
