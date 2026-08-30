import { useCarrito } from '../context/CarritoContext'
import ImagenProducto from './ImagenProducto'
import { Trash2 } from 'lucide-react'

function FilaProducto({ id, imagen, nombre, presentacion, precio, unidad }) {
  const { aumentarCantidad, disminuirCantidad, eliminarProducto, productos } = useCarrito()

  const producto = productos.find(p => p.id === id)
  const cantidad = producto?.cantidad ?? 0

  return (
    <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-3 items-center gap-3 px-4 sm:px-6 py-5 border-b border-line last:border-b-0">

      <div className="flex items-center gap-4 min-w-0">
        <ImagenProducto src={imagen} alt={nombre} className="w-14 h-14 rounded-lg object-cover bg-surface shrink-0 border border-line" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{nombre}</p>
          <p className="text-xs text-ink-3 truncate">{presentacion}</p>
        </div>
      </div>

      <span className="text-sm text-ink justify-self-end sm:justify-self-start">
        ${precio.toLocaleString('es-CO')} <span className="text-ink-3 text-xs">/ {unidad || 'kg'}</span>
      </span>

      <div className="flex items-center justify-self-end gap-2">
        <div className="flex items-center bg-surface border border-line rounded-lg">
          <button
            type="button"
            onClick={() => disminuirCantidad(id)}
            className="w-8 h-8 text-ink-2 hover:text-ink text-base leading-none flex items-center justify-center rounded-l-lg hover:bg-accent-light/40 transition"
          >
            −
          </button>
          <span className="text-sm font-semibold text-ink w-6 text-center">{cantidad}</span>
          <button
            type="button"
            onClick={() => aumentarCantidad(id)}
            className="w-8 h-8 text-ink-2 hover:text-ink text-base leading-none flex items-center justify-center rounded-r-lg hover:bg-accent-light/40 transition"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => eliminarProducto(id)}
          className="w-8 h-8 rounded-lg bg-surface border border-line text-ink-3 hover:text-error hover:border-error/50 transition-colors flex items-center justify-center"
          aria-label={`Eliminar ${nombre} del carrito`}
        >
          <Trash2 size={14} />
        </button>
      </div>

    </div>
  )
}

export default FilaProducto