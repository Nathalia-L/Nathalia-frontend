import { useState } from 'react'
import { Dices, X, Star, ShoppingBag, ArrowLeft, Check } from 'lucide-react'
import { CATEGORIAS_ACTIVAS } from '../utils/contenido'
import { abrirWhatsApp } from '../utils/whatsapp'
import IconoWhatsApp from '../components/IconoWhatsApp'

const RANGOS_PRECIO = [
  { id: 'low', label: 'Menos de $50.000', max: 50000 },
  { id: 'mid', label: '$50.000 – $100.000', min: 50000, max: 100000 },
  { id: 'high', label: 'Más de $100.000', min: 100000 },
  { id: 'any', label: 'Sin límite 💫' },
]

// Qué desea (solo maquillaje) + palabras clave para recomendar mejor
const TIPOS_MAQUILLAJE = [
  { id: 'base', emoji: '🎨', label: 'Base o corrector', palabras: ['base', 'corrector', 'tono', 'cobertura', 'mate', 'polvo', 'fijador'] },
  { id: 'labial', emoji: '💄', label: 'Labial o gloss', palabras: ['labial', 'gloss', 'tinta', 'lip', 'brillo labial', 'balsamo', 'mate labios'] },
  { id: 'ojos', emoji: '👁️', label: 'Ojos / sombras', palabras: ['sombras', 'delineador', 'pestañas', 'rimel', 'mascara', 'cejas', 'eye'] },
  { id: 'rubor', emoji: '🌸', label: 'Rubor o resaltador', palabras: ['rubor', 'blush', 'contorno', 'bronzer', 'resaltador', 'iluminador'] },
  { id: 'kit', emoji: '🧳', label: 'Kit completo', palabras: ['kit', 'set', 'completo', 'pack', 'joya'] },
]

const TONOS_PIEL = [
  { id: 'clara', label: 'Clara', swatch: '#F6D7C2', desc: 'Tonos suaves y polvo rosado' },
  { id: 'media', label: 'Media', swatch: '#C68863', desc: 'Tonos cálidos y dorados' },
  { id: 'oscura', label: 'Oscura', swatch: '#8A5334', desc: 'Tonos intensos y brillantes' },
]

// Colores favoritos (chips seleccionables)
const COLORES_FAVORITOS = ['Rosado', 'Rojo', 'Nude', 'Coral', 'Morado', 'Dorado', 'Plateado', 'Azul', 'Verde', 'Negro']

// ¿Algo que te llame la atención?
const IDEAS_ATENCION = ['Sombra brillante ✨', 'Efecto mate', 'Labial de larga duración', 'Resaltador radiante', 'Todo en uno']

const formatPrecio = (n) => '$' + Number(n || 0).toLocaleString('es-CO')

function barajar(lista) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

function limpiar(texto) {
  return String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function VisualMini({ p }) {
  if (p.imagen) return <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blush to-accent-light/70">
      <span className="text-4xl drop-shadow-lg">{p.emoji || '✨'}</span>
    </div>
  )
}

function BotonVolver({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="text-xs text-ink-3 hover:text-ink transition mb-3 flex items-center gap-1">
      <ArrowLeft size={13} /> {children}
    </button>
  )
}

function tituloPaso(texto, sub = '') {
  return (
    <div className="mb-4">
      <p className="text-sm font-semibold text-ink">{texto}</p>
      {sub && <p className="text-xs text-ink-3 mt-1">{sub}</p>}
    </div>
  )
}

