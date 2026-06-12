import { useState, useEffect, useRef } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import { useReveal } from "../hooks/useReveal.js"

const API = import.meta.env.VITE_API_URL || ""

function ImagenRefugio({ refugio }) {
    if (refugio.imagen) {
        return (
            <img
                src={API + "/img/" + refugio.imagen}
                alt={`Imagen del refugio ${refugio.nombre}`}
            />
        )
    }

    return (
        <div className="avatar-inicial" aria-hidden="true">
            {refugio.nombre.charAt(0).toUpperCase()}
        </div>
    )
}

export default function Refugios({ usuario, onLogout, navegar }) {
    const [refugios, setRefugios] = useState([])
    useReveal(refugios)

    const [abierto, setAbierto] = useState(null)
    const [detalle, setDetalle] = useState(null)

    const triggerRef = useRef(null)

    useEffect(() => {
        cargar()
    }, [])

    useEffect(() => {
        if (!abierto) return

        function teclaPulsada(e) {
            if (e.key === "Escape") {
                cerrarModal()
            }
        }

        document.addEventListener("keydown", teclaPulsada)

        return () => {
            document.removeEventListener("keydown", teclaPulsada)
        }
    }, [abierto])

    async function cargar() {
        try {
            const res = await fetch(API + "/refugios")
            const data = await res.json()
            setRefugios(data)
        } catch (err) {
            console.log("Error:", err)
        }
    }

    function abrirRefugio(id, evento) {
        if (evento && evento.currentTarget) {
            triggerRef.current = evento.currentTarget
        }

        setAbierto(id)
        setDetalle(null)
        cargarDetalle(id)
    }

    async function cargarDetalle(id) {
        try {
            const res = await fetch(API + "/refugios/" + id)
            const data = await res.json()
            setDetalle(data)
        } catch (err) {
            console.log("Error:", err)
        }
    }

    function cerrarModal() {
        setAbierto(null)
        setDetalle(null)

        if (triggerRef.current) {
            triggerRef.current.focus()
        }
    }

    return (
        <>
            <Navbar
                usuario={usuario}
                onLogout={onLogout}
                navegar={navegar}
                activo="refugios"
            />

            <main id="contenido-principal" tabIndex="-1">
                <section
                    className="seccion"
                    style={{ paddingTop: "64px" }}
                    aria-labelledby="refugios-titulo"
                >
                    <div className="contenedor">
                        <header
                            className="seccion-cabecera"
                            style={{
                                textAlign: "left",
                                maxWidth: "100%",
                                marginBottom: "32px",
                            }}
                        >
                            <span className="eyebrow">Refugios</span>
                            <h1 id="refugios-titulo">
                                Nuestros refugios colaboradores
                            </h1>
                            <p>
                                Protectoras verificadas que publican animales en
                                AdoptaYa.
                            </p>
                        </header>

                        {refugios.length === 0 ? (
                            <p className="vacio" role="status">
                                Aún no hay refugios registrados.
                            </p>
                        ) : (
                            <ul
                                className="refugios-grid-grande reveal-grupo"
                                aria-label="Lista de refugios"
                            >
                                {refugios.map((r) => (
                                    <li key={r.id}>
                                        <button
                                            type="button"
                                            className="refugio-card-grande"
                                            onClick={(e) =>
                                                abrirRefugio(r.id, e)
                                            }
                                            aria-label={`Ver detalles del refugio ${r.nombre}, ${
                                                r.ciudad || "sin ubicación"
                                            }, ${r.num_mascotas} ${
                                                r.num_mascotas === 1
                                                    ? "mascota"
                                                    : "mascotas"
                                            }`}
                                        >
                                            <div className="refugio-card-img">
                                                <ImagenRefugio refugio={r} />
                                            </div>

                                            <div className="refugio-card-info">
                                                <h2>{r.nombre}</h2>
                                                <p>
                                                    {r.ciudad ||
                                                        "Sin ubicación"}{" "}
                                                    · {r.num_mascotas} mascota
                                                    {r.num_mascotas !== 1
                                                        ? "s"
                                                        : ""}
                                                </p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </main>

            {abierto && (
                <div className="modal-fondo" onClick={cerrarModal}>
                    <div
                        className="modal-caja"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-refugio-titulo"
                    >
                        <button
                            type="button"
                            className="modal-cerrar"
                            onClick={cerrarModal}
                            aria-label="Cerrar detalles del refugio"
                        >
                            <span aria-hidden="true">×</span>
                        </button>

                        {!detalle ? (
                            <p
                                style={{
                                    padding: "40px",
                                    textAlign: "center",
                                }}
                                role="status"
                            >
                                Cargando...
                            </p>
                        ) : (
                            <div className="modal-contenido">
                                <header className="modal-cabecera">
                                    <div className="modal-img">
                                        <ImagenRefugio
                                            refugio={detalle.refugio}
                                        />
                                    </div>

                                    <div>
                                        <h2 id="modal-refugio-titulo">
                                            {detalle.refugio.nombre}
                                        </h2>

                                        <p className="modal-meta">
                                            {detalle.refugio.ciudad ||
                                                "Sin ubicación"}
                                        </p>
                                    </div>
                                </header>

                                {detalle.refugio.descripcion && (
                                    <p className="modal-descripcion">
                                        {detalle.refugio.descripcion}
                                    </p>
                                )}

                                <dl className="modal-datos">
                                    {detalle.refugio.email && (
                                        <div>
                                            <dt className="etiqueta">
                                                Email
                                            </dt>
                                            <dd className="valor">
                                                {detalle.refugio.email}
                                            </dd>
                                        </div>
                                    )}

                                    {detalle.refugio.telefono && (
                                        <div>
                                            <dt className="etiqueta">
                                                Teléfono
                                            </dt>
                                            <dd className="valor">
                                                {detalle.refugio.telefono}
                                            </dd>
                                        </div>
                                    )}
                                </dl>

                                <h3
                                    style={{
                                        marginTop: "32px",
                                        marginBottom: "16px",
                                    }}
                                >
                                    Mascotas en adopción (
                                    {detalle.mascotas.length})
                                </h3>

                                {detalle.mascotas.length === 0 ? (
                                    <p
                                        style={{
                                            color: "var(--gris-500)",
                                        }}
                                    >
                                        Este refugio aún no tiene mascotas
                                        publicadas.
                                    </p>
                                ) : (
                                    <ul
                                        className="modal-mascotas"
                                        aria-label="Mascotas del refugio"
                                    >
                                        {detalle.mascotas.map((m) => (
                                            <li key={m.id}>
                                                <a
                                                    href={
                                                        "#mascota/" + m.id
                                                    }
                                                    className="modal-mascota-card"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        cerrarModal()
                                                        navegar(
                                                            "mascota",
                                                            m.id
                                                        )
                                                    }}
                                                    aria-label={`Ver ficha de ${
                                                        m.nombre
                                                    }, ${
                                                        m.raza || "sin raza"
                                                    }`}
                                                >
                                                    <img
                                                        src={
                                                            m.imagen
                                                                ? API +
                                                                  "/img/" +
                                                                  m.imagen
                                                                : API +
                                                                  "/img/" +
                                                                  m.nombre.toLowerCase() +
                                                                  ".jpg"
                                                        }
                                                        alt={`Foto de ${m.nombre}`}
                                                    />

                                                    <div>
                                                        <h4>{m.nombre}</h4>
                                                        <p>{m.raza}</p>
                                                    </div>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer navegar={navegar} />
        </>
    )
}