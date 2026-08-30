import { useState } from 'react'
import { API_URL } from "../config";

function obtenerIdCliente() {
  try {
    const cliente = JSON.parse(localStorage.getItem('cliente'))
    return cliente?.id ?? null
  } catch {
    return null
  }
}

// Ahora es "controlado": el padre decide si está abierto (onCerrar lo cierra).
// Este componente ya no maneja su propio "abierto" — solo el contenido del formulario.
function FormularioResena({ id_detalle, producto_nombre, onCerrar, onEnviado }) {
  const [calificacion, setCalificacion] = useState(0)
  const [hoverCalificacion, setHoverCalificacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const enviarResena = async () => {
    if (calificacion === 0) {
      setError('Selecciona al menos una estrella')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/resenas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: obtenerIdCliente(),
          id_detalle,
          calificacion,
          comentario
        })
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.mensaje)
      onEnviado()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-ink">Reseñar {producto_nombre}</h3>
        <button type="button" onClick={onCerrar} className="text-ink-3 text-xs hover:text-ink">✕</button>
      </div>

      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((valor) => (
          <button
            key={valor}
            type="button"
            onClick={() => setCalificacion(valor)}
            onMouseEnter={() => setHoverCalificacion(valor)}
            onMouseLeave={() => setHoverCalificacion(0)}
            className="text-3xl leading-none text-gold transition-transform hover:scale-110"
          >
            {(hoverCalificacion || calificacion) >= valor ? '★' : '☆'}
          </button>
        ))}
      </div>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Cuéntanos qué te pareció el producto: calidad, acabado, precio..."
        rows={4}
        className="w-full text-sm bg-surface border border-line rounded-lg p-4
                   text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent
                   resize-none"
      />

      {error && <p className="text-xs text-gold mt-2">{error}</p>}

      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={enviarResena}
          disabled={enviando}
          className="text-sm bg-accent text-white px-5 py-2.5 rounded-lg font-medium
                     hover:bg-accent-strong disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Enviar reseña'}
        </button>
        <button type="button" onClick={onCerrar} className="text-sm text-ink-3 px-5 py-2.5">
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default FormularioResena