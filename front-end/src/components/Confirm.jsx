import { useEffect, useRef } from "react"

// Componente de confirmación para sustituir al confirm() del navegador.
// Muestra un mensaje y dos botones: Cancelar y Confirmar.
//
// Mejoras de accesibilidad:
//   - role="dialog" + aria-modal para que los lectores de pantalla lo
//     identifiquen como un diálogo modal.
//   - El foco va al botón "Cancelar" al abrirse (más seguro: si el
//     usuario pulsa Enter por error, no se ejecuta la acción peligrosa).
//   - La tecla Escape cierra el modal.

export default function Confirm({ mensaje, onConfirmar, onCancelar, textoConfirmar = "Confirmar" }) {

    const cancelarRef = useRef(null)


    // al abrirse: poner el foco en el botón cancelar (más seguro)
    useEffect(() => {
        if(cancelarRef.current){
            cancelarRef.current.focus()
        }
    }, [])


    // cerrar con la tecla Escape
    useEffect(() => {
        function teclaPulsada(e){
            if(e.key === "Escape"){
                onCancelar()
            }
        }
        document.addEventListener("keydown", teclaPulsada)
        return () => document.removeEventListener("keydown", teclaPulsada)
    }, [onCancelar])


    function confirmar(){
        onConfirmar()
        onCancelar()
    }


    return (
        <div className="modal-overlay" onClick={onCancelar}>
            <div
                className="modal-confirm"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-mensaje">

                <p id="confirm-mensaje" className="modal-confirm-mensaje">{mensaje}</p>

                <div className="modal-confirm-acciones">
                    <button
                        ref={cancelarRef}
                        type="button"
                        onClick={onCancelar}
                        className="btn btn-ghost">
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={confirmar}
                        className="btn-peligro">
                        {textoConfirmar}
                    </button>
                </div>

            </div>
        </div>
    )
}