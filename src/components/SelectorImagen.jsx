import { useState, useRef } from 'react'
import { Camera, Link2, X, ImageOff } from 'lucide-react'
import toast from 'react-hot-toast'

// SelectorImagen — Permite poner una imagen de DOS formas: subiendo un archivo
// (se guarda como data URL) o pegando la URL de internet. Se usa en portada,
// productos y cualquier lugar donde haya una imagen editable.

function esURLValida(url) {
  const u = (url || '').trim()
  return (
    u.startsWith('http://') ||
    u.startsWith('https://') ||
    u.startsWith('blob:') ||
    u.startsWith('data:') ||
    u.startsWith('/')
  )
}

export default function SelectorImagen({ valor = '', onCambiar, limiteMB = 2, label = 'Imagen' }) {
  const [mostrarURL, setMostrarURL] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')
  const inputFile = useRef(null)

  const subirArchivo = (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }
    if (archivo.size > limiteMB * 1024 * 1024) {
      toast.error(`La imagen debe pesar menos de ${limiteMB} MB`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => onCambiar(reader.result)
    reader.readAsDataURL(archivo)
    e.target.value = ''
  }

  const usarURL = () => {
    const url = urlDraft.trim()
    if (!esURLValida(url)) {
      toast.error('Pega una URL de imagen válida (https://…)')
      return
    }
    onCambiar(url)
    setUrlDraft('')
    setMostrarURL(false)
  }

  const hayImagen = Boolean(valor)

  return (
    <div className="space-y-2">
      {hayImagen && (
        <div className="relative w-full h-24 rounded-xl overflow-hidden ring-1 ring-line bg-soft">
          <img src={valor} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onCambiar('')}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-accent transition"
            title="Quitar imagen"
            aria-label="Quitar imagen"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {!mostrarURL ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputFile.current?.click()}
            className="flex-1 h-8 rounded-lg border border-line bg-surface text-[11px] font-medium text-ink-2 hover:border-accent hover:text-accent transition flex items-center justify-center gap-1.5"
          >
            <Camera size={13} /> {hayImagen ? 'Cambiar' : 'Subir'} imagen
          </button>
          <button
            type="button"
            onClick={() => setMostrarURL(true)}
            className="flex-1 h-8 rounded-lg border border-line bg-surface text-[11px] font-medium text-ink-2 hover:border-accent hover:text-accent transition flex items-center justify-center gap-1.5"
          >
            <Link2 size={13} /> Usar URL
          </button>
          <input ref={inputFile} type="file" accept="image/*" className="hidden" onChange={subirArchivo} />
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') usarURL() }}
            placeholder="https://…  (pegá la URL de internet)"
            className="input text-xs h-8 flex-1 min-w-0"
            autoFocus
          />
          <button
            type="button"
            onClick={usarURL}
            className="h-8 px-3 rounded-lg bg-accent text-white text-[11px] font-semibold hover:opacity-90 transition"
          >
            Usar
          </button>
          <button
            type="button"
            onClick={() => setMostrarURL(false)}
            className="h-8 px-2 rounded-lg border border-line text-ink-3 hover:text-accent transition flex items-center justify-center"
            aria-label="Cancelar"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {!hayImagen && !mostrarURL && (
        <p className="flex items-center gap-1 text-[10px] text-ink-3">
          <ImageOff size={10} /> Sin imagen por ahora — se usará el emoji del producto.
        </p>
      )}
    </div>
  )
}