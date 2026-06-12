import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import Favorito from "../components/Favorito.jsx"

const API = import.meta.env.VITE_API_URL || ""


function getImagenURL(m){
    if(m.imagen){
        return API + "/img/" + m.imagen
    }
    return API + "/img/" + m.nombre.toLowerCase() + ".jpg"
}


// Página privada para adoptantes: muestra las mascotas que han marcado
// como favoritas, en el mismo formato que el catálogo.
export default function MisFavoritos({ usuario, onLogout, navegar }) {

    const [mascotas, setMascotas] = useState([])
    const [favoritos, setFavoritos] = useState([])
    const [cargando, setCargando] = useState(true)


    useEffect(() => {
        cargar()
    }, [])


    async function cargar(){

        try{
            const token = localStorage.getItem("token")
            const res = await fetch(API + "/favoritos", {
                headers: {"Authorization": "Bearer " + token}
            })
            const data = await res.json()

            if(Array.isArray(data)){
                setMascotas(data)
                // construimos también el array de IDs para el componente Favorito,
                // así sabe que todas estas están en favoritos (pintan rellenas).
                setFavoritos(data.map(m => m.id))
            }
        }catch(err){
            console.log("Error al cargar favoritos:", err)
        }

        setCargando(false)
    }


    // cuando el usuario quita una mascota de favoritos desde esta página,
    // la eliminamos del listado para que desaparezca al instante.
    function alCambiarFavorito(mascotaId, esFavorito){
        if(!esFavorito){
            setMascotas(prev => prev.filter(m => m.id !== mascotaId))
            setFavoritos(prev => prev.filter(id => id !== mascotaId))
        }
    }


    return (
        <>
            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} activo="mis-favoritos" />

            <main id="contenido-principal" tabIndex="-1">

                <section className="seccion" style={{paddingTop: "64px"}} aria-labelledby="favoritos-titulo">
                    <div className="contenedor">

                        <header className="seccion-cabecera" style={{textAlign: "left", maxWidth: "100%", marginBottom: "32px"}}>
                            <span className="eyebrow">Mi cuenta</span>
                            <h1 id="favoritos-titulo">Mis favoritos</h1>
                            <p>Las mascotas que has guardado para echarles otro vistazo.</p>
                        </header>


                        {cargando ? (
                            <p className="vacio" role="status" aria-live="polite">Cargando...</p>
                        ) : mascotas.length === 0 ? (
                            <div className="vacio" role="status">
                                <p>Aún no tienes mascotas guardadas como favoritas.</p>
                                <button
                                    type="button"
                                    onClick={() => navegar("adoptar")}
                                    className="btn btn-acento"
                                    style={{marginTop: "16px"}}>
                                    Ver mascotas en adopción
                                </button>
                            </div>
                        ) : (
                            <ul className="mascotas-grid" aria-label="Mis mascotas favoritas">
                                {mascotas.map((m) => (
                                    <li key={m.id} className="mascota-li">
                                        <a
                                            href={"#mascota/" + m.id}
                                            className="mascota-card"
                                            onClick={(e) => { e.preventDefault(); navegar("mascota", m.id) }}
                                            aria-label={`Ver detalles de ${m.nombre}, ${m.raza}, ${m.edad} años, ${m.ciudad}`}
                                        >
                                            <div className="mascota-card-img">
                                                <img
                                                    src={getImagenURL(m)}
                                                    alt={`Foto de ${m.nombre}`}
                                                    loading="lazy" />
                                            </div>
                                            <div className="mascota-card-info">
                                                <h2>{m.nombre}</h2>
                                                <p>{m.raza} · {m.edad} años · {m.ciudad}</p>
                                            </div>
                                        </a>
                                        <Favorito
                                            mascotaId={m.id}
                                            usuario={usuario}
                                            favoritos={favoritos}
                                            onCambio={alCambiarFavorito} />
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