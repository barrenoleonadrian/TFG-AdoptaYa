export default function Footer({ navegar }) {
    return (
        <footer className="footer">
            <div className="footer-inner">

                <div className="footer-top">

                    <div>
                        <a href="#home" className="logo" onClick={(e) => { e.preventDefault(); navegar && navegar("home") }}>
                            <img src="/img/logo.png" alt="" />
                            Adopta<span>Ya</span>
                        </a>
                        <p style={{marginTop: "12px", fontSize: "14px", maxWidth: "280px"}}>
                            Conectamos refugios y familias para encontrar el compañero ideal.
                        </p>
                    </div>

                    <div>
                        <h4>Plataforma</h4>
                        <ul>
                            <li><a href="#adoptar" onClick={(e) => { e.preventDefault(); navegar && navegar("adoptar") }}>Adoptar</a></li>
                            <li><a href="#">Refugios</a></li>
                            <li><a href="#">Cómo funciona</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Empresa</h4>
                        <ul>
                            <li><a href="#">Contacto</a></li>
                            <li><a href="#">Aviso legal</a></li>
                            <li><a href="#">Privacidad</a></li>
                        </ul>
                    </div>

                </div>

                <div className="footer-bottom">
                    <p>© 2026 AdoptaYa · Adrián Barreno</p>
                    <p>Proyecto DAW2</p>
                </div>

            </div>
        </footer>
    )
}
