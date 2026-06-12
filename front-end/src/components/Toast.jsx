import { useEffect } from "react"

// Mensajito flotante que aparece en la esquina superior derecha
// y se quita solo a los 3 segundos.
//
// Mejoras de accesibilidad:
//   - role="status" + aria-live="polite" → los lectores de pantalla
//     anuncian el mensaje sin interrumpir lo que estaba diciendo.
//   - role="alert" para errores → los anuncia inmediatamente porque
//     son más urgentes.

export default function Toast({ mensaje, tipo, onCerrar }) {

    useEffect(() => {
        if(!mensaje) return
        const timer = setTimeout(onCerrar, 3000)
        return () => clearTimeout(timer)
    }, [mensaje])

    if(!mensaje) return null

    // los errores son urgentes → role="alert" (anuncio inmediato).
    // los demás son informativos → role="status" + aria-live="polite".
    const rol = tipo === "error" ? "alert" : "status"

    return (
        <div
            className={"toast toast-" + tipo}
            role={rol}
            aria-live={tipo === "error" ? "assertive" : "polite"}>
            {mensaje}
        </div>
    )
}