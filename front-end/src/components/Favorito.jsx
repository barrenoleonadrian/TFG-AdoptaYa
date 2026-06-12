import { useState, useEffect } from "react"

const API = import.meta.env.VITE_API_URL || ""

// Botón de corazón que marca/desmarca una mascota como favorita.
// Maneja su propio estado y llama al backend cuando se pulsa.
//
// Props:
//   - mascotaId: id de la mascota.
//   - usuario: usuario logueado (puede ser null).
//   - tamano: "pequeno" o "grande" (para las cards o el detalle).
//   - favoritos: array de IDs favoritos del usuario (opcional, para
//                el catálogo donde precargamos todos los favoritos juntos).
//   - onCambio: callback opcional cuando cambia el estado.

export default function Favorito({ mascotaId, usuario, tamano = "pequeno", favoritos, onCambio }) {

    // si nos pasan el array de favoritos precargado, lo usamos.
    // si no, empezamos en false (no es favorito).
    const [esFavorito, setEsFavorito] = useState(false)


    // cuando llega el array de favoritos del padre, actualizamos el estado
    useEffect(() => {
        if(favoritos && Array.isArray(favoritos)){
            setEsFavorito(favoritos.includes(mascotaId))
        }
    }, [favoritos, mascotaId])


    // solo los adoptantes pueden marcar favoritos. Si no eres adoptante,
    // el botón no se muestra.
    if(!usuario || usuario.tipo !== "adoptante"){
        return null
    }


    async function alternar(e){

        // evitamos que el click se propague al enlace padre (la card)
        e.preventDefault()
        e.stopPropagation()

        const nuevoEstado = !esFavorito

        // optimistic update: cambiamos el estado visual al instante
        // y si el backend falla, lo revertimos
        setEsFavorito(nuevoEstado)

        try{
            const token = localStorage.getItem("token")
            const metodo = nuevoEstado ? "POST" : "DELETE"

            const res = await fetch(API + "/favoritos/" + mascotaId, {
                method: metodo,
                headers: {"Authorization": "Bearer " + token}
            })

            if(!res.ok){
                // si falla, revertimos
                setEsFavorito(!nuevoEstado)
                return
            }

            // notificamos al padre por si quiere recargar la lista
            if(onCambio){
                onCambio(mascotaId, nuevoEstado)
            }

        }catch(err){
            // si hay error de red, también revertimos
            setEsFavorito(!nuevoEstado)
        }

    }


    const claseTamano = tamano === "grande" ? "boton-favorito boton-favorito-grande" : "boton-favorito"


    return (
        <button
            type="button"
            className={claseTamano + (esFavorito ? " activo" : "")}
            onClick={alternar}
            aria-label={esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
            aria-pressed={esFavorito}>
            <svg
                viewBox="0 0 24 24"
                fill={esFavorito ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
        </button>
    )
}