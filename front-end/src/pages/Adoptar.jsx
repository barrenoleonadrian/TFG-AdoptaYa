import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import { useReveal } from "../hooks/useReveal.js"

const API = import.meta.env.VITE_API_URL || ""


function getImagenURL(m){
    if(m.imagen){
        return API + "/img/" + m.imagen
    }
    return API + "/img/" + m.nombre.toLowerCase() + ".jpg"
}


export default function Adoptar({ usuario, onLogout, navegar }) {

    const [mascotas, setMascotas] = useState([])
    const [tipo, setTipo] = useState("")
    const [ciudad, setCiudad] = useState("")
    const [busqueda, setBusqueda] = useState("")

    // reactiva el reveal cuando llegan las mascotas del backend
    useReveal(mascotas)


    useEffect(() => {
        cargarMascotas()
    }, [])


    async function cargarMascotas(){

        let url = API + "/mascotas?"
        if(tipo) url += "tipo=" + tipo + "&"
        if(ciudad) url += "ciudad=" + ciudad + "&"
        if(busqueda) url += "busqueda=" + busqueda + "&"

        try{
            const res = await fetch(url)
            const data = await res.json()
            setMascotas(data)
        }catch(err){
            console.log("Error al cargar mascotas:", err)
        }

    }


    return (
        <div>

            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} activo="adoptar" />

            <section className="seccion" style={{paddingTop: "64px"}}>
                <div className="contenedor">

                    <div className="seccion-cabecera" style={{textAlign: "left", marginBottom: "32px"}}>
                        <span className="eyebrow">Adoptar</span>
                        <h2>Encuentra a tu compañero</h2>
                        <p>Filtra entre {mascotas.length} animales disponibles.</p>
                    </div>

                    <div className="filtros">
                        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                            <option value="">Todos los animales</option>
                            <option value="perro">Perro</option>
                            <option value="gato">Gato</option>
                            <option value="conejo">Conejo</option>
                            <option value="pajaro">Pájaro</option>
                        </select>

                        <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
                            <option value="">Todas las ciudades</option>
                            <option value="Madrid">Madrid</option>
                            <option value="Barcelona">Barcelona</option>
                            <option value="Valencia">Valencia</option>
                            <option value="Sevilla">Sevilla</option>
                        </select>

                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre o raza..."
                        />

                        <button onClick={cargarMascotas} className="btn btn-primario">
                            Buscar
                        </button>
                    </div>


                    {mascotas.length === 0 ? (
                        <div className="vacio">
                            <p>No hay animales que coincidan con tu búsqueda.</p>
                        </div>
                    ) : (
                        <div className="mascotas-grid reveal-grupo" key={mascotas.length}>
                            {mascotas.map((m) => (
                                <a
                                    key={m.id}
                                    href={"#mascota/" + m.id}
                                    className="mascota-card"
                                    onClick={(e) => { e.preventDefault(); navegar("mascota", m.id) }}
                                >
                                    <div className="mascota-card-img">
                                        <img src={getImagenURL(m)} alt={m.nombre} loading="lazy" />
                                    </div>
                                    <div className="mascota-card-info">
                                        <h3>{m.nombre}</h3>
                                        <p>{m.raza} · {m.edad} años · {m.ciudad}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}

                </div>
            </section>

            <Footer navegar={navegar} />

        </div>
    )
}
