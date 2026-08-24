import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import LogoNathalia from '../components/LogoNathalia'
import { cargarContenido, guardarContenido, esAdmin } from '../utils/contenido'

/* ─────────────────────────────────────────────────────────────
   CATÁLOGO NATHALIA — Tienda de moda, ropa y maquillaje.
   - Colecciones: Maquillaje · Ropa · Accesorios · Favoritos
   - Productos locales editables desde el panel (modo edición)
   - El administrador ve la misma página del usuario pero con
     controles para editar textos, productos y subir imágenes.
   ───────────────────────────────────────────────────────────── */

const BG = '#1A0E13'
const BG_SOLIDO = '#241219'
const BG_SOLIDO_2 = '#2A1521'
const ROSA = '#C77A9C'
const ROSA_HOVER = '#A65E80'
const ROSA_CLARO = '#EBC6D6'
const DORADO = '#D4AF37'
const DORADO_CLARO = '#E9CD8A'

const formatPrecio = (n) => '$' + Number(n || 0).toLocaleString('es-CO')

const badgeColor = {
  'Top ventas': `bg-[#C77A9C] text-white`,
  'Nuevo': `bg-[#C77A9C]/15 text-[#EBC6D6] ring-1 ring-inset ring-[#C77A9C]/30`,
  'Oferta': `bg-[#D4AF37]/15 text-[#E9CD8A] ring-1 ring-inset ring-[#D4AF37]/30`,
}

function estadoStock(stock) {
  if (stock <= 0) return { label: 'Agotado', color: '#F2A0B5' }
  if (stock < 10) return { label: 'Quedan pocos', color: DORADO_CLARO }
  return { label: 'Disponible', color: ROSA_CLARO }
}

function IconoCarrito({ className = '', width = 16, height = 16 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="21" r="1.6" fill="currentColor" />
      <circle cx="19" cy="21" r="1.6" fill="currentColor" />
      <path d="M2 3h3l2.4 12.2a1.5 1.5 0 001.5 1.3h8.9a1.5 1.5 0 001.5-1.2L21 8H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconoCorazon({ lleno = false, className = '', width = 16, height = 16 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={lleno ? 'currentColor' : 'none'} className={className}>
      <path d="M12 21s-7.5-4.6-10-9.1C0.3 8.7 1.7 5 5.2 4.2c2-.4 4 .5 5 2.2 1-1.7 3-2.6 5-2.2 3.5.8 4.9 4.5 3.2 7.7C19.5 16.4 12 21 12 21z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function VisualProducto({ p, className = '' }) {
  if (p.imagen) {
    return <img src={p.imagen} alt={p.nombre} className={`${className} object-cover`} />
  }
  return (
    <div className={`${className} flex items-center justify-center bg-[#2A1521]`}>
      <span className="text-5xl sm:text-6xl" style={{ textShadow: '0 8px 24px rgba(0,0,0,0.45)' }}>{p.emoji || '✨'}</span>
    </div>
  )
}

/* ── TARJETA DE PRODUCTO ───────────────────────────────────── */
function TarjetaProducto({ p, onVer, onAgregar, esFavorito, onFavorito, modoEdicion, onEditar }) {
  const stock = estadoStock(p.stock)
  return (
    <div
      className="relative rounded-2xl overflow-hidden flex flex-col bg-[#241219] border border-white/[0.08] hover:-translate-y-1 hover:border-white/20 transition-all duration-300 cursor-pointer group"
      onClick={() => onVer(p)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onVer(p) }}
    >
      {/* Imagen / emoji */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <VisualProducto p={p} className="w-full h-full" />
        {p.badge && (
          <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full ${badgeColor[p.badge] || badgeColor.Nuevo}`}>
            {p.badge}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFavorito(p) }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition ${esFavorito ? 'text-[#D4AF37]' : 'text-white/70 bg-black/35 hover:text-white'}`}
          aria-label="Favorito"
        >
          <IconoCorazon lleno={esFavorito} width={18} height={18} />
        </button>
        {modoEdicion && (
          <div className="absolute inset-x-0 bottom-0 p-2 flex gap-2 bg-black/45">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEditar(p) }}
              className="flex-1 h-8 rounded-lg bg-[#C77A9C] text-white text-[11px] font-semibold hover:bg-[#A65E80] transition"
            >
              ✏️ Editar
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1">
        <p className="text-[#EBC6D6] text-[11px] uppercase tracking-wide">{p.categoria}</p>
        <p className="text-sm font-medium text-white mt-0.5 leading-snug line-clamp-1">{p.nombre}</p>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-[#E9CD8A] font-semibold">{formatPrecio(p.precio)}</span>
          {p.antes > p.precio && (
            <span className="text-white/35 line-through text-xs">{formatPrecio(p.antes)}</span>
          )}
        </div>
        <p className="text-[11px] mt-1" style={{ color: stock.color }}>{stock.label}</p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAgregar(p) }}
          disabled={p.stock <= 0}
          className="mt-3 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 text-white transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: ROSA }}
          onMouseEnter={(e) => { e.currentTarget.style.background = ROSA_HOVER }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ROSA }}
        >
          <IconoCarrito width={14} height={14} /> Agregar
        </button>
      </div>
    </div>
  )
}