function Chip({ activo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 px-3 rounded-full text-xs font-medium transition border flex items-center gap-1.5 ${
        activo ? 'bg-accent text-white border-accent shadow-md' : 'card text-ink-2 hover:border-accent hover:text-accent'
      }`}
    >
      {activo && <Check size={12} />}
      {children}
    </button>
  )
}

export default function AyudaElegir({ open, onClose, productos, colecciones, onAgregar, onComprar, onVer, numeroWhatsApp }) {
  const [paso, setPaso] = useState(1)
  const [categoria, setCategoria] = useState(null)
  const [tipos, setTipos] = useState([])
  const [piel, setPiel] = useState(null)
  const [colores, setColores] = useState([])
  const [atencion, setAtencion] = useState('')
  const [presupuesto, setPresupuesto] = useState(null)

  if (!open) return null

  const etiquetasCategoria = (colecciones || [])
  const opcionesCategoria = CATEGORIAS_ACTIVAS
    .map((id) => etiquetasCategoria.find((c) => c.id === id))
    .filter(Boolean)

  const esMaquillaje = categoria === 'maquillaje'
  // pasos: 1 categoría · 2 tipos (solo maquillaje) · 3 piel · 4 colores · 5 atención · 6 presupuesto · 7 sugerencias
  const totalPasos = esMaquillaje ? 7 : 3

  const reiniciar = () => {
    setPaso(1)
    setCategoria(null)
    setTipos([])
    setPiel(null)
    setColores([])
    setAtencion('')
    setPresupuesto(null)
  }

  const cerrar = () => {
    reiniciar()
    onClose()
  }

  const rango = RANGOS_PRECIO.find((r) => r.id === presupuesto)
  const coincidencias = sugerir(productos, { categoria, tipos, piel, colores, atencion, rango })

  const escribirWhatsApp = () => {
    cerrar()
    abrirWhatsApp(
      `Hola 👋, necesito ayuda para elegir un producto de Nathalia (${opcionesCategoria.map((c) => c.label).join(' o ')}) y no sé cuál escoger.`,
      numeroWhatsApp
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm" onClick={cerrar}>
      <div className="card w-full max-w-md rounded-2xl p-6 sm:p-7 anim-pop max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-strong text-white flex items-center justify-center shadow-md">
              <Dices size={19} />
            </div>
            <div>
              <p className="font-display font-bold text-ink leading-tight">¿No sabes qué elegir?</p>
              <p className="text-[11px] text-ink-3 mt-0.5">{esMaquillaje ? `Te ayudamos con ${totalPasos - 1} preguntas ✨` : 'Te ayudamos en 2 pasos ✨'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tabular-nums px-2 py-1 rounded-full bg-ink/5 text-ink-3 font-medium">Paso {Math.min(paso, totalPasos)}/{totalPasos}</span>
            <button type="button" onClick={cerrar} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-3 hover:text-error hover:bg-error/10 transition" aria-label="Cerrar">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* PASO 1 — categoría */}
        {paso === 1 && (
          <div>
            <p className="text-sm font-semibold text-ink mb-3">¿Qué te apetece hoy?</p>
            <div className="grid grid-cols-2 gap-3">
              {opcionesCategoria.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setCategoria(c.id); setPaso(2) }}
                  className="group card rounded-xl p-4 flex flex-col items-center gap-2 hover:border-accent hover:shadow-md transition cursor-pointer"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{c.emoji}</span>
                  <span className="text-sm font-semibold text-ink">{c.label}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={escribirWhatsApp} className="mt-5 w-full h-10 rounded-xl text-xs font-medium text-ink-2 hover:text-accent transition">
              <IconoWhatsApp className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-[#25D366]" /> ¿Otra cosa? Pregúntanos por WhatsApp
            </button>
          </div>
        )}

        {/* PASO 2 — qué desea (solo maquillaje) */}
        {paso === 2 && esMaquillaje && (
          <div>
            <BotonVolver onClick={() => setPaso(1)}>Volver</BotonVolver>
            {tituloPaso('¿Qué deseas?', 'Elige una o varias: así afinamos tu recomendación')}
            <div className="grid grid-cols-2 gap-2">
              {TIPOS_MAQUILLAJE.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipos((prev) => (prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id]))}
                  className={`card rounded-xl p-3 flex flex-col items-center gap-1.5 transition cursor-pointer border ${
                    tipos.includes(t.id) ? 'border-accent bg-accent-light/40' : 'hover:border-accent'
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="text-xs font-semibold text-ink">{t.label}</span>
                  {tipos.includes(t.id) && <span className="badge badge-accent !text-[9px]">Seleccionado</span>}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPaso(3)}
              disabled={tipos.length === 0}
              className="btn btn-primary w-full mt-4 h-11 text-sm disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* PASO 2b — presupuesto (cuando NO es maquillaje) */}
        {paso === 2 && !esMaquillaje && (
          <PasoPresupuesto
            rangoPresupuesto={RANGOS_PRECIO}
            presupuesto={presupuesto}
            setPresupuesto={setPresupuesto}
            onContinuar={() => setPaso(3)}
            onVolver={() => setPaso(1)}
          />
        )}

        {/* PASO 3 — color de piel / (y para no-maquillaje, sugerencias) */}
        {paso === 3 && esMaquillaje && (
          <div>
            <BotonVolver onClick={() => setPaso(2)}>Volver</BotonVolver>
            {tituloPaso('¿Cuál es tu color de piel?', 'Así elegimos tonalidades que te favorezcan')}
            <div className="grid gap-2">
              {TONOS_PIEL.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setPiel(t.id); setPaso(4) }}
                  className={`card rounded-xl px-4 py-3 flex items-center gap-3 text-left transition border ${
                    piel === t.id ? 'border-accent bg-accent-light/40' : 'hover:border-accent'
                  }`}
                >
                  <span className="w-9 h-9 rounded-full ring-2 ring-line shrink-0" style={{ background: `linear-gradient(135deg, ${t.swatch}, #99663F)` }} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-ink">{t.label}</span>
                    <span className="block text-xs text-ink-3 mt-0.5">{t.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3b — sugerencias (no maquillaje) */}
        {paso === 3 && !esMaquillaje && (
          <PasoSugerencias coincidencias={coincidencias} opcionesCategoria={opcionesCategoria} categoria={categoria} onVer={onVer} onAgregar={onAgregar} onComprar={onComprar} cerrar={cerrar} reiniciar={reiniciar} escribirWhatsApp={escribirWhatsApp} />
        )}

        {/* PASO 4 — colores favoritos */}
        {paso === 4 && esMaquillaje && (
          <div>
            <BotonVolver onClick={() => setPaso(3)}>Volver</BotonVolver>
            {tituloPaso('¿Tienes colores favoritos?', 'Toca todos los que quieras (o ninguno si dudas)')}
            <div className="flex flex-wrap gap-2">
              {COLORES_FAVORITOS.map((c) => (
                <Chip key={c} activo={colores.includes(c)} onClick={() => setColores((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))}>
                  {c}
                </Chip>
              ))}
            </div>
            <button type="button" onClick={() => setPaso(5)} className="btn btn-primary w-full mt-4 h-11 text-sm">
              Siguiente →
            </button>
          </div>
        )}

        {/* PASO 5 — algo que llame la atención */}
        {paso === 5 && esMaquillaje && (
          <div>
            <BotonVolver onClick={() => setPaso(4)}>Volver</BotonVolver>
            {tituloPaso('¿Hay algo que te llame la atención?', 'Escríbelo o toca una idea; lo tendremos en cuenta')}
            <div className="flex flex-wrap gap-2 mb-3">
              {IDEAS_ATENCION.map((i) => (
                <Chip key={i} activo={atencion.includes(i)} onClick={() => setAtencion((prev) => (prev.includes(i) ? prev.replace(i, '').trim() : [prev.trim(), i].filter(Boolean).join(', ')))}>
                  {i}
                </Chip>
              ))}
            </div>
            <input
              value={atencion}
              onChange={(e) => setAtencion(e.target.value)}
              placeholder="Ej: me gustan las sombras brillantes…"
              className="input text-sm"
            />
            <button type="button" onClick={() => setPaso(6)} className="btn btn-primary w-full mt-4 h-11 text-sm">
              Siguiente →
            </button>
          </div>
        )}

        {/* PASO 6 — presupuesto (maquillaje) */}
        {paso === 6 && esMaquillaje && (
          <PasoPresupuesto
            rangoPresupuesto={RANGOS_PRECIO}
            presupuesto={presupuesto}
            setPresupuesto={setPresupuesto}
            onContinuar={() => setPaso(7)}
            onVolver={() => setPaso(5)}
          />
        )}

        {/* PASO 7 — sugerencias (maquillaje) */}
        {paso === 7 && esMaquillaje && (
          <PasoSugerencias coincidencias={coincidencias} opcionesCategoria={opcionesCategoria} categoria={categoria} onVer={onVer} onAgregar={onAgregar} onComprar={onComprar} cerrar={cerrar} reiniciar={reiniciar} escribirWhatsApp={escribirWhatsApp} />
        )}
      </div>
    </div>
  )
}

function PasoPresupuesto({ rangoPresupuesto, presupuesto, setPresupuesto, onContinuar, onVolver }) {
  return (
    <div>
      <button type="button" onClick={onVolver} className="text-xs text-ink-3 hover:text-ink transition mb-3 flex items-center gap-1">
        <ArrowLeft size={13} /> Volver
      </button>
      <p className="text-sm font-semibold text-ink mb-3">¿Cuánto quieres gastar?</p>
      <div className="grid gap-2">
        {rangoPresupuesto.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => { setPresupuesto(r.id); onContinuar() }}
            className={`card rounded-xl px-4 py-3 text-sm font-medium text-left transition cursor-pointer border ${
              presupuesto === r.id ? 'border-accent text-accent bg-accent-light/40' : 'text-ink-2 hover:border-accent hover:text-accent'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function PasoSugerencias({ coincidencias, opcionesCategoria, categoria, onVer, onAgregar, onComprar, cerrar, reiniciar, escribirWhatsApp }) {
  return (
    <div>
      <button type="button" onClick={reiniciar} className="text-xs text-ink-3 hover:text-ink transition mb-3 flex items-center gap-1">
        <ArrowLeft size={13} /> Empezar de nuevo
      </button>
      <p className="text-sm font-semibold text-ink mb-3">
        {coincidencias.length > 0
          ? `Para ti, de ${opcionesCategoria.find((c) => c.id === categoria)?.label || 'la tienda'}:`
          : 'Ups, no encontramos nada con ese presupuesto 😅'}
      </p>

      {coincidencias.length > 0 ? (
        <div className="grid gap-3">
          {coincidencias.map((p, i) => (
            <div key={p.id} className="card rounded-xl overflow-hidden flex gap-3">
              <button type="button" onClick={() => { onVer(p); cerrar() }} className="w-24 h-24 shrink-0 cursor-pointer bg-bg-soft">
                <VisualMini p={p} />
              </button>
              <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    {i === 0 && <span className="badge badge-gold inline-flex !text-[9px] px-1.5 py-0.5">Te sugerimos</span>}
                    {p.badge && <span className="badge badge-rose inline-flex !text-[9px] px-1.5 py-0.5">{p.badge}</span>}
                  </div>
                  <p className="text-sm font-semibold text-ink truncate mt-1 cursor-pointer hover:text-accent transition" onClick={() => { onVer(p); cerrar() }}>
                    {p.nombre}
                  </p>
                  <p className="text-gold font-bold text-sm mt-0.5">{formatPrecio(p.precio)}</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => { onAgregar(p); cerrar() }}
                    disabled={p.stock <= 0}
                    className="flex-1 h-8 rounded-lg border border-line text-ink-2 text-[11px] font-semibold flex items-center justify-center gap-1 hover:border-accent hover:text-accent transition disabled:opacity-30"
                  >
                    <ShoppingBag size={12} /> Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => { onComprar(p); cerrar() }}
                    disabled={p.stock <= 0}
                    className="flex-1 h-8 rounded-lg bg-[#25D366] text-white text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-[#1DAB54] transition disabled:opacity-30"
                  >
                    <IconoWhatsApp className="w-3 h-3" /> Comprar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 card rounded-xl">
          <Star size={26} className="mx-auto text-ink-3 mb-2" />
          <p className="text-sm text-ink-2 mb-4">Prueba otro presupuesto o escríbenos y te asesoramos.</p>
          <button type="button" onClick={escribirWhatsApp} className="btn btn-sm bg-[#25D366] text-white border-0 hover:bg-[#1DAB54] shadow-lg shadow-[#25D366]/25">
            <IconoWhatsApp className="w-3.5 h-3.5" /> Preguntar por WhatsApp
          </button>
        </div>
      )}

      <div className="flex justify-center mt-5">
        <button type="button" onClick={reiniciar} className="text-xs font-medium text-ink-3 hover:text-accent transition flex items-center gap-1">
          <Dices size={13} /> Empezar de nuevo
        </button>
      </div>
    </div>
  )
}

// Recomienda productos puntuando con: qué deseas + color de piel + colores
// favoritos + "algo que te llame la atención". Ej.: labial rojo para piel media.
function sugerir(productos, { categoria, tipos, colores, atencion, rango }) {
  const listaBase = (productos || []).filter((p) => {
    if (categoria && p.categoria !== categoria) return false
    if (!rango || rango.id === 'any') return true
    if (rango.min !== undefined && p.precio < rango.min) return false
    if (rango.max !== undefined && p.precio > rango.max) return false
    return true
  })

  // Palabras clave: tipos de maquillaje + colores favoritos + lo que escribió
  const palabrasClave = [
    ...(tipos || []).flatMap((id) => TIPOS_MAQUILLAJE.find((t) => t.id === id)?.palabras || []),
    ...(colores || []),
    ...String(atencion || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean),
  ].map(limpiar).filter(Boolean)

  const con = listaBase.map((p) => {
    const texto = limpiar(`${p.nombre} ${p.desc || ''}`)
    let puntos = 0
    for (const w of palabrasClave) if (texto.includes(w)) puntos++
    return { p, puntos }
  })

  const mejor = con.filter((c) => c.puntos > 0).sort((a, b) => b.puntos - a.puntos || Math.random() - 0.5)
  const resto = barajar(con.filter((c) => c.puntos === 0))
  return [...mejor, ...resto].slice(0, 3).map((c) => c.p)
}