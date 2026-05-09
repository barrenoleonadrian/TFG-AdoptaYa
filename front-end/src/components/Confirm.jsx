// Componente de confirmación para sustituir al confirm() del navegador.
// Muestra un mensaje y dos botones: Cancelar y Confirmar.
//
// Uso:
//   const [confirmacion, setConfirmacion] = useState(null)
//
//   function pedirEliminar(id){
//       setConfirmacion({
//           mensaje: "¿Seguro que quieres eliminar?",
//           onConfirmar: () => eliminar(id)
//       })
//   }
//
//   {confirmacion && (
//       <Confirm
//           mensaje={confirmacion.mensaje}
//           onConfirmar={confirmacion.onConfirmar}
//           onCancelar={() => setConfirmacion(null)}
//       />
//   )}

export default function Confirm({ mensaje, onConfirmar, onCancelar, textoConfirmar = "Confirmar" }) {

    function confirmar(){
        onConfirmar()
        onCancelar()   // cierra el modal después de confirmar
    }

    return (
        <div className="modal-overlay" onClick={onCancelar}>
            <div className="modal-confirm" onClick={(e) => e.stopPropagation()}>

                <p className="modal-confirm-mensaje">{mensaje}</p>

                <div className="modal-confirm-acciones">
                    <button onClick={onCancelar} className="btn btn-ghost">
                        Cancelar
                    </button>
                    <button onClick={confirmar} className="btn-peligro">
                        {textoConfirmar}
                    </button>
                </div>

            </div>
        </div>
    )
}
