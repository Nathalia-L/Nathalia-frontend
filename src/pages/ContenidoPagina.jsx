import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { cargarContenido, guardarContenido, limpiarContenido } from '../utils/contenido'

// Panel de administración de contenido de la página pública de Nathalia.
// El admin edita los textos y la imagen del hero; se guardan en localStorage
// (clave nathalia_contenido) y el Landing los muestra al instante.

const glass = {
  background: 'rgba(255,255,255,0.92)',
  border: '1px solid rgba(199,122,156,0.18)',
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  boxShadow: '0 8px 28px rgba(58,36,48,0.08)',
}

const CAMPO = (label, clave, area = false) => ({ label, clave, area })

const GRUPOS = [
  {
    titulo: 'Hero (portada)',
    descripcion: 'La primera impresión de tu tienda',
    campos: [
      CAMPO('Texto de la insignia', 'heroBadge'),
      CAMPO('Título parte 1', 'heroTitulo1'),
      CAMPO('Título parte 2 (destacado)', 'heroTitulo2'),
      CAMPO('Subtítulo', 'heroTexto', true),
      CAMPO('Texto del botón principal', 'heroCta'),
    ],
  },
  {
    titulo: 'Sección "Por qué elegirnos"',
    descripcion: 'Confianza y diferenciación',
    campos: [
      CAMPO('Título', 'nosotrosTitulo'),
      CAMPO('Subtítulo', 'nosotrosSubtitulo'),
    ],
  },
  {
    titulo: 'Sección "Cómo comprar"',
    descripcion: 'El proceso para tus clientas',
    campos: [
      CAMPO('Título', 'procesoTitulo'),
      CAMPO('Subtítulo', 'procesoSubtitulo'),
    ],
  },
  {
    titulo: 'Llamado final (CTA)',
    descripcion: 'Cierre de la página',
    campos: [
      CAMPO('Título parte 1', 'ctaFinalTitulo1'),
      CAMPO('Título parte 2 (destacado)', 'ctaFinalTitulo2'),
      CAMPO('Texto', 'ctaFinalTexto', true),
    ],
  },
  {
    titulo: 'Pie de página',
    descripcion: 'Descripción de la marca',
    campos: [
      CAMPO('Descripción', 'footerDescripcion', true),
    ],
  },
]

function ContenidoPagina() {
  const navigate = useNavigate()
  const [contenido, setContenido] = useState(() => cargarContenido())
  const [guardando, setGuardando] = useState(false)

  function actualizar(clave, valor) {
    setContenido((prev) => ({ ...prev, [clave]: valor }))
  }

  async function manejarImagenBanner(e) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes')
      return
    }
    if (archivo.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe pesar menos de 2 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => actualizar('banner', reader.result)
    reader.readAsDataURL(archivo)
  }

  function guardar() {
    setGuardando(true)
    try {
      guardarContenido(contenido)
      toast.success('Contenido guardado. Ya se ve en la página.')
    } catch (error) {
      console.error('Error guardando contenido:', error)
      toast.error('No se pudo guardar el contenido')
    } finally {
      setGuardando(false)
    }
  }

  function restablecer() {
    if (!window.confirm('¿Restablecer el contenido a los valores por defecto de Nathalia?')) return
    limpiarContenido()
    setContenido(cargarContenido())
    toast.success('Contenido restablecido')
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-admin-page-title text-2xl font-semibold">Contenido de la página</h1>
          <p className="text-admin-page-subtitle text-sm mt-1">
            Edita los textos y la imagen de portada que ven tus clientes en la tienda.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/cliente/catalogo')}
            className="text-sm px-4 py-2.5 rounded-xl transition"
            style={{ background: 'rgba(199,122,156,0.10)', color: '#A65E80', border: '1px solid rgba(199,122,156,0.3)' }}
          >
            Ver tienda (modo edición)
          </button>
          <button
            type="button"
            onClick={restablecer}
            className="text-sm px-4 py-2.5 rounded-xl transition"
            style={{ background: 'rgba(58,36,48,0.06)', color: 'rgba(58,36,48,0.7)', border: '1px solid rgba(58,36,48,0.14)' }}
          >
            Restablecer
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="text-sm font-medium px-5 py-2.5 rounded-xl text-white transition disabled:opacity-60"
            style={{ background: '#C77A9C', boxShadow: '0 4px 14px rgba(199,122,156,0.35)' }}
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Banner / imagen de portada */}
      <div className="rounded-2xl p-5 mb-4" style={glass}>
        <h2 className="text-base font-semibold text-[#3A2430] mb-1">Imagen de portada (hero)</h2>
        <p className="text-sm text-[#3A2430]/50 mb-4">
          Sube una imagen de fondo para la portada (máx. 2 MB). Si no hay imagen, se usa el video por defecto.
        </p>
        {contenido.banner ? (
          <div className="flex items-center gap-3 flex-wrap">
            <img
              src={contenido.banner}
              alt="Portada Nathalia"
              className="w-40 h-24 object-cover rounded-xl"
              style={{ border: '1px solid rgba(199,122,156,0.3)' }}
            />
            <div className="flex flex-col gap-2">
              <label
                htmlFor="banner-nathalia"
                className="cursor-pointer text-sm px-4 py-2 rounded-xl text-center transition"
                style={{ background: 'rgba(199,122,156,0.10)', color: '#A65E80', border: '1px solid rgba(199,122,156,0.3)' }}
              >
                Cambiar imagen
              </label>
              <button
                type="button"
                onClick={() => actualizar('banner', '')}
                className="text-xs px-4 py-2 rounded-xl transition"
                style={{ background: 'rgba(214,69,80,0.08)', color: '#D64550', border: '1px solid rgba(214,69,80,0.25)' }}
              >
                Quitar imagen
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="banner-nathalia"
            className="inline-flex items-center gap-2 cursor-pointer text-sm px-5 py-3 rounded-xl transition"
            style={{ background: 'rgba(199,122,156,0.10)', color: '#A65E80', border: '1px dashed rgba(199,122,156,0.5)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 16V4m0 0L7 9m5-5l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Subir imagen de portada
          </label>
        )}
        <input id="banner-nathalia" type="file" accept="image/*" onChange={manejarImagenBanner} className="hidden" />
      </div>

      {/* Grupos de campos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {GRUPOS.map((grupo) => (
          <div key={grupo.titulo} className="rounded-2xl p-5" style={glass}>
            <h2 className="text-base font-semibold text-[#3A2430] mb-0.5">{grupo.titulo}</h2>
            <p className="text-xs text-[#3A2430]/45 mb-4">{grupo.descripcion}</p>
            <div className="space-y-3">
              {grupo.campos.map((campo) => (
                <div key={campo.clave}>
                  <label htmlFor={`campo-${campo.clave}`} className="block text-xs text-[#3A2430]/55 mb-1">
                    {campo.label}
                  </label>
                  {campo.area ? (
                    <textarea
                      id={`campo-${campo.clave}`}
                      rows={2}
                      value={contenido[campo.clave] || ''}
                      onChange={(e) => actualizar(campo.clave, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm text-[#3A2430] focus:outline-none resize-y"
                      style={{ background: 'rgba(58,36,48,0.05)', border: '1px solid rgba(58,36,48,0.12)' }}
                    />
                  ) : (
                    <input
                      id={`campo-${campo.clave}`}
                      type="text"
                      value={contenido[campo.clave] || ''}
                      onChange={(e) => actualizar(campo.clave, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm text-[#3A2430] focus:outline-none"
                      style={{ background: 'rgba(58,36,48,0.05)', border: '1px solid rgba(58,36,48,0.12)' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContenidoPagina
