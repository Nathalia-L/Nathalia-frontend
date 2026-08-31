import { useState } from 'react'
import toast from 'react-hot-toast'
import { X, Plus, Trash2, ImagePlus } from 'lucide-react'

const leerImagen = (archivo, cb) => {
  if (!archivo) return
  if (!archivo.type.startsWith('image/')) return toast.error('Solo imágenes')
  if (archivo.size > 2 * 1024 * 1024) return toast.error('Máx 2 MB por imagen')
  const reader = new FileReader()
  reader.onload = () => cb(reader.result)
  reader.readAsDataURL(archivo)
}

// Panel admin del carrusel de clientas del inicio: sube fotos (o enlaces),
// edita texto, ordena y configura velocidad/activación.
export default function PanelClientas({ open, contenido, onClose, onGuardar }) {
  const [fotos, setFotos] = useState(() => (contenido.clientas && contenido.clientas.length ? contenido.clientas : []))
  const [activo, setActivo] = useState(contenido.clientasActivo !== false)
  const [auto, setAuto] = useState(contenido.clientasAuto ?? 4500)

  const actualizar = (id, campo, valor) => {
    setFotos((prev) => prev.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)))
  }

  const eliminar = (id) => {
    setFotos((prev) => prev.filter((f) => f.id !== id))
    toast.success('Foto eliminada')
  }

  const agregar = () => {
    setFotos((prev) => [...prev, { id: Date.now(), imagen: '', titulo: '', texto: '' }])
  }

  const guardar = () => {
    onGuardar({
      ...contenido,
      clientas: fotos.filter((f) => f.imagen),
      clientasActivo: activo,
      clientasAuto: Math.max(2000, Number(auto) || 4500),
    })
    toast.success('Carrusel de clientas guardado ✅')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-overlay backdrop-blur-sm anim-overlay" onClick={onClose}>
      <div className="card w-full max-w-2xl rounded-2xl max-h-[92vh] flex flex-col anim-pop" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <div>
            <h2 className="font-display font-bold text-ink">📸 Carrusel de clientas</h2>
            <p className="text-[11px] text-ink-3 mt-0.5">Fotos de personas usando tus productos (el inicio)</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-elevated border border-line flex items-center justify-center text-ink-2 hover:text-ink" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Config */}
          <div className="card rounded-xl p-3 border border-line space-y-3">
            <label className="flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
              <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="accent-[var(--na-accent)] w-4 h-4" />
              Mostrar la sección en el inicio
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-2">
              <span className="text-ink-3">Velocidad (ms):</span>
              <input
                type="number"
                min="2000"
                step="500"
                value={auto}
                onChange={(e) => setAuto(e.target.value)}
                className="input text-sm w-28"
              />
            </label>
          </div>

          {/* Fotos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-ink-2 uppercase tracking-wide">{fotos.length} foto{fotos.length !== 1 ? 's' : ''}</p>
              <button type="button" onClick={agregar} className="h-9 px-3 rounded-xl bg-accent text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-accent-strong transition">
                <Plus size={14} /> Agregar foto
              </button>
            </div>

            {fotos.length === 0 && (
              <div className="text-center py-8 card rounded-xl">
                <ImagePlus size={28} className="mx-auto text-ink-3 mb-2" />
                <p className="text-sm text-ink-3 mb-2">Toca "Agregar foto" y sube una imagen o pega su enlace.</p>
                <button type="button" onClick={agregar} className="btn btn-primary btn-sm mx-auto inline-flex">📸 Agregar foto</button>
              </div>
            )}

            {fotos.map((f) => (
              <div key={f.id} className="card rounded-xl p-3 border border-line">
                <div className="flex gap-3">
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-bg-soft flex items-center justify-center shrink-0">
                    {f.imagen ? (
                      <img src={f.imagen} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📷</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <textarea
                      rows={1}
                      value={f.texto || ''}
                      onChange={(e) => actualizar(f.id, 'texto', e.target.value)}
                      placeholder="Leyenda (ej. «✨ El maquillaje perfecto para el día a día»)"
                      className="input text-sm w-full resize-y"
                    />
                    <input
                      value={f.titulo || ''}
                      onChange={(e) => actualizar(f.id, 'titulo', e.target.value)}
                      placeholder="Etiqueta (ej. @mariana · Labial rosa)"
                      className="input text-sm w-full"
                    />
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-accent rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-accent-strong transition">
                        📱 Subir foto
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => leerImagen(e.target.files?.[0], (dataUrl) => actualizar(f.id, 'imagen', dataUrl))} />
                      </label>
                    </div>
                    <input
                      value={f.imagen && !f.imagen.startsWith('data:') ? f.imagen : ''}
                      onChange={(e) => actualizar(f.id, 'imagen', e.target.value)}
                      placeholder="…o pega aquí el enlace https:// de la imagen"
                      className="input text-sm w-full"
                    />
                    <button
                      type="button"
                      onClick={() => eliminar(f.id)}
                      className="h-7 px-2 rounded-lg text-error bg-error/10 text-[11px] font-semibold flex items-center gap-1 hover:bg-error/20 transition"
                    >
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <div className="flex gap-3 px-5 py-4 border-t border-line shrink-0">
          <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Cancelar</button>
          <button type="button" onClick={guardar} className="btn btn-primary flex-[2]">Guardar clientas</button>
        </div>
      </div>
    </div>
  )
}