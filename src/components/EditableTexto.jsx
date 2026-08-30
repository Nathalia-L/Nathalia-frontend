import { useState, useRef, useEffect } from 'react'
import { Pencil } from 'lucide-react'

// Texto editable en vivo: en modo edición se muestra con un lápiz y al hacer
// clic se convierte en input/textarea. Guarda al salir o con Enter.
export default function EditableTexto({ valor, clave, onCambio, clase = '', multilinea = false, esEdicion = false }) {
  const [abierto, setAbierto] = useState(false)
  const [borrador, setBorrador] = useState(valor)
  const ref = useRef(null)

  useEffect(() => { if (abierto) ref.current?.focus() }, [abierto])

  const abrir = () => { setBorrador(valor); setAbierto(true) }

  const guardar = () => {
    onCambio(clave, borrador)
    setAbierto(false)
  }

  if (!esEdicion) return <span className={clase}>{valor}</span>

  if (abierto) {
    return multilinea ? (
      <textarea
        ref={ref}
        value={borrador}
        onChange={(e) => setBorrador(e.target.value)}
        onBlur={guardar}
        rows={3}
        className="input block w-full resize-y"
      />
    ) : (
      <input
        ref={ref}
        value={borrador}
        onChange={(e) => setBorrador(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); guardar() } }}
        onBlur={guardar}
        className="input inline-block max-w-full"
      />
    )
  }

  return (
    <span
      className={`group relative cursor-text inline ${clase}`}
      onClick={(e) => { e.stopPropagation(); abrir() }}
      title="Clic para editar"
    >
      {valor}{' '}
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white ml-0.5 align-middle shadow-sm">
        <Pencil size={11} />
      </span>
    </span>
  )
}