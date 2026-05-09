import { useEffect } from "react"

// Mensajito flotante que aparece en la esquina superior derecha
// y se quita solo a los 3 segundos.

export default function Toast({ mensaje, tipo, onCerrar }) {

    useEffect(() => {
        if(!mensaje) return
        const timer = setTimeout(onCerrar, 3000)
        return () => clearTimeout(timer)
    }, [mensaje])

    if(!mensaje) return null

    return (
        <div className={"toast toast-" + tipo}>
            {mensaje}
        </div>
    )
}
