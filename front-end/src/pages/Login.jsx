import { useState } from "react"

const API = import.meta.env.VITE_API_URL || ""

export default function Login({ onLogin, navegar }) {

    const [modo, setModo] = useState("login")
    const [error, setError] = useState("")
    const [registroOk, setRegistroOk] = useState(false)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [nombre, setNombre] = useState("")
    const [tipo, setTipo] = useState("adoptante")
    const [telefono, setTelefono] = useState("")
    const [ciudad, setCiudad] = useState("")
    const [cif, setCif] = useState("")


    function despues(){
        const volver = sessionStorage.getItem("volver")
        if(volver){
            sessionStorage.removeItem("volver")
            window.location.hash = volver
        }else{
            navegar("home")
        }
    }


    async function hacerLogin(e){
        e.preventDefault()
        setError("")
        if(!email || !password){ setError("Completa todos los campos"); return }
        try{
            const res = await fetch(API + "/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password})
            })
            const data = await res.json()
            if(!res.ok){ setError(data.mensaje || "Error al iniciar sesión"); return }
            onLogin(data)
            despues()
        }catch(err){ setError("Error de conexión con el servidor") }
    }


    async function hacerRegistro(e){
        e.preventDefault()
        setError("")
        if(!nombre || !email || !password){ setError("Nombre, email y contraseña son obligatorios"); return }
        if(tipo === "protectora" && !cif){ setError("El CIF es obligatorio para refugios"); return }

        try{
            const res = await fetch(API + "/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({nombre, email, password, tipo, telefono, ciudad, cif})
            })
            const data = await res.json()
            if(!res.ok){ setError(data.mensaje || "Error al registrarse"); return }

            if(data.pendiente){
                setRegistroOk(true)
                return
            }

            onLogin(data)
            despues()
        }catch(err){ setError("Error de conexión con el servidor") }
    }


    return (
        <main id="contenido-principal" tabIndex="-1" className="auth-wrapper">
            <section className="auth-caja" aria-labelledby="auth-titulo">

                <a href="#home"
                   className="auth-logo"
                   onClick={(e) => { e.preventDefault(); navegar("home") }}
                   aria-label="AdoptaYa, ir a la página de inicio">
                    <img src="/img/logo.png" alt="" />
                    Adopta<span>Ya</span>
                </a>

                {registroOk ? (
                    <div role="status">
                        <h1 id="auth-titulo">¡Solicitud recibida!</h1>
                        <p className="auth-subtitulo" style={{marginBottom: "24px"}}>
                            Hemos recibido tu solicitud para registrar el refugio. El administrador
                            verificará tus datos en breve y te avisará cuando puedas empezar a usar
                            tu cuenta.
                        </p>
                        <button
                            type="button"
                            onClick={() => { setRegistroOk(false); setModo("login") }}
                            className="btn btn-primario btn-ancho btn-grande">
                            Volver al inicio
                        </button>
                    </div>
                ) : modo === "login" ? (
                    <form onSubmit={hacerLogin} noValidate>
                        <h1 id="auth-titulo">Bienvenido de vuelta</h1>
                        <p className="auth-subtitulo">Inicia sesión para continuar.</p>

                        {error && <div className="error" role="alert">{error}</div>}

                        <div className="campo">
                            <label htmlFor="login-email" data-required>Email</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                autoComplete="email"
                                required
                                aria-required="true" />
                        </div>

                        <div className="campo">
                            <label htmlFor="login-password" data-required>Contraseña</label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                                aria-required="true" />
                        </div>

                        <button type="submit" className="btn btn-primario btn-ancho btn-grande">
                            Iniciar sesión
                        </button>

                        <p className="auth-toggle">
                            ¿No tienes cuenta?{" "}
                            <button type="button" onClick={() => { setModo("registro"); setError("") }}>
                                Regístrate
                            </button>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={hacerRegistro} noValidate>
                        <h1 id="auth-titulo">Crea tu cuenta</h1>
                        <p className="auth-subtitulo">Empieza tu proceso de adopción en segundos.</p>

                        {error && <div className="error" role="alert">{error}</div>}

                        <div className="campo">
                            <label htmlFor="reg-nombre" data-required>Nombre</label>
                            <input
                                id="reg-nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Tu nombre o el del refugio"
                                autoComplete="name"
                                required
                                aria-required="true" />
                        </div>

                        <div className="campo">
                            <label htmlFor="reg-email" data-required>Email</label>
                            <input
                                id="reg-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                autoComplete="email"
                                required
                                aria-required="true" />
                        </div>

                        <div className="campo">
                            <label htmlFor="reg-password" data-required>Contraseña</label>
                            <input
                                id="reg-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                autoComplete="new-password"
                                minLength="6"
                                required
                                aria-required="true"
                                aria-describedby="reg-password-ayuda" />
                            <small id="reg-password-ayuda" className="campo-ayuda">
                                Mínimo 6 caracteres.
                            </small>
                        </div>

                        <div className="campo">
                            <label htmlFor="reg-tipo">Tipo de cuenta</label>
                            <select
                                id="reg-tipo"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}>
                                <option value="adoptante">Usuario — quiero adoptar</option>
                                <option value="protectora">Refugio — quiero publicar animales</option>
                            </select>
                        </div>

                        {tipo === "protectora" && (
                            <div className="campo">
                                <label htmlFor="reg-cif" data-required>CIF del refugio</label>
                                <input
                                    id="reg-cif"
                                    value={cif}
                                    onChange={(e) => setCif(e.target.value)}
                                    placeholder="Ejemplo: G12345678"
                                    required
                                    aria-required="true"
                                    aria-describedby="reg-cif-ayuda" />
                                <small id="reg-cif-ayuda" className="campo-ayuda">
                                    El administrador verificará el CIF antes de activar tu cuenta.
                                </small>
                            </div>
                        )}

                        <div className="campos-fila">
                            <div className="campo">
                                <label htmlFor="reg-telefono">Teléfono</label>
                                <input
                                    id="reg-telefono"
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    autoComplete="tel" />
                            </div>
                            <div className="campo">
                                <label htmlFor="reg-ciudad">Ciudad</label>
                                <input
                                    id="reg-ciudad"
                                    value={ciudad}
                                    onChange={(e) => setCiudad(e.target.value)}
                                    autoComplete="address-level2" />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primario btn-ancho btn-grande">
                            Crear cuenta
                        </button>

                        <p className="auth-toggle">
                            ¿Ya tienes cuenta?{" "}
                            <button type="button" onClick={() => { setModo("login"); setError("") }}>
                                Inicia sesión
                            </button>
                        </p>
                    </form>
                )}

            </section>
        </main>
    )
}