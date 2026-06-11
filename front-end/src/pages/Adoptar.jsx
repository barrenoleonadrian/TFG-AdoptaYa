import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import { useReveal } from "../hooks/useReveal.js"

const API = import.meta.env.VITE_API_URL || ""

function getImagenURL(m) {
    if (m.imagen) {
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

    async function cargarMascotas() {

        let url = API + "/mascotas?"

        if (tipo) url += "tipo=" + tipo + "&"
        if (ciudad) url += "ciudad=" + ciudad + "&"
        if (busqueda) url += "busqueda=" + busqueda + "&"

        try {
            const res = await fetch(url)
            const data = await res.json()
            setMascotas(data)
        } catch (err) {
            console.log("Error al cargar mascotas:", err)
        }
    }

    function buscar(e) {
        e.preventDefault()
        cargarMascotas()
    }

    return (
        <>
            <Navbar
                usuario={usuario}
                onLogout={onLogout}
                navegar={navegar}
                activo="adoptar"
            />

            <main id="contenido-principal" tabIndex="-1">

                <section
                    className="seccion"
                    style={{ paddingTop: "64px" }}
                    aria-labelledby="adoptar-titulo"
                >
                    <div className="contenedor">

                        <header
                            className="seccion-cabecera"
                            style={{ textAlign: "left", marginBottom: "32px" }}
                        >
                            <span className="eyebrow">Adoptar</span>
                            <h1 id="adoptar-titulo">Encuentra a tu compañero</h1>
                            <p>
                                Filtra entre {mascotas.length} animales disponibles.
                            </p>
                        </header>

                        <form
                            className="filtros"
                            onSubmit={buscar}
                            role="search"
                            aria-label="Buscar mascotas"
                        >

                            <div
                                className="campo"
                                style={{ flex: 1, minWidth: "140px", margin: 0 }}
                            >
                                <label htmlFor="filtro-tipo" className="sr-only">
                                    Tipo de animal
                                </label>

                                <select
                                    id="filtro-tipo"
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                >
                                    <option value="">Todos los animales</option>
                                    <option value="perro">Perro</option>
                                    <option value="gato">Gato</option>
                                    <option value="conejo">Conejo</option>
                                    <option value="pajaro">Pájaro</option>
                                </select>
                            </div>

                            <div
                                className="campo"
                                style={{ flex: 1, minWidth: "140px", margin: 0 }}
                            >
                                <label htmlFor="filtro-ciudad" className="sr-only">
                                    Ciudad
                                </label>

                                <select
                                    id="filtro-ciudad"
                                    value={ciudad}
                                    onChange={(e) => setCiudad(e.target.value)}
                                >
                                    <option value="">Todas las ciudades</option>
                                    <option value="Madrid">Madrid</option>
                                    <option value="Barcelona">Barcelona</option>
                                    <option value="Valencia">Valencia</option>
                                    <option value="Sevilla">Sevilla</option>
                                </select>
                            </div>

                            <div
                                className="campo"
                                style={{ flex: 1, minWidth: "140px", margin: 0 }}
                            >
                                <label htmlFor="filtro-busqueda" className="sr-only">
                                    Buscar por nombre o raza
                                </label>

                                <input
                                    id="filtro-busqueda"
                                    type="search"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    placeholder="Buscar por nombre o raza..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primario"
                            >
                                Buscar
                            </button>

                        </form>

                        {mascotas.length === 0 ? (

                            <p className="vacio" role="status">
                                No hay animales que coincidan con tu búsqueda.
                            </p>

                        ) : (

                            <ul
                                className="mascotas-grid reveal-grupo"
                                key={mascotas.length}
                                aria-label="Lista de mascotas en adopción"
                            >
                                {mascotas.map((m) => (
                                    <li key={m.id}>

                                        <a
                                            href={"#mascota/" + m.id}
                                            className="mascota-card"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                navegar("mascota", m.id)
                                            }}
                                            aria-label={`Ver detalles de ${m.nombre}, ${m.raza}, ${m.edad} años, ${m.ciudad}`}
                                        >
                                            <div className="mascota-card-img">
                                                <img
                                                    src={getImagenURL(m)}
                                                    alt={`Foto de ${m.nombre}`}
                                                    loading="lazy"
                                                />
                                            </div>

                                            <div className="mascota-card-info">
                                                <h2>{m.nombre}</h2>
                                                <p>
                                                    {m.raza} · {m.edad} años · {m.ciudad}
                                                </p>
                                            </div>
                                        </a>

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