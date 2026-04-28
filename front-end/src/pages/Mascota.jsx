import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"

const API = "http://localhost:3000"


function getImagenURL(m){
    if(m.imagen){
        return API + "/img/" + m.imagen
    }
    return API + "/img/" + m.nombre.toLowerCase() + ".jpg"
}


export default function Mascota({ id, usuario, onLogout, navegar }) {

    const [mascota, setMascota] = useState(null)


    useEffect(() => {
        cargarMascota()
    }, [id])


    async function cargarMascota(){
        try{
            const res = await fetch(API + "/mascotas/" + id)
            const data = await res.json()
            setMascota(data)
        }catch(err){
            console.log("Error:", err)
        }
    }


    async function adoptar(){

        if(!usuario){
            alert("Debes iniciar sesión para adoptar")
            sessionStorage.setItem("volver", "mascota/" + id)
            navegar("login")
            return
        }

        if(usuario.tipo !== "adoptante"){
            alert("Solo los usuarios normales pueden adoptar")
            return
        }

        try{

            const token = localStorage.getItem("token")

            const res = await fetch(API + "/mascotas/" + id + "/adoptar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            })

            const data = await res.json()

            if(res.ok){
                alert("¡Solicitud enviada! El refugio se pondrá en contacto contigo.")
            }else{
                alert(data.mensaje || "Error al enviar la solicitud")
            }

        }catch(err){
            alert("Error de conexión")
        }

    }


    // contacta con el refugio que publicó esta mascota
    function contactar(){

        if(!usuario){
            alert("Debes iniciar sesión para contactar con el refugio")
            sessionStorage.setItem("volver", "mascota/" + id)
            navegar("login")
            return
        }

        if(usuario.tipo !== "adoptante"){
            alert("Solo los adoptantes pueden contactar con los refugios")
            return
        }

        // pasamos al chat directamente con el dueño de la mascota
        // (necesitamos saber su nombre, lo buscamos en el detalle)
        sessionStorage.setItem("contactarCon", JSON.stringify({
            id: mascota.usuario_id,
            nombre: "Refugio"   // el nombre real lo cargará cuando lo busque
        }))
        navegar("mensajes")

    }


    return (
        <div>

            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} />

            <section className="seccion" style={{paddingTop: "48px"}}>
                <div className="contenedor">

                    <a href="#adoptar" className="volver"
                       onClick={(e) => { e.preventDefault(); navegar("adoptar") }}>
                        ← Volver a adoptar
                    </a>

                    {!mascota ? (
                        <p className="vacio">Cargando...</p>
                    ) : (
                        <div className="detalle">

                            <div className="detalle-img">
                                <img src={getImagenURL(mascota)} alt={mascota.nombre} />
                            </div>

                            <div className="detalle-datos">

                                <span className="badge">{mascota.estado}</span>

                                <h1>{mascota.nombre}</h1>
                                <p className="detalle-meta">{mascota.raza} · {mascota.ciudad}</p>

                                <ul className="detalle-datos-lista">
                                    <li className="detalle-dato">
                                        <span className="etiqueta">Tipo</span>
                                        <span className="valor">{mascota.tipo}</span>
                                    </li>
                                    <li className="detalle-dato">
                                        <span className="etiqueta">Sexo</span>
                                        <span className="valor">{mascota.sexo}</span>
                                    </li>
                                    <li className="detalle-dato">
                                        <span className="etiqueta">Edad</span>
                                        <span className="valor">{mascota.edad} años</span>
                                    </li>
                                    <li className="detalle-dato">
                                        <span className="etiqueta">Ciudad</span>
                                        <span className="valor">{mascota.ciudad}</span>
                                    </li>
                                </ul>

                                {mascota.descripcion && (
                                    <p className="detalle-descripcion">{mascota.descripcion}</p>
                                )}

                                <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>
                                    <button onClick={adoptar} className="btn btn-acento btn-grande">
                                        Solicitar adopción →
                                    </button>
                                    <button onClick={contactar} className="btn btn-ghost btn-grande">
                                        Contactar con el refugio
                                    </button>
                                </div>

                            </div>

                        </div>
                    )}

                </div>
            </section>

            <Footer navegar={navegar} />

        </div>
    )
}
