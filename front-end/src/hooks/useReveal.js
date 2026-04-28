import { useEffect } from "react"

// Este hook hace que cualquier elemento con la clase ".reveal" o ".reveal-grupo"
// reciba la clase ".visible" cuando aparece en pantalla.
// Así el CSS se encarga de animarlo.
//
// Acepta una "dependencia" opcional: si la pasas, el observer se reinicia
// cada vez que esa dependencia cambia. Útil cuando el contenido se carga
// después (por ejemplo, mascotas que vienen de una API).

export function useReveal(dependencia){

    useEffect(() => {

        // observer detecta cuándo un elemento entra en el viewport
        const observer = new IntersectionObserver((entries) => {

            entries.forEach((entry) => {
                if(entry.isIntersecting){
                    entry.target.classList.add("visible")
                    // una vez aparecido, dejamos de observarlo (no se vuelve a animar)
                    observer.unobserve(entry.target)
                }
            })

        }, {
            threshold: 0.1   // se activa cuando ya se ve el 10% del elemento
        })

        // observamos todos los elementos marcados que aún no estén visibles
        const elementos = document.querySelectorAll(".reveal:not(.visible), .reveal-grupo:not(.visible)")
        elementos.forEach((el) => observer.observe(el))

        // limpieza al desmontar
        return () => observer.disconnect()

    }, [dependencia])   // se reinicia cuando cambia la dependencia

}
