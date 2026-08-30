import { useState, useRef, useEffect } from 'react'
import { Pencil, X } from 'lucide-react'

// EditorInSitu — Lápiz que aparece sobre un elemento cuando hay un admin.
// Al darle clic abre un pequeño panel anclado justo ahí (debajo/pegado a ese
// elemento), con las configuraciones de ese elemento. No es flotante global:
// aparece "en el lugar" de lo que se quiere editar.
export default function EditorInSitu({
  esEdicion = false,
  titulo = 'Editar',
  children,
  edicion,
  ancho = 'w-80',
  botonPosicion = 'top-1 right-1',
  botonClase = '',
  envoltura = 'relative inline-block max-w-full',
}) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!abierto) return
    const cerrar = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [abierto])

  if (!esEdicion) return children

  return (
    <span ref={ref} className={envoltura}>
      {children}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setAbierto((a) => !a) }}
        className={`absolute ${botonPosicion} z-30 w-7 h-7 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition ${botonClase}`}
        aria-label={titulo}
        title={titulo}
      >
        {abierto ? <X size={13} /> : <Pencil size={13} />}
      </button>
      {abierto && (
        <div className={`absolute z-40 right-0 top-full mt-2 ${ancho} max-h-[70vh] overflow-y-auto card rounded-xl shadow-2xl p-3.5 space-y-3 anim-pop`}>
          <p className="flex items-center justify-between text-[10px] uppercase tracking-widest text-accent font-semibold">
            <span>{titulo}</span>
            <span className="normal-case tracking-normal text-[10px] text-ink-3 font-normal">cambios en vivo · se guardan solos</span>
          </p>
          {edicion}
        </div>
      )}
    </span>
  )
}