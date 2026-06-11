export default function Footer({ navegar }) {
    return (
        <footer className="footer" aria-label="Pie de página">
            <div className="footer-inner">

                <div className="footer-top">

                    <div>
                        <a href="#home"
                           className="logo"
                           onClick={(e) => { e.preventDefault(); navegar && navegar("home") }}
                           aria-label="AdoptaYa, ir a la página de inicio">
                            <img src="/img/logo.png" alt="" />
                            Adopta<span>Ya</span>
                        </a>
                        <p style={{marginTop: "12px", fontSize: "14px", maxWidth: "280px"}}>
                            Conectamos refugios y familias para encontrar el compañero ideal.
                        </p>
                    </div>

                    <nav aria-labelledby="footer-plataforma-titulo">
                        <h2 id="footer-plataforma-titulo" className="footer-titulo">Plataforma</h2>
                        <ul>
                            <li>
                                <a href="#adoptar" onClick={(e) => { e.preventDefault(); navegar && navegar("adoptar") }}>
                                    Adoptar
                                </a>
                            </li>
                            <li>
                                <a href="#refugios" onClick={(e) => { e.preventDefault(); navegar && navegar("refugios") }}>
                                    Refugios
                                </a>
                            </li>
                            <li>
                                <a href="#home" onClick={(e) => { e.preventDefault(); navegar && navegar("home") }}>
                                    Cómo funciona
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <nav aria-labelledby="footer-empresa-titulo">
                        <h2 id="footer-empresa-titulo" className="footer-titulo">Empresa</h2>
                        <ul>
                            <li><a href="#">Contacto</a></li>
                            <li><a href="#">Aviso legal</a></li>
                            <li><a href="#">Privacidad</a></li>
                        </ul>
                    </nav>

                </div>

                <div className="footer-bottom">
                    <p>© 2026 AdoptaYa · Adrián Barreno</p>
                    <p>Proyecto DAW2</p>
                </div>

            </div>
        </footer>
    )
}