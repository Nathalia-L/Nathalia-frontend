import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ALTURAS = {
  baja: 'h-44 sm:h-52 lg:h-60',
  media: 'h-56 sm:h-72 lg:h-80',
  alta: 'h-64 sm:h-80 lg:h-96',
}

const POSICIONES = {
  izquierda: 'justify-start text-left pl-6 sm:pl-12',
  centro: 'justify-center text-center px-6',
  derecha: 'justify-end text-right pr-6 sm:pr-12',
}

export default function CarruselCatalogo({ diapositivas, auto = 5000, altura = 'media', mostrarTexto = true, onIrColeccion, esEdicion = false }) {
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)
  const touchX = useRef(null)

  const total = diapositivas.length
  const actual = total ? ((indice % total) + total) % total : 0
  const velocidad = Math.max(2000, auto || 5000)

  useEffect(() => {
    if (total <= 1 || pausado) return
    const id = setInterval(() => setIndice((i) => (i + 1) % total), velocidad)
    return () => clearInterval(id)
  }, [total, pausado, velocidad])

  if (total === 0) return null

  const ir = (dir) => setIndice((i) => (i + dir + total) % total)

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-line shadow-xl shadow-ink/5 group select-none touch-pan-y ${ALTURAS[altura] || ALTURAS.media}`}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > 40) ir(dx < 0 ? 1 : -1)
      }}
      role="region"
      aria-label="Carrusel de imágenes"
    >
      <div className="absolute inset-0 flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${actual * 100}%)` }}>
        {diapositivas.map((d, i) => (
          <div key={d.id || i} className="relative w-full h-full shrink-0 overflow-hidden">
            {d.imagen
              ? <img src={d.imagen} alt={d.titulo || ''} className="absolute inset-0 w-full h-full object-cover" draggable="false" />
              : (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-blush to-accent-light/70">
                  <span className="text-5xl">{d.emoji || '📸'}</span>
                </div>
              )}
            {(d.overlay ?? true) && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-black/10" />
            )}
            {mostrarTexto && (
              <div className={`absolute inset-0 flex items-center ${POSICIONES[d.posicion] || POSICIONES.centro}`}>
                <div className="max-w-lg">
                  {d.kicker && <span className="badge badge-gold inline-flex mb-2 !text-[10px]">{d.kicker}</span>}
                  {d.titulo && (
                    <h3 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight drop-shadow-lg">
                      {d.titulo}
                    </h3>
                  )}
                  {d.texto && <p className="text-white/85 text-sm sm:text-base mt-2 max-w-md drop-shadow">{d.texto}</p>}
                  {d.cta && (
                    <button
                      type="button"
                      onClick={() => { if (d.destino) onIrColeccion?.(d.destino) }}
                      className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-white text-ink text-xs sm:text-sm font-bold px-5 shadow-lg hover:bg-gold hover:text-white transition"
                    >
                      {d.cta} →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          {/* Barra de progreso del auto */}
          {!pausado && (
            <span
              key={actual}
              className="absolute bottom-0 left-0 h-1 bg-gold/90 z-10 rounded-r-full"
              style={{ width: '100%', transformOrigin: 'left', animation: `carrusel-progreso ${velocidad}ms linear forwards` }}
              aria-hidden="true"
            />
          )}

          <button
            type="button"
            aria-label="Anterior"
            onClick={() => ir(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition hover:bg-white/40 active:scale-90"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => ir(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition hover:bg-white/40 active:scale-90"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md">
            {diapositivas.map((d, i) => (
              <button
                key={d.id || i}
                type="button"
                aria-label={`Ir a la diapositiva ${i + 1}`}
                onClick={() => setIndice(i)}
                className={`rounded-full transition-all ${i === actual ? 'w-6 h-2 bg-gold' : 'w-2 h-2 bg-white/60 hover:bg-white'}`}
              />
            ))}
          </div>
          {esEdicion && (
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/80 text-[10px] font-medium">
              🎠 {total} {total === 1 ? 'imagen' : 'imágenes'}
            </span>
          )}
        </>
      )}
    </div>
  )
}