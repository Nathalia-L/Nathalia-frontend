import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import EditableTexto from './EditableTexto'

// Carrusel de "clientas en acción": fotos de personas usando los productos.
// Prueba social profesional: una foto grande con leyenda, auto-avance, flechas
// y puntos. El admin la edita con el lápiz (PanelClientas).
export default function CarruselClientas({ slides, auto = 4500, esEdicion, onEditar, contenido, onCambio }) {
  const [idx, setIdx] = useState(0)
  const total = slides.length

  useEffect(() => {
    if (auto <= 0 || total <= 1) return
    const id = setInterval(() => setIdx((i) => (i + 1) % total), auto)
    return () => clearInterval(id)
  }, [auto, total])

  if (!slides || total === 0) return null
  const s = slides[((idx % total) + total) % total]

  return (
    <section id="clientas" className="py-14 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12">
          <span className="kicker justify-center">
            <EditableTexto valor={contenido.clientasKicker} clave="clientasKicker" onCambio={onCambio} esEdicion={esEdicion} />
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold mt-3 tracking-tight">
            <EditableTexto valor={contenido.clientasTitulo} clave="clientasTitulo" onCambio={onCambio} esEdicion={esEdicion} />
          </h2>
          <div className="w-20 h-px bg-gold/50 mx-auto mt-5" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          {esEdicion && (
            <button
              type="button"
              onClick={onEditar}
              className="absolute -top-1 right-0 z-30 w-9 h-9 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition"
              title={esEdicion ? 'Editar carrusel de clientas' : ''}
              aria-label="Editar carrusel de clientas"
            >
              <Pencil size={15} />
            </button>
          )}

          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-gold/25 bg-bg-soft">
            <div className="relative aspect-[4/3] sm:aspect-[21/10]">
              {slides.map((foto, i) => (
                <img
                  key={foto.id}
                  src={foto.imagen}
                  alt={foto.titulo || 'Clienta Nathalia'}
                  draggable="false"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${i === ((idx % total) + total) % total ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

              {/* Leyenda */}
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 flex items-end justify-between gap-4">
                <div className="text-white">
                  {(s.titulo || s.texto) && (
                    <span className="glass rounded-full px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold mb-2">
                      <span className="relative flex w-1.5 h-1.5">
                        <span className="absolute inline-flex w-full h-full rounded-full bg-gold pulse-ring"></span>
                        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-gold"></span>
                      </span>
                      {s.titulo || 'Clienta Nathalia'}
                    </span>
                  )}
                  {s.texto && <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-lg drop-shadow">{s.texto}</p>}
                </div>
              </div>
            </div>

            {/* Flechas */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIdx((i) => (i - 1 + total) % total)}
                  aria-label="Anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-sm transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => setIdx((i) => (i + 1) % total)}
                  aria-label="Siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-sm transition"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Puntos + miniaturas */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-2 mt-5">
              {slides.map((foto, i) => (
                <button
                  key={foto.id}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={`rounded-full transition-all ${i === ((idx % total) + total) % total ? 'w-6 bg-gold' : 'w-2.5 bg-line hover:bg-ink-3'}`}
                  style={{ height: 10 }}
                  aria-label={`Foto ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}