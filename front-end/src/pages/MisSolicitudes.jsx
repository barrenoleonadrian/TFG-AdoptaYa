import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"

const API = import.meta.env.VITE_API_URL || ""


// Página donde los adoptantes ven sus solicitudes enviadas y el estado de cada una.
export default function MisSolicitudes({ usuario, onLogout, navegar }) {

    const [solicitudes, setSolicitudes] = useState([])

    useEffect(() => {
        cargar()
    }, [])

    async function cargar(){
        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/mis-solicitudes-adoptante", {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()
            if(Array.isArray(data)){
                setSolicitudes(data)
            }else{
                setSolicitudes([])
            }
        }catch(err){
            console.log("Error:", err)
            setSolicitudes([])
        }
    }


    function textoEstado(estado){
        const textos = {
            "pendiente": "Pendiente de revisar",
            "en_revision": "En revisión",
            "aprobada": "Aprobada",
            "rechazada": "Rechazada"
        }
        return textos[estado] || estado
    }


    function explicacionEstado(estado){
        const explicaciones = {
            "pendiente": "El refugio aún no ha revisado tu solicitud.",
            "en_revision": "El refugio está revisando tu solicitud.",
            "aprobada": "¡Enhorabuena! El refugio ha aprobado tu solicitud y se pondrá en contacto contigo.",
            "rechazada": "Lamentablemente esta solicitud no ha salido adelante."
        }
        return explicaciones[estado] || ""
    }


    return (
        <>
            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} activo="mis-solicitudes" />

            <main id="contenido-principal" tabIndex="-1">

                <section className="seccion" style={{paddingTop: "64px"}} aria-labelledby="mis-solicitudes-titulo">
                    <div className="contenedor">

                        <header className="seccion-cabecera" style={{textAlign: "left", maxWidth: "100%", marginBottom: "32px"}}>
                            <span className="eyebrow">Mi cuenta</span>
                            <h1 id="mis-solicitudes-titulo">Mis solicitudes</h1>
                            <p>Aquí puedes ver el estado de las solicitudes de adopción que has enviado.</p>
                        </header>


                        {solicitudes.length === 0 ? (
                            <div className="vacio" role="status">
                                <p>Aún no has enviado ninguna solicitud de adopción.</p>
                                <button
                                    type="button"
                                    onClick={() => navegar("adoptar")}
                                    className="btn btn-acento"
                                    style={{marginTop: "16px"}}>
                                    Ver mascotas en adopción
                                </button>
                            </div>
                        ) : (
                            <ul className="solicitudes-lista" aria-label="Lista de solicitudes enviadas">

                                {solicitudes.map((s) => (
                                    <li key={s.id}>
                                        <article className="solicitud-tarjeta" aria-labelledby={`solicitud-${s.id}-titulo`}>

                                            <div className="solicitud-cabecera">
                                                <div style={{display: "flex", gap: "16px", alignItems: "center"}}>
                                                    <img
                                                        src={s.mascota_imagen
                                                            ? API + "/img/" + s.mascota_imagen
                                                            : API + "/img/" + s.mascota_nombre.toLowerCase() + ".jpg"}
                                                        alt={`Foto de ${s.mascota_nombre}`}
                                                        style={{width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover"}}
                                                    />
                                                    <div>
                                                        <h2 id={`solicitud-${s.id}-titulo`} style={{fontSize: "16px", margin: "0 0 4px 0"}}>
                                                            {s.mascota_nombre}
                                                        </h2>
                                                        <p className="solicitud-meta">
                                                            Refugio: <strong>{s.refugio_nombre}</strong>
                                                            {" · "}
                                                            Solicitada el <time dateTime={s.fecha}>
                                                                {new Date(s.fecha).toLocaleDateString("es-ES")}
                                                            </time>
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className={"badge badge-" + s.estado} aria-label={`Estado: ${textoEstado(s.estado)}`}>
                                                    {textoEstado(s.estado)}
                                                </span>
                                            </div>

                                            <p style={{fontSize: "14px", color: "var(--gris-700)", margin: "12px 0 0 0"}}>
                                                {explicacionEstado(s.estado)}
                                            </p>

                                        </article>
                                    </li>
                                ))}

                            </ul>
                        )}

                    </div>
                </section>

            </main>

            <Footer navegar={navegar} />
        </>
    )
}