import { useState } from "react"

// Componente reutilizable de estrellas (1-5).
//
// Tiene dos modos:
//   - Lectura (interactivo=false): solo muestra las estrellas rellenas
//     según el valor. Útil para mostrar la media de un refugio.
//   - Interactivo (interactivo=true): el usuario pulsa para elegir.
//     Útil para el formulario de valoración.
//
// Props:
//   - valor: número de 0 a 5 (puede ser decimal en modo lectura).
//   - onCambio: callback al pulsar una estrella (solo modo interactivo).
//   - interactivo: si se puede pulsar o no.
//   - tamano: "pequeno", "normal" o "grande".

export default function Estrellas({ valor = 0, onCambio, interactivo = false, tamano = "normal" }) {

    // estado para mostrar el hover en modo interactivo
    const [hover, setHover] = useState(0)
    // si nos llega como string ("4.0"), lo forzamos a número
    valor = Number(valor) || 0


    function alPulsar(n){
        if(!interactivo) return
        if(onCambio) onCambio(n)
    }


    // qué número usamos para pintar: si hay hover, ese; si no, el valor real
    const mostrar = hover || valor


    return (
        <div
            className={"estrellas estrellas-" + tamano + (interactivo ? " interactivo" : "")}
            role={interactivo ? "radiogroup" : "img"}
            aria-label={interactivo
                ? "Selecciona una valoración del 1 al 5"
                : `Valoración: ${valor} de 5 estrellas`}>

            {[1, 2, 3, 4, 5].map((n) => {

                // estrella rellena si su número es menor o igual al valor
                const rellena = n <= mostrar

                // estrella "media" si el valor es decimal y cae justo aquí
                // (ej: si valor=3.5, la cuarta estrella sale "media")
                const media = !rellena && (n - 0.5) <= mostrar

                if(interactivo){
                    return (
                        <button
                            key={n}
                            type="button"
                            className={"estrella " + (rellena ? "rellena" : "")}
                            onClick={() => alPulsar(n)}
                            onMouseEnter={() => setHover(n)}
                            onMouseLeave={() => setHover(0)}
                            role="radio"
                            aria-checked={valor === n}
                            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}>
                            <SvgEstrella rellena={rellena} media={false} />
                        </button>
                    )
                }

                return (
                    <span key={n} className={"estrella " + (rellena ? "rellena" : media ? "media" : "")} aria-hidden="true">
                        <SvgEstrella rellena={rellena} media={media} />
                    </span>
                )

            })}
        </div>
    )
}


// SVG de una estrella, rellena, media o vacía
function SvgEstrella({ rellena, media }){

    // estrella media: usamos un gradient para rellenar solo la mitad
    if(media){
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                    <linearGradient id="media-grad">
                        <stop offset="50%" stopColor="currentColor" />
                        <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                </defs>
                <path
                    fill="url(#media-grad)"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        )
    }

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill={rellena ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    )
}