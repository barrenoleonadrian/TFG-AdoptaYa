import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import { useReveal } from "../hooks/useReveal.js"

const API = "http://localhost:3000"


// saca la URL de la imagen de un refugio, o un avatar con su inicial si no tiene
function ImagenRefugio({ refugio }) {
    if(refugio.imagen){
        return <img src={API + "/img/" + refugio.imagen} alt={refugio.nombre} />
    }
    // avatar con la inicial
    return (
        <div className="avatar-inicial">
            {refugio.nombre.charAt(0).toUpperCase()}
        </div>
    )
}


export default function Refugios({ usuario, onLogout, navegar }) {

    const [refugios, setRefugios] = useState([])

    useReveal(refugios)

    // id del refugio que está abierto en el modal, null si ninguno
    const [abierto, setAbierto] = useState(null)

    // datos del refugio abierto (se cargan al abrir)
    const [detalle, setDetalle] = useState(null)


    useEffect(() => {
        cargar()
    }, [])


    async function cargar(){
        try{
            const res = await fetch(API + "/refugios")
            const data = await res.json()
            setRefugios(data)
        }catch(err){
            console.log("Error:", err)
        }
    }


    async function abrirRefugio(id){
        setAbierto(id)
        setDetalle(null)   // mostrar "cargando" mientras llega la info
        try{
            const res = await fetch(API + "/refugios/" + id)
            const data = await res.json()
            setDetalle(data)
        }catch(err){
            console.log("Error:", err)
        }
    }


    function cerrarModal(){
        setAbierto(null)
        setDetalle(null)
    }


    return (
        <div>

            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} activo="refugios" />

            <section className="seccion" style={{paddingTop: "64px"}}>
                <div className="contenedor">

                    <div className="seccion-cabecera" style={{textAlign: "left", maxWidth: "100%", marginBottom: "32px"}}>
                        <span className="eyebrow">Refugios</span>
                        <h2>Nuestros refugios colaboradores</h2>
                        <p>Protectoras verificadas que publican animales en AdoptaYa.</p>
                    </div>

                    {refugios.length === 0 ? (
                        <div className="vacio">
                            <p>Aún no hay refugios registrados.</p>
                        </div>
                    ) : (
                        <div className="refugios-grid-grande reveal-grupo">
                            {refugios.map((r) => (
                                <div key={r.id} className="refugio-card-grande" onClick={() => abrirRefugio(r.id)}>
                                    <div className="refugio-card-img">
                                        <ImagenRefugio refugio={r} />
                                    </div>
                                    <div className="refugio-card-info">
                                        <h3>{r.nombre}</h3>
                                        <p>{r.ciudad || "Sin ubicación"} · {r.num_mascotas} mascota{r.num_mascotas !== 1 ? "s" : ""}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </section>

            {/* MODAL */}
            {abierto && (
                <div className="modal-fondo" onClick={cerrarModal}>
                    <div className="modal-caja" onClick={(e) => e.stopPropagation()}>

                        <button className="modal-cerrar" onClick={cerrarModal}>×</button>

                        {!detalle ? (
                            <p style={{padding: "40px", textAlign: "center"}}>Cargando...</p>
                        ) : (
                            <div className="modal-contenido">

                                <div className="modal-cabecera">
                                    <div className="modal-img">
                                        <ImagenRefugio refugio={detalle.refugio} />
                                    </div>
                                    <div>
                                        <h2>{detalle.refugio.nombre}</h2>
                                        <p className="modal-meta">{detalle.refugio.ciudad || "Sin ubicación"}</p>
                                    </div>
                                </div>

                                {detalle.refugio.descripcion && (
                                    <p className="modal-descripcion">{detalle.refugio.descripcion}</p>
                                )}

                                <div className="modal-datos">
                                    {detalle.refugio.email && (
                                        <div><span className="etiqueta">Email</span><span className="valor">{detalle.refugio.email}</span></div>
                                    )}
                                    {detalle.refugio.telefono && (
                                        <div><span className="etiqueta">Teléfono</span><span className="valor">{detalle.refugio.telefono}</span></div>
                                    )}
                                </div>

                                <h3 style={{marginTop: "32px", marginBottom: "16px"}}>
                                    Mascotas en adopción ({detalle.mascotas.length})
                                </h3>

                                {detalle.mascotas.length === 0 ? (
                                    <p style={{color: "var(--gris-500)"}}>Este refugio aún no tiene mascotas publicadas.</p>
                                ) : (
                                    <div className="modal-mascotas">
                                        {detalle.mascotas.map((m) => (
                                            <a
                                                key={m.id}
                                                href={"#mascota/" + m.id}
                                                className="modal-mascota-card"
                                                onClick={(e) => { e.preventDefault(); cerrarModal(); navegar("mascota", m.id) }}
                                            >
                                                <img
                                                    src={m.imagen ? API + "/img/" + m.imagen : API + "/img/" + m.nombre.toLowerCase() + ".jpg"}
                                                    alt={m.nombre}
                                                />
                                                <div>
                                                    <h4>{m.nombre}</h4>
                                                    <p>{m.raza}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}

                            </div>
                        )}

                    </div>
                </div>
            )}

            <Footer navegar={navegar} />

        </div>
    )
}
