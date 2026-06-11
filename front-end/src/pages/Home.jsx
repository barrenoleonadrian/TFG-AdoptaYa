import { useState, useEffect } from "react"
import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"
import { useReveal } from "../hooks/useReveal.js"

const API = import.meta.env.VITE_API_URL || ""

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
        <>
            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} activo="home" />

            <main id="contenido-principal" tabIndex="-1">

                {/* aviso para refugios sin verificar */}
                {usuario && usuario.tipo === "protectora" && usuario.verificado === false && (
                    <div className="banner-aviso" role="status">
                        <strong>Cuenta pendiente de verificación.</strong> El administrador
                        está revisando tus datos. Cuando esté verificado podrás publicar mascotas y gestionar tu refugio.
                    </div>
                )}

                {/* HERO: imagen de fondo + texto centrado encima */}
                <section className="hero" aria-labelledby="hero-titulo">
                    <div className="hero-contenido">

                        <p className="hero-badge">
                            <span aria-hidden="true" style={{fontSize: "14px"}}>🐾</span>
                            <span>+100 animales buscando hogar</span>
                        </p>

                        <h1 id="hero-titulo">Encuentra a tu <em>compañero ideal</em></h1>

                        <p className="hero-subtitulo">
                            La forma más sencilla de adoptar. Conectamos refugios de toda España
                            con familias que quieren dar el paso.
                        </p>

                        <div className="hero-botones">
                            <a href="#adoptar"
                               className="btn btn-primario btn-grande"
                               onClick={(e) => { e.preventDefault(); navegar("adoptar") }}>
                                Ver animales disponibles
                                <span aria-hidden="true"> →</span>
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
                <section className="stats" aria-label="Estadísticas de AdoptaYa">
                    <ul className="stats-grid reveal-grupo">
                        <li>
                            <p className="stats-num">100+</p>
                            <p className="stats-label">Animales en adopción</p>
                        </li>
                        <li>
                            <p className="stats-num">50</p>
                            <p className="stats-label">Refugios asociados</p>
                        </li>
                        <li>
                            <p className="stats-num">1.200</p>
                            <p className="stats-label">Adopciones completadas</p>
                        </li>
                    </ul>
                </section>


                {/* FEATURES: cómo funciona */}
                <section className="seccion" aria-labelledby="como-funciona-titulo">
                    <div className="contenedor">

                        <header className="seccion-cabecera reveal">
                            <span className="eyebrow">Cómo funciona</span>
                            <h2 id="como-funciona-titulo">Adoptar, paso a paso</h2>
                            <p>Un proceso pensado para que tomes la mejor decisión, sin complicaciones.</p>
                        </header>

                        <ol className="features reveal-grupo">
                            <li className="feature">
                                <div className="feature-icono" aria-hidden="true">01</div>
                                <h3>Explora</h3>
                                <p>Navega por cientos de animales de refugios verificados de toda España.</p>
                            </li>
                            <li className="feature">
                                <div className="feature-icono" aria-hidden="true">02</div>
                                <h3>Filtra</h3>
                                <p>Encuentra al animal que encaja con tu casa, tu ritmo y tu familia.</p>
                            </li>
                            <li className="feature">
                                <div className="feature-icono" aria-hidden="true">03</div>
                                <h3>Solicita</h3>
                                <p>Envía tu solicitud en segundos. El refugio te contacta directamente.</p>
                            </li>
                            <li className="feature">
                                <div className="feature-icono" aria-hidden="true">04</div>
                                <h3>Adopta</h3>
                                <p>Recibe a tu nuevo compañero y empieza una nueva etapa juntos.</p>
                            </li>
                        </ol>

                    </div>
                </section>


                {/* REFUGIOS */}
                <section className="seccion seccion-gris" aria-labelledby="refugios-titulo">
                    <div className="contenedor">

                        <header className="seccion-cabecera reveal">
                            <span className="eyebrow">Colaboradores</span>
                            <h2 id="refugios-titulo">Refugios de toda España</h2>
                            <p>Trabajamos con protectoras verificadas en cada comunidad.</p>
                        </header>

                        {refugios.length === 0 ? (
                            <p style={{textAlign: "center", color: "var(--gris-500)"}}>
                                Aún no hay refugios registrados. ¡Sé el primero!
                            </p>
                        ) : (
                            <>
                                <ul className="refugios-grid reveal-grupo">
                                    {refugios.map((r) => (
                                        <li key={r.id}>
                                            <a href="#refugios"
                                               className="refugio-card"
                                               onClick={(e) => { e.preventDefault(); navegar("refugios") }}
                                               aria-label={`Refugio ${r.nombre}, ${r.ciudad || "sin ubicación"}, ${r.num_mascotas} ${r.num_mascotas === 1 ? "mascota" : "mascotas"}`}>
                                                <h3>{r.nombre}</h3>
                                                <p>{r.ciudad || "Sin ubicación"} · {r.num_mascotas} mascota{r.num_mascotas !== 1 ? "s" : ""}</p>
                                            </a>
                                        </li>
                                    ))}
                                </ul>

                                <div style={{textAlign: "center", marginTop: "32px"}} className="reveal">
                                    <a href="#refugios"
                                       className="btn btn-ghost"
                                       onClick={(e) => { e.preventDefault(); navegar("refugios") }}>
                                        Ver todos los refugios
                                        <span aria-hidden="true"> →</span>
                                    </a>
                                </div>
                            </>
                        )}

                    </div>
                </section>


                {/* CTA */}
                <section className="cta" aria-labelledby="cta-titulo">
                    <div className="cta-contenido reveal">
                        <h2 id="cta-titulo">¿Tienes un refugio?</h2>
                        <p>Publica tus animales de forma gratuita y llega a miles de familias.</p>
                        <a href="#login"
                           className="btn btn-acento btn-grande"
                           onClick={(e) => { e.preventDefault(); navegar("login") }}>
                            Registrar mi refugio
                            <span aria-hidden="true"> →</span>
                        </a>
                    </div>
                </section>

            </main>

            <Footer navegar={navegar} />
        </>
    )
}