/* ── DETALLE DE PRODUCTO ───────────────────────────────────── */
function DetalleProducto({ p, onClose, onAgregar, esFavorito, onFavorito }) {
  const [cant, setCant] = useState(1)
  const stock = estadoStock(p.stock)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 anim-overlay" onClick={onClose}>
      <div
        className="rounded-2xl w-full max-w-3xl flex flex-col sm:flex-row overflow-hidden max-h-[90vh] anim-pop"
        style={{ background: BG_SOLIDO, border: '1px solid rgba(255,255,255,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:w-1/2 h-56 sm:h-auto bg-[#2A1521] relative">
          <VisualProducto p={p} className="w-full h-full" />
          <button type="button" onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white/80 hover:text-white">✕</button>
          <button
            type="button"
            onClick={() => onFavorito(p)}
            className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center ${esFavorito ? 'text-[#D4AF37] bg-black/40' : 'text-white/80 bg-black/40 hover:text-white'}`}
            aria-label="Favorito"
          >
            <IconoCorazon lleno={esFavorito} width={20} height={20} />
          </button>
        </div>
        <div className="flex-1 p-6 sm:p-7 overflow-y-auto">
          <span className="text-[#EBC6D6] text-xs uppercase tracking-wide">{p.categoria}</span>
          <h2 className="text-2xl font-semibold text-white mt-1">{p.nombre}</h2>
          {p.badge && <span className={`inline-block mt-2 text-[10px] font-semibold px-2.5 py-1 rounded-full ${badgeColor[p.badge] || badgeColor.Nuevo}`}>{p.badge}</span>}
          <p className="text-white/60 text-sm mt-3 leading-relaxed">{p.desc || 'Sin descripción.'}</p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-[#E9CD8A] text-2xl font-semibold">{formatPrecio(p.precio)}</span>
            {p.antes > p.precio && <span className="text-white/35 line-through text-sm">{formatPrecio(p.antes)}</span>}
          </div>
          <p className="text-xs mt-1" style={{ color: stock.color }}>{stock.label}</p>

          <div className="flex items-center gap-3 mt-5">
            <span className="text-sm text-white/60">Cantidad</span>
            <div className="flex items-center bg-[#2A1521] border border-white/10 rounded-xl">
              <button type="button" onClick={() => setCant((c) => Math.max(1, c - 1))} className="w-9 h-9 text-white/70 text-lg hover:text-white">−</button>
              <span className="w-8 text-center text-white font-medium">{cant}</span>
              <button type="button" onClick={() => setCant((c) => Math.min(p.stock, c + 1))} disabled={cant >= p.stock} className="w-9 h-9 text-white/70 text-lg hover:text-white disabled:opacity-30">+</button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { onAgregar(p, cant); onClose() }}
            disabled={p.stock <= 0}
            className="w-full mt-6 h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-40"
            style={{ background: ROSA }}
            onMouseEnter={(e) => { e.currentTarget.style.background = ROSA_HOVER }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ROSA }}
          >
            <IconoCarrito /> Agregar al carrito · {formatPrecio(p.precio * cant)}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── CARRITO (drawer) ──────────────────────────────────────── */
function CarritoDrawer({ carrito, onClose, onSumar, onRestar, onQuitar, total }) {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 anim-overlay" onClick={onClose}>
      <div
        className="w-full max-w-sm h-full flex flex-col shadow-2xl anim-sheet-right"
        style={{ background: BG_SOLIDO }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-medium">Tu carrito ({carrito.length})</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.06] text-white/60 hover:text-white">✕</button>
        </div>
        {carrito.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <span className="text-4xl">🛍️</span>
            <p className="text-white/50 text-sm">Tu carrito está vacío.</p>
            <button type="button" onClick={onClose} className="mt-2 text-sm text-[#EBC6D6] hover:text-white">Explorar el catálogo →</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {carrito.map((item) => (
                <div key={item.id} className="rounded-xl p-3 flex gap-3 items-center bg-[#2A1521] border border-white/[0.08]">
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    <VisualProducto p={item} className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.nombre}</p>
                    <p className="text-xs text-[#E9CD8A]">{formatPrecio(item.precio)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button type="button" onClick={() => onRestar(item.id)} className="w-6 h-6 rounded-md bg-white/[0.06] text-white/70 text-sm">−</button>
                      <span className="text-white/80 text-xs">{item.cant}</span>
                      <button type="button" onClick={() => onSumar(item.id)} className="w-6 h-6 rounded-md bg-white/[0.06] text-white/70 text-sm">+</button>
                      <button type="button" onClick={() => onQuitar(item.id)} className="ml-auto text-[#F2A0B5] text-xs hover:underline">Quitar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-white/10">
              <div className="flex justify-between text-white mb-3"><span>Total</span><span className="font-semibold text-[#E9CD8A]">{formatPrecio(total)}</span></div>
              <button
                type="button"
                onClick={() => { onClose(); navigate('/cliente/configurar-pedido') }}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold transition active:scale-95"
                style={{ background: ROSA }}
              >
                Ir a pagar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── MODAL EDITAR / NUEVO PRODUCTO (solo admin) ────────────── */
function EditProductoModal({ producto, onClose, onGuardar }) {
  const [form, setForm] = useState(producto || { id: Date.now(), nombre: '', categoria: 'maquillaje', precio: 0, antes: 0, emoji: '✨', imagen: '', desc: '', stock: 10, badge: '' })

  function subirImagen(e) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) return toast.error('Solo imágenes')
    if (archivo.size > 2 * 1024 * 1024) return toast.error('Máx 2 MB')
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, imagen: reader.result, emoji: '' }))
    reader.readAsDataURL(archivo)
  }

  const Campo = ({ label, valor, cambio, type = 'text', numero = false }) => (
    <div>
      <label className="block text-xs text-white/55 mb-1">{label}</label>
      <input
        type={type}
        value={valor}
        onChange={(e) => cambio(numero ? Number(e.target.value) : e.target.value)}
        className="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)' }}
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 anim-overlay" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-6 anim-pop max-h-[90vh] overflow-y-auto"
        style={{ background: BG_SOLIDO, border: '1px solid rgba(255,255,255,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{producto ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button type="button" onClick={onClose} className="text-white/50 hover:text-white">✕</button>
        </div>

        <div className="mb-4">
          <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-[#2A1521] flex items-center justify-center">
            {form.imagen ? <img src={form.imagen} alt="" className="w-full h-full object-cover" /> : <span className="text-4xl">{form.emoji || '✨'}</span>}
          </div>
          <label className="mt-2 block text-center cursor-pointer text-xs text-[#EBC6D6] hover:underline">
            📱 Subir imagen desde el teléfono
            <input type="file" accept="image/*" onChange={subirImagen} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="col-span-2"><Campo label="Nombre" valor={form.nombre} cambio={(v) => setForm({ ...form, nombre: v })} /></div>
          <Campo label="Categoría" valor={form.categoria} cambio={(v) => setForm({ ...form, categoria: v })} />
          <Campo label="Emoji (si no hay imagen)" valor={form.emoji} cambio={(v) => setForm({ ...form, emoji: v })} />
          <Campo label="Precio" valor={form.precio} cambio={(v) => setForm({ ...form, precio: v })} numero />
          <Campo label="Antes (0 = sin oferta)" valor={form.antes} cambio={(v) => setForm({ ...form, antes: v })} numero />
          <Campo label="Stock" valor={form.stock} cambio={(v) => setForm({ ...form, stock: v })} numero />
          <Campo label="Insignia (Nuevo/Oferta/Top ventas)" valor={form.badge} cambio={(v) => setForm({ ...form, badge: v })} />
        </div>
        <div className="mb-4">
          <label className="block text-xs text-white/55 mb-1">Descripción</label>
          <textarea
            rows={2}
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            className="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none resize-y"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)' }}
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-white/70 border border-white/15 hover:bg-white/10">Cancelar</button>
          <button type="button" onClick={() => onGuardar(form)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: ROSA }}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

/* ── CATÁLOGO PRINCIPAL ────────────────────────────────────── */
function CatalogoInterno() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [contenido, setContenido] = useState(() => cargarContenido())
  const admin = useMemo(() => esAdmin(), [])

  const [seccion, setSeccion] = useState(() => {
    const s = searchParams.get('seccion')
    return ['maquillaje', 'ropa', 'accesorios', 'favoritos'].includes(s) ? s : 'maquillaje'
  })
  const [busqueda, setBusqueda] = useState('')
  const [filtroDisp, setFiltroDisp] = useState('todos')
  const [orden, setOrden] = useState('destacados')

  const [carrito, setCarrito] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nathalia_carrito')) || [] } catch { return [] }
  })
  const [carritoOpen, setCarritoOpen] = useState(false)
  const [detalle, setDetalle] = useState(null)

  const [favoritos, setFavoritos] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('nathalia_favoritos')) || []) } catch { return new Set() }
  })
  const [vistos, setVistos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nathalia_vistos')) || [] } catch { return [] }
  })

  // Modo edición admin
  const [modoEdicion, setModoEdicion] = useState(false)
  const [editando, setEditando] = useState(null)
  const inputBannerRef = useRef(null)

  const productos = contenido.productos || []
  const colecciones = contenido.colecciones || []

  useEffect(() => { localStorage.setItem('nathalia_carrito', JSON.stringify(carrito)) }, [carrito])
  useEffect(() => { localStorage.setItem('nathalia_favoritos', JSON.stringify([...favoritos])) }, [favoritos])
  useEffect(() => { localStorage.setItem('nathalia_vistos', JSON.stringify(vistos)) }, [vistos])

  function cambiarSeccion(id) {
    setSeccion(id)
    setSearchParams(id === 'maquillaje' ? {} : { seccion: id }, { replace: true })
  }

  function guardarCambios(nuevoContenido) {
    guardarContenido(nuevoContenido)
    setContenido(nuevoContenido)
  }

  function verDetalle(p) {
    setDetalle(p)
    setVistos((prev) => [p, ...prev.filter((x) => x.id !== p.id)].slice(0, 8))
  }

  function agregar(p, cant = 1) {
    setCarrito((prev) => {
      const existe = prev.find((c) => c.id === p.id)
      if (existe) return prev.map((c) => (c.id === p.id ? { ...c, cant: c.cant + cant } : c))
      return [...prev, { ...p, cant }]
    })
    toast.success(`${p.nombre} agregado 🛍️`)
  }

  function sumar(id) { setCarrito((prev) => prev.map((c) => (c.id === id ? { ...c, cant: c.cant + 1 } : c))) }
  function restar(id) { setCarrito((prev) => prev.map((c) => (c.id === id ? { ...c, cant: Math.max(1, c.cant - 1) } : c))) }
  function quitar(id) { setCarrito((prev) => prev.filter((c) => c.id !== id)) }

  function toggleFavorito(p) {
    setFavoritos((prev) => {
      const n = new Set(prev)
      if (n.has(p.id)) n.delete(p.id); else n.add(p.id)
      return n
    })
  }

  // Filtros y orden
  const filtrados = useMemo(() => {
    let lista = productos.filter((p) => {
      const matchSeccion = seccion === 'favoritos' ? favoritos.has(p.id) : p.categoria === seccion
      const matchBus = !busqueda.trim() || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      const matchDisp = filtroDisp === 'todos' || (filtroDisp === 'stock' ? p.stock > 0 : true)
      return matchSeccion && matchBus && matchDisp
    })
    if (orden === 'precioAsc') lista = [...lista].sort((a, b) => a.precio - b.precio)
    if (orden === 'precioDesc') lista = [...lista].sort((a, b) => b.precio - a.precio)
    if (orden === 'ofertas') lista = [...lista].filter((p) => p.antes > p.precio)
    return lista
  }, [productos, seccion, busqueda, filtroDisp, orden, favoritos])

  const totalCarrito = carrito.reduce((s, c) => s + c.precio * c.cant, 0)

  // Producto del día (determinístico por fecha)
  const productoDelDia = useMemo(() => {
    if (!productos.length) return null
    const hoy = new Date()
    const semilla = hoy.getFullYear() * 372 + (hoy.getMonth() + 1) * 31 + hoy.getDate()
    return productos[semilla % productos.length]
  }, [productos])

  const seccionActual = colecciones.find((c) => c.id === seccion) || { label: 'Favoritos', emoji: '♥' }

  // Admin: guardar producto nuevo/editado
  function guardarProducto(form) {
    const nuevoContenido = { ...contenido }
    const existe = nuevoContenido.productos.some((p) => p.id === form.id)
    nuevoContenido.productos = existe
      ? nuevoContenido.productos.map((p) => (p.id === form.id ? form : p))
      : [...nuevoContenido.productos, form]
    guardarCambios(nuevoContenido)
    setEditando(null)
    toast.success('Producto guardado')
  }

  function eliminarProducto(p) {
    if (!window.confirm(`¿Eliminar "${p.nombre}"?`)) return
    const nuevoContenido = { ...contenido, productos: contenido.productos.filter((x) => x.id !== p.id) }
    guardarCambios(nuevoContenido)
    toast.success('Producto eliminado')
  }

  function subirBanner(e) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) return toast.error('Solo imágenes')
    if (archivo.size > 2 * 1024 * 1024) return toast.error('Máx 2 MB')
    const reader = new FileReader()
    reader.onload = () => guardarCambios({ ...contenido, catalogoBanner: reader.result })
    reader.readAsDataURL(archivo)
  }

  return (
    <div className="text-white min-h-screen" style={{ background: BG }}>

      {/* TOOLBAR SUPERIOR */}
      <header className="sticky top-0 z-40 border-b border-white/10" style={{ background: 'rgba(26,14,19,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2 shrink-0">
            <LogoNathalia size={32} showText={false} />
            <span className="font-display text-[#F9E7EE] text-base font-semibold tracking-tight hidden sm:block">Nathalia</span>
          </button>

          {/* Pestañas colecciones */}
          <nav className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 justify-center">
            {colecciones.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => cambiarSeccion(c.id)}
                className={`px-3.5 h-9 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${seccion === c.id ? 'text-white' : 'text-white/50 hover:text-white'}`}
                style={seccion === c.id ? { background: ROSA } : {}}
              >
                {c.emoji} {c.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => cambiarSeccion('favoritos')}
              className={`px-3.5 h-9 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${seccion === 'favoritos' ? 'text-white' : 'text-white/50 hover:text-white'}`}
              style={seccion === 'favoritos' ? { background: ROSA } : {}}
            >
              ♥ Favoritos
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setCarritoOpen(true)}
            className="relative h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-white transition"
            style={{ background: ROSA }}
            aria-label="Carrito"
          >
            <IconoCarrito width={18} height={18} />
            {carrito.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#D4AF37] text-[#1A0E13] text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1A0E13]">
                {carrito.reduce((s, c) => s + c.cant, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* HERO / TITULAR */}
      <div className="px-4 sm:px-6 pt-10 pb-8" style={{ background: BG_SOLIDO_2 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-medium text-[#E9CD8A] uppercase tracking-widest">Tienda · Moda y Belleza</span>
              <h1 className="text-3xl sm:text-5xl font-semibold text-white leading-tight mt-2 tracking-tight">
                {seccion === 'favoritos' ? 'Tus favoritos' : `${seccionActual.emoji} ${seccionActual.label}`}
              </h1>
              <p className="text-white/50 text-sm mt-3 max-w-md">
                {seccion === 'favoritos'
                  ? 'Los productos que guardaste con ♥ para encontrarlos más rápido.'
                  : contenido.catalogoSubtitulo}
              </p>
            </div>
            <div className="flex gap-6 sm:gap-8 shrink-0">
              <div>
                <p className="text-xl sm:text-2xl font-semibold text-white">{productos.length}</p>
                <p className="text-[11px] text-white/40 mt-0.5">Productos</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-semibold text-white">{colecciones.length}</p>
                <p className="text-[11px] text-white/40 mt-0.5">Colecciones</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-semibold text-[#E9CD8A]">24h</p>
                <p className="text-[11px] text-white/40 mt-0.5">Entrega</p>
              </div>
            </div>
          </div>
          {modoEdicion && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <label className="cursor-pointer text-sm px-4 py-2 rounded-xl transition bg-white/10 border border-white/20 text-white/80 hover:bg-white/15">
                📱 Subir imagen de portada
                <input ref={inputBannerRef} type="file" accept="image/*" onChange={subirBanner} className="hidden" />
              </label>
              <button type="button" onClick={() => setEditando({ id: Date.now(), nombre: '', categoria: seccion === 'favoritos' ? 'maquillaje' : seccion, precio: 0, antes: 0, emoji: '✨', imagen: '', desc: '', stock: 10, badge: '' })} className="text-sm px-4 py-2 rounded-xl transition" style={{ background: ROSA }}>+ Agregar producto</button>
            </div>
          )}
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="sticky top-16 z-30 px-4 sm:px-6 py-3 border-b border-white/10" style={{ background: BG }}>
        <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 flex-1 min-w-[180px]" style={{ background: BG_SOLIDO, border: '1px solid rgba(255,255,255,0.08)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-white/35"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar en la colección..."
              className="flex-1 min-w-0 text-sm outline-none bg-transparent text-white placeholder-white/35"
            />
          </div>

          <select
            value={filtroDisp}
            onChange={(e) => setFiltroDisp(e.target.value)}
            className="h-10 px-3 rounded-xl text-sm text-white/70 outline-none"
            style={{ background: BG_SOLIDO, border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <option value="todos">Todos</option>
            <option value="stock">En stock</option>
          </select>

          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="h-10 px-3 rounded-xl text-sm text-white/70 outline-none"
            style={{ background: BG_SOLIDO, border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <option value="destacados">Destacados</option>
            <option value="precioAsc">Precio: menor a mayor</option>
            <option value="precioDesc">Precio: mayor a menor</option>
            <option value="ofertas">Solo ofertas</option>
          </select>
        </div>
      </div>

      {/* CONTENIDO */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">

        {/* Producto del día */}
        {productoDelDia && seccion !== 'favoritos' && (
          <div className="rounded-2xl overflow-hidden flex flex-col sm:flex-row" style={{ background: BG_SOLIDO, border: '1px solid rgba(199,122,156,0.35)' }}>
            <div className="sm:w-48 h-40 sm:h-auto cursor-pointer shrink-0" onClick={() => verDetalle(productoDelDia)}>
              <VisualProducto p={productoDelDia} className="w-full h-full" />
            </div>
            <div className="flex-1 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: ROSA }}>✨ Producto del día · 20% OFF</span>
                <p className="text-white font-semibold mt-2 cursor-pointer hover:text-[#EBC6D6] transition" onClick={() => verDetalle(productoDelDia)}>{productoDelDia.nombre}</p>
                <p className="text-sm text-white/50 mt-1">{formatPrecio(Math.round(productoDelDia.precio * 0.8))} <span className="line-through text-white/30">{formatPrecio(productoDelDia.precio)}</span></p>
              </div>
              <button type="button" onClick={() => agregar({ ...productoDelDia, precio: Math.round(productoDelDia.precio * 0.8) }, 1)} className="h-11 px-6 rounded-xl text-white text-sm font-semibold transition shrink-0" style={{ background: ROSA }}>Agregar</button>
            </div>
          </div>
        )}

        {/* GRID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              {seccion === 'favoritos' ? 'Tus favoritos' : `Colección ${seccionActual.label}`}
            </h2>
            <p className="text-sm text-white/40">{filtrados.length} {filtrados.length === 1 ? 'producto' : 'productos'}</p>
          </div>

          {filtrados.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: BG_SOLIDO, border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="text-4xl block mb-2">{seccion === 'favoritos' ? '💗' : '🔍'}</span>
              <p className="text-white/50 text-sm">{seccion === 'favoritos' ? 'Aún no tienes favoritos. Toca el corazón de un producto.' : 'No se encontraron productos.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filtrados.map((p) => (
                <TarjetaProducto
                  key={p.id}
                  p={p}
                  onVer={verDetalle}
                  onAgregar={agregar}
                  esFavorito={favoritos.has(p.id)}
                  onFavorito={toggleFavorito}
                  modoEdicion={modoEdicion}
                  onEditar={(prod) => setEditando(prod)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Vistos recientemente */}
        {vistos.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Vistos recientemente</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {vistos.map((p) => (
                <div key={p.id} className="shrink-0 w-32 rounded-xl overflow-hidden cursor-pointer" style={{ background: BG_SOLIDO, border: '1px solid rgba(255,255,255,0.08)' }} onClick={() => verDetalle(p)}>
                  <div className="h-24"><VisualProducto p={p} className="w-full h-full" /></div>
                  <div className="p-2">
                    <p className="text-[11px] text-white truncate">{p.nombre}</p>
                    <p className="text-xs font-semibold text-[#E9CD8A]">{formatPrecio(p.precio)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* BOTÓN MODO EDICIÓN (solo admin) */}
      {admin && (
        <button
          type="button"
          onClick={() => setModoEdicion((v) => !v)}
          className="fixed bottom-5 right-5 z-40 h-12 rounded-full px-5 text-sm font-semibold text-white shadow-lg transition active:scale-95 flex items-center gap-2"
          style={{ background: modoEdicion ? DORADO : ROSA }}
        >
          {modoEdicion ? '✓ Modo edición activo' : '✏️ Modo edición'}
        </button>
      )}

      {/* MODALES */}
      {detalle && (
        <DetalleProducto
          p={detalle}
          onClose={() => setDetalle(null)}
          onAgregar={agregar}
          esFavorito={favoritos.has(detalle.id)}
          onFavorito={toggleFavorito}
        />
      )}
      {carritoOpen && (
        <CarritoDrawer
          carrito={carrito}
          onClose={() => setCarritoOpen(false)}
          onSumar={sumar}
          onRestar={restar}
          onQuitar={quitar}
          total={totalCarrito}
        />
      )}
      {modoEdicion && editando && (
        <EditProductoModal
          producto={productos.find((p) => p.id === editando.id) || null}
          onClose={() => setEditando(null)}
          onGuardar={guardarProducto}
        />
      )}
      {modoEdicion && (
        <div className="fixed bottom-24 right-5 z-40 text-xs text-white/70" style={{ background: 'rgba(42,21,33,0.95)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: 12, padding: '8px 12px' }}>
          Toque un producto para editarlo · 📱 suba imágenes
        </div>
      )}
    </div>
  )
}

export default function Catalogo() {
  return <CatalogoInterno />
}
