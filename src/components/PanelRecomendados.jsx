import { useState } from 'react'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

// Panel admin del carrusel de productos recomendados del catálogo.
// Elige qué colección se muestra ('' = todas), la velocidad y si está activo.
export default function PanelRecomendados({ open, contenido, colecciones = [], onClose, onGuardar }) {
  const [activo, setActivo] = useState(contenido.recomendadosActivo !== false)
  const [coleccion, setColeccion] = useState(contenido.recomendadosColeccion || '')
  const [auto, setAuto] = useState(contenido.recomendadosAuto ?? 3500)
  const [titulo, setTitulo] = useState(contenido.recomendadosTitulo || 'Tal vez te guste ✨')

  const guardar = () => {
    onGuardar({
      ...contenido,
      recomendadosActivo: activo,
      recomendadosColeccion: coleccion,
      recomendadosAuto: Math.max(2000, Number(auto) || 3500),
      recomendadosTitulo: titulo.trim() || 'Tal vez te guste ✨',
    })
    toast.success('Carrusel de productos guardado ✅')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-overlay backdrop-blur-sm anim-overlay" onClick={onClose}>
      <div className="card w-full max-w-md rounded-2xl flex flex-col anim-pop" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <div>
            <h2 className="font-display font-bold text-ink">🎲 Carrusel de productos</h2>
            <p className="text-[11px] text-ink-3 mt-0.5">Fila de tarjetas "Tal vez te guste" en el catálogo</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-elevated border border-line flex items-center justify-center text-ink-2 hover:text-ink" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <label className="flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="accent-[var(--na-accent)] w-4 h-4" />
            Mostrar la fila recomendada en el catálogo
          </label>

          <div>
            <span className="block text-[11px] font-medium text-ink-3 mb-1">Título de la fila</span>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="input text-sm w-full" placeholder="Tal vez te guste ✨" />
          </div>

          <div>
            <span className="block text-[11px] font-medium text-ink-3 mb-1">¿Qué productos mostrar?</span>
            <select value={coleccion} onChange={(e) => setColeccion(e.target.value)} className="input text-sm w-full">
              <option value="">Todas las colecciones</option>
              {(colecciones || []).map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-ink-3 mt-1.5">Se usa la colección elegida (o todo el catálogo) en orden destacado.</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-2">
            <span className="text-ink-3">Velocidad (ms):</span>
            <input type="number" min="2000" step="500" value={auto} onChange={(e) => setAuto(e.target.value)} className="input text-sm w-28" />
          </label>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-line shrink-0">
          <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Cancelar</button>
          <button type="button" onClick={guardar} className="btn btn-primary flex-[2]">Guardar productos</button>
        </div>
      </div>
    </div>
  )
}