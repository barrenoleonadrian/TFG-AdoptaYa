import { useState } from "react"

const API = import.meta.env.VITE_API_URL || ""

export default function Login({ onLogin, navegar }) {

    const [modo, setModo] = useState("login")
    const [error, setError] = useState("")

    // si el registro de un refugio sale bien, mostramos un mensaje y ya
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


    async function hacerLogin(){
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


    async function hacerRegistro(){
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

            // si el backend devuelve "pendiente" es un refugio: mostramos mensaje
            if(data.pendiente){
                setRegistroOk(true)
                return
            }

            // si no, era un adoptante: login automático como antes
            onLogin(data)
            despues()
        }catch(err){ setError("Error de conexión con el servidor") }
    }


    return (
        <div className="auth-wrapper">
            <div className="auth-caja">

                <a href="#home" className="auth-logo" onClick={(e) => { e.preventDefault(); navegar("home") }}>
                    <img src="/img/logo.png" alt="" />
                    Adopta<span>Ya</span>
                </a>

                {/* mensaje de registro pendiente (cuando un refugio se acaba de registrar) */}
                {registroOk ? (
                    <>
                        <h2>¡Solicitud recibida!</h2>
                        <p className="auth-subtitulo" style={{marginBottom: "24px"}}>
                            Hemos recibido tu solicitud para registrar el refugio. El administrador
                            verificará tus datos en breve y te avisará cuando puedas empezar a usar
                            tu cuenta.
                        </p>
                        <button
                            onClick={() => { setRegistroOk(false); setModo("login") }}
                            className="btn btn-primario btn-ancho btn-grande">
                            Volver al inicio
                        </button>
                    </>
                ) : modo === "login" ? (
                    <>
                        <h2>Bienvenido de vuelta</h2>
                        <p className="auth-subtitulo">Inicia sesión para continuar.</p>

                        {error && <div className="error">{error}</div>}

                        <div className="campo">
                            <label>Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
                        </div>

                        <div className="campo">
                            <label>Contraseña</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                        </div>

                        <button onClick={hacerLogin} className="btn btn-primario btn-ancho btn-grande">
                            Iniciar sesión
                        </button>

                        <p className="auth-toggle">
                            ¿No tienes cuenta?{" "}
                            <button onClick={() => { setModo("registro"); setError("") }}>
                                Regístrate
                            </button>
                        </p>
                    </>
                ) : (
                    <>
                        <h2>Crea tu cuenta</h2>
                        <p className="auth-subtitulo">Empieza tu proceso de adopción en segundos.</p>

                        {error && <div className="error">{error}</div>}

                        <div className="campo">
                            <label>Nombre</label>
                            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre o el del refugio" />
                        </div>

                        <div className="campo">
                            <label>Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
                        </div>

                        <div className="campo">
                            <label>Contraseña</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                        </div>

                        <div className="campo">
                            <label>Tipo de cuenta</label>
                            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                                <option value="adoptante">Usuario — quiero adoptar</option>
                                <option value="protectora">Refugio — quiero publicar animales</option>
                            </select>
                        </div>

                        {/* el CIF solo se pide si es refugio */}
                        {tipo === "protectora" && (
                            <div className="campo">
                                <label>CIF del refugio</label>
                                <input
                                    value={cif}
                                    onChange={(e) => setCif(e.target.value)}
                                    placeholder="Ejemplo: G12345678"
                                />
                                <small style={{color: "var(--gris-500)", fontSize: "12px", marginTop: "4px", display: "block"}}>
                                    El administrador verificará el CIF antes de activar tu cuenta.
                                </small>
                            </div>
                        )}

                        <div className="campos-fila">
                            <div className="campo">
                                <label>Teléfono</label>
                                <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                            </div>
                            <div className="campo">
                                <label>Ciudad</label>
                                <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
                            </div>
                        </div>

                        <button onClick={hacerRegistro} className="btn btn-primario btn-ancho btn-grande">
                            Crear cuenta
                        </button>

                        <p className="auth-toggle">
                            ¿Ya tienes cuenta?{" "}
                            <button onClick={() => { setModo("login"); setError("") }}>
                                Inicia sesión
                            </button>
                        </p>
                    </>
                )}

            </div>
        </div>
    )
}
