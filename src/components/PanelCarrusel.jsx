import { useState } from 'react'
import toast from 'react-hot-toast'
import { X, Plus, Trash2, ChevronLeft, ChevronRight, ImagePlus } from 'lucide-react'

const ALTURAS_CARRUSEL = [
  { id: 'baja', label: 'Compacta' },
  { id: 'media', label: 'Media' },
  { id: 'alta', label: 'Grande' },
]

const POSICIONES_TEXTO = [
  { id: 'izquierda', label: 'Izquierda' },
  { id: 'centro', label: 'Centro' },
  { id: 'derecha', label: 'Derecha' },
]

const leerImagen = (archivo, cb) => {
  if (!archivo) return
  if (!archivo.type.startsWith('image/')) return toast.error('Solo imágenes')
  if (archivo.size > 2 * 1024 * 1024) return toast.error('Máx 2 MB por imagen')
  const reader = new FileReader()
  reader.onload = () => cb(reader.result)
  reader.readAsDataURL(archivo)
}

export default function PanelCarrusel({ open, contenido, colecciones = [], onClose, onGuardar }) {
  const [slides, setSlides] = useState(() => (contenido.carrusel && contenido.carrusel.length ? contenido.carrusel : []))
  const [auto, setAuto] = useState(contenido.carruselAuto ?? 5000)
  const [altura, setAltura] = useState(contenido.carruselAltura ?? 'media')
  const [mostrarTexto, setMostrarTexto] = useState(contenido.carruselMostrarTexto ?? true)

  const actualizar = (id, campo, valor) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, [campo]: valor } : s)))
  }

  const mover = (id, dir) => {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      const nuevo = [...prev]
      const j = idx + dir
      if (j < 0 || j >= nuevo.length) return prev
      ;[nuevo[idx], nuevo[j]] = [nuevo[j], nuevo[idx]]
      return nuevo
    })
  }

  const eliminar = (id) => {
    setSlides((prev) => prev.filter((s) => s.id !== id))
    toast.success('Imagen eliminada')
  }

  const agregar = () => {
    setSlides((prev) => [
      ...prev,
      { id: Date.now(), imagen: '', emoji: '✨', titulo: '', kicker: '', texto: '', cta: '', destino: '', posicion: 'centro', overlay: true },
    ])
  }

  const guardar = () => {
    onGuardar({
      ...contenido,
      carrusel: slides.filter((s) => s.imagen || s.titulo || s.texto),
      carruselAuto: Math.max(2000, Number(auto) || 5000),
      carruselAltura: altura,
      carruselMostrarTexto: mostrarTexto,
    })
    toast.success('Carrusel guardado ✅')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-overlay backdrop-blur-sm anim-overlay" onClick={onClose}>
      <div className="card w-full max-w-2xl rounded-2xl max-h-[92vh] flex flex-col anim-pop" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <div>
            <h2 className="font-display font-bold text-ink">🎠 Carrusel de imágenes</h2>
            <p className="text-[11px] text-ink-3 mt-0.5">Sube, ordena y estiliza las imágenes del catálogo</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-elevated text-ink-2 hover:text-ink border border-line"><X size={15} className="mx-auto" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Configuración general */}
          <div className="card rounded-xl p-4">
            <p className="text-xs font-semibold text-ink-2 uppercase tracking-wide mb-3">Estilo del carrusel</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-ink-3 mb-1">Altura</label>
                <select value={altura} onChange={(e) => setAltura(e.target.value)} className="input text-sm">
                  {ALTURAS_CARRUSEL.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-ink-3 mb-1">Auto (ms)</label>
                <input
                  type="number"
                  min={2000}
                  step={500}
                  value={auto}
                  onChange={(e) => setAuto(e.target.value)}
                  className="input text-sm"
                  placeholder="5000"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm cursor-pointer text-ink-2">
                  <input type="checkbox" checked={mostrarTexto} onChange={(e) => setMostrarTexto(e.target.checked)} className="accent-[var(--na-accent)] w-4 h-4" />
                  Mostrar textos
                </label>
              </div>
            </div>
          </div>

          {/* Slides */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-ink-2 uppercase tracking-wide">{slides.length} imagen{slides.length !== 1 ? 'es' : ''}</p>
              <button type="button" onClick={agregar} className="h-9 px-3 rounded-xl bg-accent text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-accent-strong transition">
                <Plus size={14} /> Agregar imagen
              </button>
            </div>

            {slides.length === 0 && (
              <div className="text-center py-8 card rounded-xl">
                <ImagePlus size={28} className="mx-auto text-ink-3 mb-2" />
                <p className="text-sm text-ink-3 mb-2">Aún no hay imágenes. Toca "Agregar imagen" y ahí podrás 📱 subir una foto o pegar su enlace.</p>
                <button type="button" onClick={agregar} className="btn btn-primary btn-sm mx-auto inline-flex">🎠 Agregar imagen</button>
                <p className="text-[11px] text-ink-3 mt-3">✳️ Si guardas el carrusel vacío, en el catálogo se mostrará automáticamente la foto de cada producto.</p>
              </div>
            )}

            {slides.map((s, i) => (
              <div key={s.id} className="card rounded-xl p-3 border border-line">
                <div className="flex gap-3">
                  {/* Imagen + enlace */}
                  <div className="w-24 shrink-0">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-bg-soft flex items-center justify-center relative">
                      {s.imagen ? (
                        <img src={s.imagen} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{s.emoji || '📸'}</span>
                      )}
                      <label className="absolute inset-x-0 bottom-0 py-1.5 text-center text-[10px] font-bold text-white bg-black/55 cursor-pointer hover:bg-black/70 transition">
                        📱 Subir
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => leerImagen(e.target.files?.[0], (dataUrl) => actualizar(s.id, 'imagen', dataUrl))} />
                      </label>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Enlace de imagen */}
                    <label className="block text-[11px] font-medium text-ink-3 mb-1">Enlace de la imagen 👇 <span className="text-ink-3/70">(o 📱 sube una foto arriba)</span></label>
                    <input
                      value={s.imagen && !s.imagen.startsWith('data:') ? s.imagen : ''}
                      onChange={(e) => actualizar(s.id, 'imagen', e.target.value)}
                      placeholder="https://…/imagen.jpg (si no tienes foto)"
                      className="input text-sm w-full"
                    />
                  </div>
                </div>

                {/* Campos */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <input value={s.titulo || ''} onChange={(e) => actualizar(s.id, 'titulo', e.target.value)} placeholder="Título principal" className="input text-sm col-span-2" />
                  <input value={s.kicker || ''} onChange={(e) => actualizar(s.id, 'kicker', e.target.value)} placeholder="Etiqueta (Nuevo · Oferta…)" className="input text-sm" />
                    <input value={s.cta || ''} onChange={(e) => actualizar(s.id, 'cta', e.target.value)} placeholder="Botón (Ver colección…)" className="input text-sm" />
                    <textarea
                      rows={2}
                      value={s.texto || ''}
                      onChange={(e) => actualizar(s.id, 'texto', e.target.value)}
                      placeholder="Texto descriptivo…"
                      className="input text-sm resize-y col-span-2"
                    />
                    <select value={s.destino || ''} onChange={(e) => actualizar(s.id, 'destino', e.target.value)} className="input text-sm">
                      <option value="">Al tocar → nada</option>
                      {(colecciones || []).map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                      <option value="favoritos">❤ Favoritos</option>
                    </select>
                    <select value={s.posicion || 'centro'} onChange={(e) => actualizar(s.id, 'posicion', e.target.value)} className="input text-sm">
                      {POSICIONES_TEXTO.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                    <label className="flex items-center gap-2 text-xs text-ink-2 col-span-2 cursor-pointer">
                      <input type="checkbox" checked={s.overlay !== false} onChange={(e) => actualizar(s.id, 'overlay', e.target.checked)} className="accent-[var(--na-accent)] w-4 h-4" />
                      Fondo oscuro para el texto
                    </label>
                  </div>

                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-line">
                  <button type="button" onClick={() => mover(s.id, -1)} disabled={i === 0} className="h-8 w-8 rounded-lg bg-elevated border border-line text-ink-2 hover:text-accent disabled:opacity-30 flex items-center justify-center" aria-label="Mover antes"><ChevronLeft size={14} /></button>
                  <button type="button" onClick={() => mover(s.id, 1)} disabled={i === slides.length - 1} className="h-8 w-8 rounded-lg bg-elevated border border-line text-ink-2 hover:text-accent disabled:opacity-30 flex items-center justify-center" aria-label="Mover después"><ChevronRight size={14} /></button>
                  <span className="text-[11px] text-ink-3 mx-1">Posición {i + 1}</span>
                  <button type="button" onClick={() => eliminar(s.id)} className="ml-auto h-8 px-2.5 rounded-lg text-error bg-error/10 text-xs font-semibold flex items-center gap-1 hover:bg-error/20 transition">
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <div className="flex gap-3 px-5 py-4 border-t border-line shrink-0">
          <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Cancelar</button>
          <button type="button" onClick={guardar} className="btn btn-primary flex-[2]">Guardar carrusel</button>
        </div>
      </div>
    </div>
  )
}