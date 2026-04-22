import Navbar from "../components/Navbar.jsx"
import Footer from "../components/Footer.jsx"

export default function Home({ usuario, onLogout, navegar }) {

    return (
        <div>

            <Navbar usuario={usuario} onLogout={onLogout} navegar={navegar} activo="home" />

            {/* HERO: claridad brutal — qué es, qué ofrece, qué hacer */}
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
                <div className="stats-grid">
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

                    <div className="seccion-cabecera">
                        <span className="eyebrow">Cómo funciona</span>
                        <h2>Adoptar, paso a paso</h2>
                        <p>Un proceso pensado para que tomes la mejor decisión, sin complicaciones.</p>
                    </div>

                    <div className="features">
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

                    <div className="seccion-cabecera">
                        <span className="eyebrow">Colaboradores</span>
                        <h2>Refugios de toda España</h2>
                        <p>Trabajamos con protectoras verificadas en cada comunidad.</p>
                    </div>

                    <div className="refugios-grid">
                        <div className="refugio-card">
                            <h4>Refugio Esperanza</h4>
                            <p>Madrid · 48 animales</p>
                        </div>
                        <div className="refugio-card">
                            <h4>Patitas Felices</h4>
                            <p>Barcelona · 62 animales</p>
                        </div>
                        <div className="refugio-card">
                            <h4>La Pradera Animal</h4>
                            <p>Valencia · 31 animales</p>
                        </div>
                        <div className="refugio-card">
                            <h4>Amor Sin Límites</h4>
                            <p>Sevilla · 25 animales</p>
                        </div>
                        <div className="refugio-card">
                            <h4>Huella Buena</h4>
                            <p>Bilbao · 19 animales</p>
                        </div>
                        <div className="refugio-card">
                            <h4>Can i Gat</h4>
                            <p>Girona · 40 animales</p>
                        </div>
                    </div>

                </div>
            </section>


            {/* CTA */}
            <section className="cta">
                <div className="cta-contenido">
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
