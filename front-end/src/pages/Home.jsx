import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import { useReveal } from "../hooks/useReveal.js"

const API = "http://localhost:3000"

export default function Home({ usuario, onLogout, navegar }) {

    // cargamos los 6 primeros refugios para la sección "Refugios colaboradores"
    const [refugios, setRefugios] = useState([])

    // activa las animaciones al hacer scroll, se reinicia cuando llegan los refugios
    useReveal(refugios)

    useEffect(() => {
        cargarRefugios()
    }, [])

    async function cargarRefugios(){
        try{
            const res = await fetch(API + "/refugios?limite=6")
            const data = await res.json()
            setRefugios(data)
        }catch(err){
            console.log("Error al cargar refugios:", err)
        }
    }

    return (
        <div>

            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} activo="home" />

            {/* HERO: imagen de fondo + texto centrado encima */}
            <section className="hero">
                <div className="hero-contenido">

                    <div className="hero-badge">
                        <span style={{fontSize: "14px"}}>🐾</span>
                        +100 animales buscando hogar
                    </div>

                    <h1>Encuentra a tu <em>compañero ideal</em></h1>

                    <p className="hero-subtitulo">
                        La forma más sencilla de adoptar. Conectamos refugios de toda España
                        con familias que quieren dar el paso.
                    </p>

                    <div className="hero-botones">
                        <a href="#adoptar"
                           className="btn btn-primario btn-grande"
                           onClick={(e) => { e.preventDefault(); navegar("adoptar") }}>
                            Ver animales disponibles →
                        </a>
                        <a href="#login"
                           className="btn btn-ghost btn-grande"
                           onClick={(e) => { e.preventDefault(); navegar("login") }}>
                            Soy un refugio
                        </a>
                    </div>

                </div>
            </section>


            {/* STATS: prueba social */}
            <section className="stats">
                <div className="stats-grid reveal-grupo">
                    <div>
                        <p className="stats-num">100+</p>
                        <p className="stats-label">Animales en adopción</p>
                    </div>
                    <div>
                        <p className="stats-num">50</p>
                        <p className="stats-label">Refugios asociados</p>
                    </div>
                    <div>
                        <p className="stats-num">1.200</p>
                        <p className="stats-label">Adopciones completadas</p>
                    </div>
                </div>
            </section>


            {/* FEATURES: cómo funciona */}
            <section className="seccion">
                <div className="contenedor">

                    <div className="seccion-cabecera reveal">
                        <span className="eyebrow">Cómo funciona</span>
                        <h2>Adoptar, paso a paso</h2>
                        <p>Un proceso pensado para que tomes la mejor decisión, sin complicaciones.</p>
                    </div>

                    <div className="features reveal-grupo">
                        <div className="feature">
                            <div className="feature-icono">01</div>
                            <h3>Explora</h3>
                            <p>Navega por cientos de animales de refugios verificados de toda España.</p>
                        </div>
                        <div className="feature">
                            <div className="feature-icono">02</div>
                            <h3>Filtra</h3>
                            <p>Encuentra al animal que encaja con tu casa, tu ritmo y tu familia.</p>
                        </div>
                        <div className="feature">
                            <div className="feature-icono">03</div>
                            <h3>Solicita</h3>
                            <p>Envía tu solicitud en segundos. El refugio te contacta directamente.</p>
                        </div>
                        <div className="feature">
                            <div className="feature-icono">04</div>
                            <h3>Adopta</h3>
                            <p>Recibe a tu nuevo compañero y empieza una nueva etapa juntos.</p>
                        </div>
                    </div>

                </div>
            </section>


            {/* REFUGIOS */}
            <section className="seccion seccion-gris">
                <div className="contenedor">

                    <div className="seccion-cabecera reveal">
                        <span className="eyebrow">Colaboradores</span>
                        <h2>Refugios de toda España</h2>
                        <p>Trabajamos con protectoras verificadas en cada comunidad.</p>
                    </div>

                    {refugios.length === 0 ? (
                        <p style={{textAlign: "center", color: "var(--gris-500)"}}>
                            Aún no hay refugios registrados. ¡Sé el primero!
                        </p>
                    ) : (
                        <>
                            <div className="refugios-grid reveal-grupo">
                                {refugios.map((r) => (
                                    <div key={r.id} className="refugio-card"
                                         onClick={() => navegar("refugios")}
                                         style={{cursor: "pointer"}}>
                                        <h4>{r.nombre}</h4>
                                        <p>{r.ciudad || "Sin ubicación"} · {r.num_mascotas} mascota{r.num_mascotas !== 1 ? "s" : ""}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{textAlign: "center", marginTop: "32px"}} className="reveal">
                                <a href="#refugios"
                                   className="btn btn-ghost"
                                   onClick={(e) => { e.preventDefault(); navegar("refugios") }}>
                                    Ver todos los refugios →
                                </a>
                            </div>
                        </>
                    )}

                </div>
            </section>


            {/* CTA */}
            <section className="cta">
                <div className="cta-contenido reveal">
                    <h2>¿Tienes un refugio?</h2>
                    <p>Publica tus animales de forma gratuita y llega a miles de familias.</p>
                    <a href="#login"
                       className="btn btn-acento btn-grande"
                       onClick={(e) => { e.preventDefault(); navegar("login") }}>
                        Registrar mi refugio →
                    </a>
                </div>
            </section>


            <Footer navegar={navegar} />

        </div>
    )
}
