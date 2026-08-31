import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ShoppingBag, Heart, Search, Plus, X, Pencil, Star, Dices, ChevronLeft, ChevronRight } from 'lucide-react'
import IconoWhatsApp from '../components/IconoWhatsApp'
import PanelRecomendados from '../components/PanelRecomendados'
import { cargarContenido, guardarContenido, suscribirseContenido, esAdmin, actualizarCampo, FORMAS_CATALOGO } from '../utils/contenido'
import EditableTexto from '../components/EditableTexto'
import EditorInSitu from '../components/EditorInSitu'
import AyudaElegir from '../components/AyudaElegir'
import { construirMensajeProducto, construirMensajePedido, abrirWhatsApp } from '../utils/whatsapp'
import { registrarPedidoWhatsApp } from '../utils/pedidos'

/* ─────────────────────────────────────────────────────────────
   CATÁLOGO NATHALIA — Tienda de moda, ropa y maquillaje.
   - Colecciones: Maquillaje · Ropa · Accesorios · Favoritos
   - Productos locales editables desde el panel (modo edición)
   - El administrador ve la misma página del usuario pero con
     controles para editar textos, productos y subir imágenes.
   ───────────────────────────────────────────────────────────── */

const formatPrecio = (n) => '$' + Number(n || 0).toLocaleString('es-CO')

function estadoStock(stock) {
  if (stock <= 0) return { label: 'Agotado', color: 'var(--na-error)' }
  if (stock < 10) return { label: 'Quedan pocos', color: 'var(--na-gold)' }
  return { label: 'Disponible', color: 'var(--na-success)' }
}

function VisualProducto({ p, className = '' }) {
  if (p.imagen) {
    return <img src={p.imagen} alt={p.nombre} className={`${className} object-cover`} />
  }
  return (
    <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blush to-accent-light/70`}>
      <span className="text-5xl sm:text-6xl drop-shadow-lg">{p.emoji || '✨'}</span>
    </div>
  )
}

/* ── TARJETAS DE PRODUCTO (5 formas) ───────────────────────── */
function BadgeProducto({ p, pos = 'top-3 left-3' }) {
  if (!p.badge) return null
  return <span className={`badge ${p.badge === 'Oferta' ? 'badge-gold' : 'badge-rose'} absolute ${pos}`}>{p.badge}</span>
}

function BotonFavorito({ esFavorito, onClick }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition shadow ${esFavorito ? 'text-gold bg-card' : 'text-ink-2 bg-card/80'}`}
      aria-label="Favorito"
    >
      <Heart size={16} fill={esFavorito ? 'currentColor' : 'none'} />
    </button>
  )
}

function CapaEdicion({ modoEdicion, onEditar }) {
  if (!modoEdicion) return null
  return (
    <div className="absolute inset-x-0 bottom-0 p-2 flex gap-2 bg-overlay backdrop-blur-sm">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onEditar() }}
        className="flex-1 h-8 rounded-lg bg-accent text-white text-[11px] font-semibold hover:bg-accent-strong flex items-center justify-center gap-1"
      >
        <Pencil size={11} /> Editar
      </button>
    </div>
  )
}

function InfoPrecio({ p, centrado = false }) {
  return (
    <div className={`flex items-baseline gap-2 ${centrado ? 'justify-center' : ''}`}>
      <span className="text-gold font-bold">{formatPrecio(p.precio)}</span>
      {p.antes > p.precio && (
        <span className="text-ink-3 line-through text-xs">{formatPrecio(p.antes)}</span>
      )}
    </div>
  )
}

function LineaStock({ p, centrado = false }) {
  const stock = estadoStock(p.stock)
  return <p className={`text-[11px] mt-1 font-medium ${centrado ? 'text-center' : ''}`} style={{ color: stock.color }}>{stock.label}</p>
}

function BotonesAccion({ p, onAgregar, onComprar, sobreImagen = false }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onAgregar(p) }}
        disabled={p.stock <= 0}
        className={`flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
          sobreImagen
            ? 'text-white bg-white/20 hover:bg-white/30 border border-white/40'
            : 'border border-line text-ink-2 hover:text-accent hover:border-accent'
        }`}
      >
        <ShoppingBag size={14} /> Agregar
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onComprar(p) }}
        disabled={p.stock <= 0}
        className={`flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed bg-[#25D366] text-white hover:bg-[#1DAB54] shadow-lg shadow-[#25D366]/20`}
      >
        <IconoWhatsApp className="w-3.5 h-3.5" /> Comprar
      </button>
    </div>
  )
}

function TarjetaVertical({ p, onVer, onAgregar, onComprar, esFavorito, onFavorito, modoEdicion, onEditar }) {
  return (
    <div
      className="card card-hover relative overflow-hidden flex flex-col cursor-pointer group"
      onClick={() => onVer(p)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onVer(p) }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <VisualProducto p={p} className="w-full h-full" />
        <BadgeProducto p={p} />
        <BotonFavorito esFavorito={esFavorito} onClick={onFavorito} />
        <CapaEdicion modoEdicion={modoEdicion} onEditar={() => onEditar(p)} />
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <p className="text-accent text-[11px] uppercase tracking-wide font-medium">{p.categoria}</p>
        <p className="text-sm font-semibold text-ink mt-0.5 leading-snug truncate">{p.nombre}</p>
        <InfoPrecio p={p} />
        <LineaStock p={p} />
        <div className="mt-3">
          <BotonesAccion p={p} onAgregar={onAgregar} onComprar={onComprar} />
        </div>
      </div>
    </div>
  )
}

function TarjetaHorizontal({ p, onVer, onAgregar, onComprar, esFavorito, onFavorito, modoEdicion, onEditar }) {
  return (
    <div
      className="card card-hover relative overflow-hidden flex flex-col sm:flex-row cursor-pointer group"
      onClick={() => onVer(p)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onVer(p) }}
    >
      <div className="relative aspect-[4/3] sm:aspect-auto sm:w-44 shrink-0 sm:min-h-full overflow-hidden">
        <VisualProducto p={p} className="w-full h-full" />
        <BadgeProducto p={p} />
        <BotonFavorito esFavorito={esFavorito} onClick={onFavorito} />
        <CapaEdicion modoEdicion={modoEdicion} onEditar={() => onEditar(p)} />
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-accent text-[11px] uppercase tracking-wide font-medium truncate">{p.categoria}</p>
            <LineaStock p={p} centrado />
          </div>
          <p className="text-sm font-semibold text-ink mt-0.5 leading-snug">{p.nombre}</p>
          <InfoPrecio p={p} />
        </div>
        <div className="mt-3">
          <BotonesAccion p={p} onAgregar={onAgregar} onComprar={onComprar} />
        </div>
      </div>
    </div>
  )
}

function TarjetaBoutique({ p, onVer, onAgregar, onComprar, esFavorito, onFavorito, modoEdicion, onEditar }) {
  return (
    <div
      className="card card-hover relative overflow-hidden cursor-pointer group"
      onClick={() => onVer(p)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onVer(p) }}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <VisualProducto p={p} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
        <BadgeProducto p={p} />
        <BotonFavorito esFavorito={esFavorito} onClick={onFavorito} />
        <CapaEdicion modoEdicion={modoEdicion} onEditar={() => onEditar(p)} />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-[11px] uppercase tracking-wide font-medium text-white/80">{p.categoria}</p>
          <p className="text-sm font-semibold leading-snug mt-0.5">{p.nombre}</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-gold font-bold drop-shadow">{formatPrecio(p.precio)}</span>
            {p.antes > p.precio && <span className="text-white/70 line-through text-xs">{formatPrecio(p.antes)}</span>}
          </div>
          <div className="mt-2">
            <BotonesAccion p={p} onAgregar={onAgregar} onComprar={onComprar} sobreImagen />
          </div>
        </div>
      </div>
    </div>
  )
}

function TarjetaMinimal({ p, onVer, onAgregar, onComprar, esFavorito, onFavorito, modoEdicion, onEditar }) {
  return (
    <div
      className="relative rounded-3xl border border-line bg-transparent hover:bg-blush/40 transition cursor-pointer group overflow-hidden"
      onClick={() => onVer(p)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onVer(p) }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl">
        <VisualProducto p={p} className="w-full h-full" />
        <BadgeProducto p={p} />
        <BotonFavorito esFavorito={esFavorito} onClick={onFavorito} />
        <CapaEdicion modoEdicion={modoEdicion} onEditar={() => onEditar(p)} />
      </div>
      <div className="p-4 text-center">
        <p className="text-[10px] uppercase tracking-widest text-ink-3">{p.categoria}</p>
        <p className="text-base font-medium text-ink mt-1 leading-snug">{p.nombre}</p>
        <InfoPrecio p={p} centrado />
        <div className="mt-2">
          <BotonesAccion p={p} onAgregar={onAgregar} onComprar={onComprar} />
        </div>
      </div>
    </div>
  )
}

function TarjetaEditorial({ p, i = 0, onVer, onAgregar, onComprar, esFavorito, onFavorito, modoEdicion, onEditar }) {
  return (
    <div
      className="card card-hover relative overflow-hidden flex flex-col cursor-pointer group"
      onClick={() => onVer(p)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onVer(p) }}
    >
      <div className="px-4 pt-4 flex items-baseline justify-between gap-2">
        <span className="font-display text-4xl font-black text-accent/25 leading-none">{String(i + 1).padStart(2, '0')}</span>
        <p className="text-[10px] uppercase tracking-widest text-ink-3 text-right">{p.categoria}</p>
      </div>
      <div className="px-4 pt-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <VisualProducto p={p} className="w-full h-full" />
          <BadgeProducto p={p} />
          <BotonFavorito esFavorito={esFavorito} onClick={onFavorito} />
          <CapaEdicion modoEdicion={modoEdicion} onEditar={() => onEditar(p)} />
        </div>
      </div>
      <div className="p-4 pt-3 flex-1 flex flex-col">
        <p className="text-sm font-semibold text-ink leading-snug">{p.nombre}</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-gold font-bold italic">{formatPrecio(p.precio)}</span>
          {p.antes > p.precio && <span className="text-ink-3 line-through text-xs">{formatPrecio(p.antes)}</span>}
        </div>
        <LineaStock p={p} />
        <div className="mt-3">
          <BotonesAccion p={p} onAgregar={onAgregar} onComprar={onComprar} />
        </div>
      </div>
    </div>
  )
}

function TarjetaProducto({ p, i = 0, forma = 'vertical', onVer, onAgregar, onComprar, esFavorito, onFavorito, modoEdicion, onEditar }) {
  const comunes = { p, onVer, onAgregar, onComprar, esFavorito, onFavorito, modoEdicion, onEditar }
  if (forma === 'horizontal') return <TarjetaHorizontal {...comunes} />
  if (forma === 'boutique') return <TarjetaBoutique {...comunes} />
  if (forma === 'minimal') return <TarjetaMinimal {...comunes} />
  if (forma === 'editorial') return <TarjetaEditorial {...comunes} i={i} />
  return <TarjetaVertical {...comunes} />
}

/* ── SELECCIONADOR DE FORMA DE TARJETAS ────────────────────── */
function PanelFormaCatalogo({ valor, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {FORMAS_CATALOGO.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            className={`h-8 px-2.5 rounded-full text-[11px] font-medium transition border ${
              valor === f.id
                ? 'bg-accent text-white border-accent'
                : 'bg-surface text-ink-2 border-line hover:border-accent'
            }`}
          >
            {f.emoji} {f.nombre}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange(FORMAS_CATALOGO[Math.floor(Math.random() * FORMAS_CATALOGO.length)].id)}
        className="w-full h-8 rounded-xl text-[11px] font-semibold bg-gradient-to-r from-accent to-gold text-white flex items-center justify-center gap-1.5 hover:scale-[1.02] transition"
      >
        <Dices size={13} /> Forma al azar
      </button>
    </div>
  )
}

/* ── VISOR DE GALERÍA (deslizar fotos del producto) ───────── */
function GaleriaProducto({ p }) {
  const imgs = [p.imagen, ...(p.galeria || [])].filter(Boolean)
  const [idx, setIdx] = useState(0)
  const touchX = useRef(null)

  if (imgs.length === 0) return <VisualProducto p={p} className="w-full h-full" />
  if (imgs.length === 1) return <img src={imgs[0]} alt={p.nombre} className="w-full h-full object-cover" />

  const total = imgs.length
  const actual = ((idx % total) + total) % total

  const ir = (dir) => setIdx((i) => (i + dir + total) % total)

  return (
    <div
      className="absolute inset-0 touch-pan-y"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > 40) ir(dx < 0 ? 1 : -1)
      }}
    >
      <div className="absolute inset-0 flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${actual * 100}%)` }}>
        {imgs.map((im, i) => (
          <img key={i} src={im} alt={`${p.nombre} ${i + 1}`} draggable="false" className="w-full h-full shrink-0 object-cover" />
        ))}
      </div>

      {/* Flechas */}
      <button
        type="button"
        onClick={() => ir(-1)}
        aria-label="Foto anterior"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition opacity-0 group-hover:opacity-100 sm:opacity-90"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => ir(1)}
        aria-label="Foto siguiente"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition opacity-0 group-hover:opacity-100 sm:opacity-90"
      >
        <ChevronRight size={16} />
      </button>

      {/* Miniatura inferior */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/35 backdrop-blur-md max-w-[90%] overflow-x-auto">
        {imgs.map((im, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className={`w-7 h-7 rounded-md overflow-hidden shrink-0 ring-2 transition ${i === actual ? 'ring-gold' : 'ring-white/30 hover:ring-white/60'}`}
          >
            <img src={im} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/40 text-white/90 text-[10px] font-semibold tabular-nums">
        {actual + 1}/{total}
      </span>
    </div>
  )
}

/* ── DETALLE DE PRODUCTO ───────────────────────────────────── */
function DetalleProducto({ p, onClose, onAgregar, onComprar, esFavorito, onFavorito }) {
  const [cant, setCant] = useState(1)
  const stock = estadoStock(p.stock)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 anim-overlay" onClick={onClose}>
      <div
        className="card rounded-2xl w-full max-w-3xl flex flex-col sm:flex-row overflow-hidden max-h-[90vh] anim-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="group sm:w-1/2 h-56 sm:h-auto bg-bg-soft relative">
          <GaleriaProducto p={p} />
          <button type="button" onClick={onClose} className="absolute top-2 right-2 w-8 h-8 bg-elevated rounded-full flex items-center justify-center text-ink-2 hover:text-ink shadow z-10">
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={() => onFavorito(p)}
            className={`absolute top-2 left-2 w-9 h-9 rounded-full flex items-center justify-center border border-line shadow z-10 ${esFavorito ? 'text-gold bg-card' : 'text-ink-2 bg-card'}`}
            aria-label="Favorito"
          >
            <Heart size={18} fill={esFavorito ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="flex-1 p-6 sm:p-7 overflow-y-auto">
          <span className="text-accent text-xs uppercase tracking-wide font-medium">{p.categoria}</span>
          <h2 className="font-display text-2xl font-bold text-ink mt-1">{p.nombre}</h2>
          {p.badge && <span className={`badge ${p.badge === 'Oferta' ? 'badge-gold' : 'badge-rose'} mt-2 inline-flex`}>{p.badge}</span>}
          <p className="text-ink-3 text-sm mt-3 leading-relaxed">{p.desc || 'Sin descripción.'}</p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-gold text-2xl font-bold">{formatPrecio(p.precio)}</span>
            {p.antes > p.precio && <span className="text-ink-3 line-through text-sm">{formatPrecio(p.antes)}</span>}
          </div>
          <p className="text-xs mt-1 font-medium" style={{ color: stock.color }}>{stock.label}</p>

          <div className="flex items-center gap-3 mt-5">
            <span className="text-sm text-ink-3">Cantidad</span>
            <div className="flex items-center bg-elevated border border-line rounded-xl overflow-hidden">
              <button type="button" onClick={() => setCant((c) => Math.max(1, c - 1))} className="w-9 h-9 text-ink-2 text-lg hover:text-ink">−</button>
              <span className="w-8 text-center text-ink font-medium">{cant}</span>
              <button type="button" onClick={() => setCant((c) => Math.min(p.stock, c + 1))} disabled={cant >= p.stock} className="w-9 h-9 text-ink-2 text-lg hover:text-ink disabled:opacity-30">+</button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { onAgregar(p, cant); onClose() }}
            disabled={p.stock <= 0}
            className="btn btn-primary w-full mt-6 h-12 text-sm disabled:opacity-40"
          >
            <ShoppingBag size={16} /> Agregar al carrito · {formatPrecio(p.precio * cant)}
          </button>

          <button
            type="button"
            onClick={() => onComprar(p, cant)}
            disabled={p.stock <= 0}
            className="btn w-full mt-2 h-12 text-sm flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#1DAB54] disabled:opacity-40 border-0 shadow-lg shadow-[#25D366]/25"
          >
            <IconoWhatsApp className="w-4 h-4" /> Pedir por WhatsApp · {formatPrecio(p.precio * cant)}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── CARRITO (drawer) ──────────────────────────────────────── */
function CarritoDrawer({ carrito, onClose, onSumar, onRestar, onQuitar, total, onPedirWhatsApp, numeroWhatsApp }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-overlay anim-overlay" onClick={onClose}>
      <div className="w-full max-w-sm h-full flex flex-col card rounded-none border-l anim-sheet-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-display font-bold text-ink">Tu carrito ({carrito.length})</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-elevated text-ink-2 hover:text-ink border border-line"><X size={15} className="mx-auto" /></button>
        </div>
        {carrito.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <span className="text-5xl">🛍️</span>
            <p className="text-ink-3 text-sm">Tu carrito está vacío.</p>
            <button type="button" onClick={onClose} className="mt-2 text-sm text-accent font-semibold hover:underline">Explorar el catálogo →</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {carrito.map((item) => (
                <div key={item.id} className="card rounded-xl p-3 flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-bg-soft">
                    <VisualProducto p={item} className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{item.nombre}</p>
                    <p className="text-xs text-gold font-semibold">{formatPrecio(item.precio)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button type="button" onClick={() => onRestar(item.id)} className="w-6 h-6 rounded-md bg-elevated border border-line text-ink-2 text-sm">−</button>
                      <span className="text-ink text-xs font-medium">{item.cant}</span>
                      <button type="button" onClick={() => onSumar(item.id)} className="w-6 h-6 rounded-md bg-elevated border border-line text-ink-2 text-sm">+</button>
                      <button type="button" onClick={() => onQuitar(item.id)} className="ml-auto text-error text-xs hover:underline">Quitar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-line">
              <div className="flex justify-between text-ink mb-3">
                <span className="text-sm">Total</span>
                <span className="font-bold text-gold">{formatPrecio(total)}</span>
              </div>
              <button
                type="button"
                onClick={() => onPedirWhatsApp(carrito)}
                className="btn w-full py-3 flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#1DAB54] border-0 shadow-lg shadow-[#25D366]/25"
              >
                <IconoWhatsApp className="w-4 h-4" /> Pedir por WhatsApp
              </button>
              <p className="text-[11px] text-ink-3 text-center mt-2">
                Te llevamos a un chat para terminar tu pedido · {numeroWhatsApp}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── MODAL EDITAR / NUEVO PRODUCTO (solo admin) ────────────── */
function CampoModal({ label, valor, cambio, type = 'text', numero = false }) {
  return (
    <div>
      <label className="block text-xs text-ink-3 mb-1">{label}</label>
      <input
        type={type}
        value={valor}
        onChange={(e) => cambio(numero ? Number(e.target.value) : e.target.value)}
        className="input"
      />
    </div>
  )
}

function EditProductoModal({ producto, onClose, onGuardar }) {
  const [form, setForm] = useState(() => producto || { id: Date.now(), nombre: '', categoria: 'maquillaje', precio: 0, antes: 0, emoji: '✨', imagen: '', galeria: [], desc: '', stock: 10, badge: '' })

  // Si el producto ya tiene una imagen de internet, se precarga en el campo URL.
  const [urlImagen, setUrlImagen] = useState(() => {
    const img = (producto && producto.imagen) || ''
    return img.startsWith('http') ? img : ''
  })
  const [urlGaleria, setUrlGaleria] = useState('')

  function subirImagen(e) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) return toast.error('Solo imágenes')
    if (archivo.size > 2 * 1024 * 1024) return toast.error('Máx 2 MB')
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, imagen: reader.result, emoji: '' }))
    reader.readAsDataURL(archivo)
  }

  // Galería: varias fotos extra del producto (se ven deslizando en el detalle).
  function subirGaleria(e) {
    const archivos = [...(e.target.files || [])]
    if (archivos.length === 0) return
    const validos = archivos.filter((a) => a.type.startsWith('image/') && a.size <= 2 * 1024 * 1024)
    if (validos.length === 0) return toast.error('Solo imágenes de max 2 MB')
    let contador = 0
    validos.forEach((archivo) => {
      const reader = new FileReader()
      reader.onload = () => {
        contador++
        setForm((f) => ({ ...f, galeria: [...(f.galeria || []), reader.result] }))
        if (contador === validos.length) toast.success(`${contador} foto${contador !== 1 ? 's' : ''} agregada${contador !== 1 ? 's' : ''} a la galería`)
      }
      reader.readAsDataURL(archivo)
    })
  }

  function usarUrlGaleria() {
    const url = urlGaleria.trim()
    if (!url.startsWith('http')) return toast.error('Pega una URL válida (https://...)')
    setForm((f) => ({ ...f, galeria: [...(f.galeria || []), url] }))
    setUrlGaleria('')
    toast.success('Imagen por URL agregada a la galería')
  }

  function quitarGaleria(i) {
    setForm((f) => ({ ...f, galeria: (f.galeria || []).filter((_, x) => x !== i) }))
  }

  function usarUrl() {
    const url = urlImagen.trim()
    if (!url.startsWith('http')) return toast.error('Pega una URL válida (https://...)')
    setForm((f) => ({ ...f, imagen: url, emoji: '' }))
    toast.success('Imagen por URL aplicada')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 anim-overlay" onClick={onClose}>
      <div className="card w-full max-w-md rounded-2xl p-6 anim-pop max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-ink">{producto ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button type="button" onClick={onClose} className="text-ink-3 hover:text-ink"><X size={20} /></button>
        </div>

        <div className="mb-4">
          <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-blush to-accent-light/70 flex items-center justify-center border border-line">
            {form.imagen ? <img src={form.imagen} alt="" className="w-full h-full object-cover" /> : <span className="text-4xl">{form.emoji || '✨'}</span>}
          </div>
          <label className="mt-2 block text-center cursor-pointer text-xs text-accent font-semibold hover:underline">
            📱 Subir imagen desde el teléfono
            <input type="file" accept="image/*" onChange={subirImagen} className="hidden" />
          </label>
        </div>

        <div className="mb-4">
          <p className="text-xs text-ink-3 mb-1.5">…o pega la URL de una imagen de internet 👇</p>
          <div className="flex gap-2">
            <input
              value={urlImagen}
              onChange={(e) => setUrlImagen(e.target.value)}
              placeholder="https://www.mitienda.com/foto.jpg"
              className="input text-sm flex-1"
            />
            <button
              type="button"
              onClick={usarUrl}
              className="btn btn-primary btn-sm shrink-0"
              title="Usar esta URL como imagen"
            >
              Usar
            </button>
          </div>
        </div>

        {/* Galería de imágenes extra */}
        <div className="mb-4 card rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-ink-2 uppercase tracking-wide">Galería de fotos ({form.galeria?.length || 0})</p>
            <label className="cursor-pointer text-xs text-accent font-semibold hover:underline inline-flex items-center gap-1">
              ＋ Cargar fotos
              <input type="file" accept="image/*" multiple onChange={subirGaleria} className="hidden" />
            </label>
          </div>
          {form.galeria?.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-2">
              {form.galeria.map((g, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-bg-soft border border-line">
                  <img src={g} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => quitarGaleria(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center hover:bg-error transition"
                    aria-label="Quitar foto"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-ink-3 mb-1.5">…o pega el enlace de una foto para la galería</p>
          <div className="flex gap-2">
            <input
              value={urlGaleria}
              onChange={(e) => setUrlGaleria(e.target.value)}
              placeholder="https://…/foto-extra.jpg"
              className="input text-sm flex-1"
            />
            <button type="button" onClick={usarUrlGaleria} className="btn btn-ghost btn-sm shrink-0">Añadir</button>
          </div>
          <p className="text-[10px] text-ink-3 mt-2">El usuario podrá tocar el producto y deslizar para ver todas las fotos.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="col-span-2"><CampoModal label="Nombre" valor={form.nombre} cambio={(v) => setForm({ ...form, nombre: v })} /></div>
          <label className="block text-xs text-ink-3 mb-1">Categoría</label>
          <select
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="input"
          >
            <option value="maquillaje">Maquillaje</option>
            <option value="ropa">Ropa</option>
          </select>
          <CampoModal label="Emoji (si no hay imagen)" valor={form.emoji} cambio={(v) => setForm({ ...form, emoji: v })} />
          <CampoModal label="Precio" valor={form.precio} cambio={(v) => setForm({ ...form, precio: v })} numero />
          <CampoModal label="Antes (0 = sin oferta)" valor={form.antes} cambio={(v) => setForm({ ...form, antes: v })} numero />
          <CampoModal label="Stock" valor={form.stock} cambio={(v) => setForm({ ...form, stock: v })} numero />
          <CampoModal label="Insignia (Nuevo/Oferta/Top ventas)" valor={form.badge} cambio={(v) => setForm({ ...form, badge: v })} />
        </div>
        <div className="mb-4">
          <label className="block text-xs text-ink-3 mb-1">Descripción</label>
          <textarea
            rows={2}
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            className="input resize-y"
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Cancelar</button>
          <button type="button" onClick={() => onGuardar(form)} className="btn btn-primary flex-1">Guardar</button>
        </div>
      </div>
    </div>
  )
}

/* ── CARRUSEL DE PRODUCTOS RECOMENDADOS (vitrina de fotos) ─── */
function CarruselRecomendados({ productos, auto, titulo, onVer, onAgregar, onComprar, esFavorito, onFavorito, modoEdicion, onEditar }) {
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)
  const touchX = useRef(null)

  // Cada imagen del producto (portada + galería) es un slide con su producto.
  const slides = useMemo(() => {
    const arr = []
    productos.forEach((p) => {
      const imgs = [...new Set([p.imagen, ...(p.galeria || [])].filter(Boolean))]
      if (imgs.length) imgs.forEach((im) => arr.push({ id: `${p.id}-${im.slice(0, 24)}`, producto: p, imagen: im }))
      else arr.push({ id: `emoji-${p.id}`, producto: p, imagen: '' })
    })
    return arr
  }, [productos])

  const total = slides.length
  const actual = total ? ((indice % total) + total) % total : 0
  const velocidad = Math.max(2000, auto || 3500)

  useEffect(() => {
    if (total <= 1 || pausado) return
    const id = setInterval(() => setIndice((i) => (i + 1) % total), velocidad)
    return () => clearInterval(id)
  }, [total, pausado, velocidad])

  if (total === 0) return null

  const s = slides[actual]
  const p = s.producto
  const ir = (dir) => setIndice((i) => (i + dir + total) % total)

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-bold text-ink">{titulo}</h2>
        <div className="flex items-center gap-2">
          {total > 1 && (
            <button type="button" onClick={() => ir(-1)} className="w-8 h-8 rounded-full border border-line bg-elevated flex items-center justify-center text-ink-2 hover:text-accent transition" aria-label="Anterior">
              <ChevronLeft size={15} />
            </button>
          )}
          {total > 1 && (
            <button type="button" onClick={() => ir(1)} className="w-8 h-8 rounded-full border border-line bg-elevated flex items-center justify-center text-ink-2 hover:text-accent transition" aria-label="Siguiente">
              <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>

      <div
        className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-line shadow-xl shadow-ink/5 cursor-pointer touch-pan-y"
        onClick={() => onVer(p)}
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return
          const dx = e.changedTouches[0].clientX - touchX.current
          touchX.current = null
          if (Math.abs(dx) > 40) ir(dx < 0 ? 1 : -1)
        }}
      >
        {/* Foto del slide actual: se muestra completa sin recortar */}
        <div key={s.id} className="absolute inset-0 fade-in bg-gradient-to-br from-blush/60 to-accent-light/40">
          {s.imagen ? (
            <img
              key={s.id}
              src={s.imagen}
              alt={p.nombre}
              draggable="false"
              className="carrusel-zoom w-full h-full object-contain"
              style={{ animationDuration: `${velocidad}ms`, animationPlayState: pausado ? 'paused' : 'running' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl drop-shadow-lg">{p.emoji || '✨'}</span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/12 to-transparent" />

        {/* Barra de progreso del auto */}
        {total > 1 && !pausado && (
          <span
            key={actual}
            className="absolute bottom-0 left-0 h-1 bg-gold/90 z-20 rounded-r-full"
            style={{ width: '100%', transformOrigin: 'left', animation: `carrusel-progreso ${velocidad}ms linear forwards` }}
            aria-hidden="true"
          />
        )}

        {/* Acciones superiores */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFavorito(p) }}
          className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow border border-line transition ${esFavorito(p) ? 'text-gold bg-card' : 'text-white bg-black/30 hover:bg-black/55'}`}
          aria-label="Favorito"
        >
          <Heart size={17} fill={esFavorito(p) ? 'currentColor' : 'none'} />
        </button>
        {modoEdicion && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEditar(p) }}
            className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition"
            aria-label="Editar producto"
          >
            <Pencil size={15} />
          </button>
        )}
        {total > 1 && (
          <span className="absolute bottom-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-[11px] font-semibold tabular-nums">
            {actual + 1}/{total}
          </span>
        )}

        {/* Flechas laterales */}
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={(e) => { e.stopPropagation(); ir(-1) }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition hover:bg-black/55 active:scale-90"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={(e) => { e.stopPropagation(); ir(1) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition hover:bg-black/55 active:scale-90"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Info + acciones */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 z-10 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            {p.badge && <span className={`badge ${p.badge === 'Oferta' ? 'badge-gold' : 'badge-rose'} inline-flex mb-2`}>{p.badge}</span>}
            <p className="text-white/80 text-[10px] uppercase tracking-wide font-medium">{p.categoria}</p>
            <h3 className="font-display text-xl sm:text-3xl font-bold text-white leading-tight drop-shadow truncate max-w-[70vw]">{p.nombre}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-gold-soft text-lg sm:text-2xl font-bold drop-shadow">{formatPrecio(p.precio)}</span>
              {p.antes > p.precio && <span className="text-white/70 line-through text-xs sm:text-sm">{formatPrecio(p.antes)}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAgregar(p) }}
              disabled={p.stock <= 0}
              className="h-10 px-4 rounded-xl bg-white text-ink text-xs font-bold flex items-center gap-1.5 shadow-lg hover:bg-gold hover:text-white transition disabled:opacity-40"
            >
              <ShoppingBag size={14} /> Agregar
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onComprar(p) }}
              disabled={p.stock <= 0}
              className="h-10 px-4 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#25D366]/30 hover:bg-[#1DAB54] transition disabled:opacity-40"
            >
              <IconoWhatsApp className="w-3.5 h-3.5" /> Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── CATÁLOGO PRINCIPAL ────────────────────────────────────── */
function CatalogoInterno() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [contenido, setContenido] = useState(() => cargarContenido())

  const [seccion, setSeccion] = useState(() => {
    const s = searchParams.get('seccion')
    return ['maquillaje', 'ropa', 'accesorios', 'favoritos', 'todos'].includes(s) ? s : 'todos'
  })
  const [busqueda, setBusqueda] = useState('')
  const [ayudaOpen, setAyudaOpen] = useState(false)
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

  const [modoEdicion] = useState(() => esAdmin())
  const [editando, setEditando] = useState(null)
  const [recomendadosOpen, setRecomendadosOpen] = useState(false)

  const productos = contenido.productos || []
  const colecciones = contenido.colecciones || []
  const catalogoForma = contenido.catalogoForma || 'vertical'
  const productosRecomendados = (contenido.recomendadosActivo !== false)
    ? productos.filter((p) => !contenido.recomendadosColeccion || p.categoria === contenido.recomendadosColeccion)
    : []

  useEffect(() => { localStorage.setItem('nathalia_carrito', JSON.stringify(carrito)) }, [carrito])
  useEffect(() => { localStorage.setItem('nathalia_favoritos', JSON.stringify([...favoritos])) }, [favoritos])
  useEffect(() => { localStorage.setItem('nathalia_vistos', JSON.stringify(vistos)) }, [vistos])
  useEffect(() => suscribirseContenido((nuevo) => setContenido(nuevo)), [])

  function cambiarSeccion(id) {
    setSeccion(id)
    setSearchParams(id === 'maquillaje' || id === 'todos' ? {} : { seccion: id }, { replace: true })
  }

  function guardarCambios(nuevoContenido) {
    guardarContenido(nuevoContenido)
    setContenido(nuevoContenido)
  }

  function editar(ruta, valor) {
    guardarCambios(actualizarCampo(contenido, ruta, valor))
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

  function comprarProducto(p, cant = 1) {
    const precioTotal = (p.precio || 0) * cant
    registrarPedidoWhatsApp([{ ...p, cantidad: cant }], precioTotal)
    abrirWhatsApp(construirMensajeProducto(p, cant), contenido.telefonoWhatsApp)
    toast.success('Pedido enviado a WhatsApp ✅')
  }

  function pedirWhatsApp(lineas) {
    const lineasNormalizadas = lineas.map((l) => ({ ...l, cantidad: l.cant || l.cantidad || 1 }))
    const total = lineasNormalizadas.reduce((s, l) => s + (l.precio || 0) * l.cantidad, 0)
    registrarPedidoWhatsApp(lineasNormalizadas, total)
    abrirWhatsApp(construirMensajePedido(lineasNormalizadas, total), contenido.telefonoWhatsApp)
    setCarrito([])
    setCarritoOpen(false)
    toast.success('Pedido enviado a WhatsApp ✅ Se guardó en Mis pedidos')
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

  const filtrados = useMemo(() => {
    let lista = productos.filter((p) => {
      const matchSeccion = seccion === 'todos' ? true : seccion === 'favoritos' ? favoritos.has(p.id) : p.categoria === seccion
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

  const productoDelDia = useMemo(() => {
    if (!productos.length) return null
    const hoy = new Date()
    const semilla = hoy.getFullYear() * 372 + (hoy.getMonth() + 1) * 31 + hoy.getDate()
    return productos[semilla % productos.length]
  }, [productos])

  const seccionActual =
    colecciones.find((c) => c.id === seccion) ||
    (seccion === 'todos' ? { label: 'Ropa y Belleza', emoji: '🎀' } : { label: 'Favoritos', emoji: '♥' })

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

  function guardarCarrusel(nuevoContenido) {
    guardarCambios(nuevoContenido)
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* PESTAÑAS DE COLECCIONES */}
      <div className="sticky top-16 z-30 border-b border-line bg-elevated/90 backdrop-blur-md px-4 sm:px-6">
        <div className="max-w-6xl mx-auto h-14 flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => cambiarSeccion('todos')}
            className={`px-3.5 h-9 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              seccion === 'todos' ? 'bg-accent text-white shadow-md' : 'text-ink-2 hover:text-ink hover:bg-accent-light/50'
            }`}
          >
            <span>🎀</span> Ropa y Belleza
          </button>
          {colecciones.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => cambiarSeccion(c.id)}
              className={`px-3.5 h-9 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                seccion === c.id ? 'bg-accent text-white shadow-md' : 'text-ink-2 hover:text-ink hover:bg-accent-light/50'
              }`}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => cambiarSeccion('favoritos')}
            className={`px-3.5 h-9 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              seccion === 'favoritos' ? 'bg-accent text-white shadow-md' : 'text-ink-2 hover:text-ink hover:bg-accent-light/50'
            }`}
          >
            <Heart size={14} fill={seccion === 'favoritos' ? 'currentColor' : 'none'} /> Favoritos
            {favoritos.size > 0 && <span className="text-[10px] font-bold">({favoritos.size})</span>}
          </button>

          <button
            type="button"
            onClick={() => setCarritoOpen(true)}
            className="ml-auto shrink-0 h-9 rounded-full px-3.5 bg-accent text-white flex items-center gap-1.5 text-sm font-semibold shadow-md hover:bg-accent-strong transition"
            aria-label="Ver carrito"
          >
            <ShoppingBag size={15} />
            {carrito.length > 0 && (
              <span className="bg-gold text-[var(--text-inverse)] text-[10px] font-bold h-5 min-w-5 px-1 rounded-full flex items-center justify-center">
                {carrito.reduce((s, c) => s + c.cant, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* HERO / TITULAR */}
      <div
        className="relative px-4 sm:px-6 pt-10 pb-8 overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(85% 120% at 0% 0%, color-mix(in srgb, var(--na-rose) 13%, transparent) 0%, transparent 55%),' +
            'radial-gradient(70% 110% at 100% 15%, color-mix(in srgb, var(--na-gold) 12%, transparent) 0%, transparent 55%),' +
            'linear-gradient(165deg, var(--bg-soft) 20%, color-mix(in srgb, var(--na-blush) 55%, var(--bg)) 100%)',
        }}
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border border-dashed border-line opacity-70" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blush/40 blur-2xl" aria-hidden="true" />
        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <span className="kicker">
                <EditableTexto clave="catalogoKicker" valor={contenido.catalogoKicker} onCambio={editar} esEdicion={modoEdicion} />
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight mt-2 tracking-tight text-ink">
                {seccion === 'favoritos' ? 'Tus favoritos' : `${seccionActual.emoji} ${seccionActual.label}`}
              </h1>
              <p className="text-ink-2 text-sm mt-3 max-w-md">
                {seccion === 'favoritos'
                  ? 'Los productos que guardaste con ♥ para encontrarlos más rápido.'
                  : (
                    <EditableTexto clave="catalogoSubtitulo" valor={contenido.catalogoSubtitulo} onCambio={editar} esEdicion={modoEdicion} multilinea />
                  )}
              </p>
              <button
                type="button"
                onClick={() => setAyudaOpen(true)}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-gold to-gold-strong px-5 text-sm font-bold text-[var(--text-inverse)] shadow-lg shadow-gold/20 hover:brightness-105 hover:scale-[1.02] active:scale-95 transition"
              >
                <Dices size={17} />
                <EditableTexto clave="catalogoAyuda" valor={contenido.catalogoAyuda} onCambio={editar} esEdicion={modoEdicion} />
              </button>
            </div>
            <div className="flex gap-6 sm:gap-8 shrink-0">
              <div>
                <p className="font-display text-xl sm:text-2xl font-bold text-ink">{productos.length}</p>
                <p className="text-[11px] text-ink-3 mt-0.5 uppercase tracking-wide">Productos</p>
              </div>
              <div>
                <p className="font-display text-xl sm:text-2xl font-bold text-ink">{colecciones.length}</p>
                <p className="text-[11px] text-ink-3 mt-0.5 uppercase tracking-wide">Colecciones</p>
              </div>
              <div>
                <p className="font-display text-xl sm:text-2xl font-bold text-gold">24h</p>
                <p className="text-[11px] text-ink-3 mt-0.5 uppercase tracking-wide">Entrega</p>
              </div>
            </div>
          </div>
          {modoEdicion && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setRecomendadosOpen(true)}
                className="btn btn-ghost btn-md"
                title="Fila de productos: Tal vez te guste"
              >
                <Dices size={15} /> 🎲 Carrusel de productos
              </button>
              <button
                type="button"
                onClick={() => setEditando({ id: Date.now(), nombre: '', categoria: seccion === 'favoritos' || seccion === 'todos' ? 'maquillaje' : seccion, precio: 0, antes: 0, emoji: '✨', imagen: '', desc: '', stock: 10, badge: '' })}
                className="btn btn-primary btn-md"
              >
                <Plus size={15} /> Agregar producto
              </button>
              <span className="text-[11px] text-ink-3">Toca cualquier producto para editarlo · 📱 sube imágenes</span>
            </div>
          )}
        </div>

        {/* Carrusel de productos recomendados */}
        {productosRecomendados.length > 0 && (
          <div className="max-w-6xl mx-auto mt-8">
            <CarruselRecomendados
              productos={productosRecomendados}
              auto={contenido.recomendadosAuto}
              titulo={contenido.recomendadosTitulo || 'Tal vez te guste ✨'}
              onVer={verDetalle}
              onAgregar={agregar}
              onComprar={(prod) => comprarProducto(prod)}
              esFavorito={(p) => favoritos.has(p.id)}
              onFavorito={toggleFavorito}
              modoEdicion={modoEdicion}
              onEditar={(prod) => setEditando(prod)}
            />
          </div>
        )}
      </div>
      {/* Línea decorativa bajo el hero */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto max-w-6xl" />

      {/* BARRA DE FILTROS */}
      <div className="sticky top-[104px] z-30 px-4 sm:px-6 py-3 border-b border-line bg-bg/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 card rounded-xl px-3.5 py-2 flex-1 min-w-[180px]">
            <Search size={15} className="text-ink-3" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar en la colección..."
              className="flex-1 min-w-0 text-sm outline-none bg-transparent text-ink placeholder-ink-3"
            />
          </div>

          <select
            value={filtroDisp}
            onChange={(e) => setFiltroDisp(e.target.value)}
            className="h-10 px-3 rounded-xl text-sm text-ink-2 outline-none card cursor-pointer"
          >
            <option value="todos">Todos</option>
            <option value="stock">En stock</option>
          </select>

          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="h-10 px-3 rounded-xl text-sm text-ink-2 outline-none card cursor-pointer"
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
          <div className="card overflow-hidden flex flex-col sm:flex-row" style={{ borderColor: 'color-mix(in srgb, var(--na-rose) 35%, var(--border))' }}>
            <div className="sm:w-48 h-40 sm:h-auto cursor-pointer shrink-0 bg-bg-soft" onClick={() => verDetalle(productoDelDia)}>
              <VisualProducto p={productoDelDia} className="w-full h-full" />
            </div>
            <div className="flex-1 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <span className="badge badge-rose inline-flex mb-2">
                  <Star size={12} /> Producto del día · 20% OFF
                </span>
                <p className="font-display font-bold text-ink cursor-pointer hover:text-accent transition" onClick={() => verDetalle(productoDelDia)}>{productoDelDia.nombre}</p>
                <p className="text-sm text-ink-2 mt-1">
                  <span className="font-bold text-gold">{formatPrecio(Math.round(productoDelDia.precio * 0.8))}</span>{' '}
                  <span className="line-through text-ink-3">{formatPrecio(productoDelDia.precio)}</span>
                </p>
              </div>
              <button type="button" onClick={() => agregar({ ...productoDelDia, precio: Math.round(productoDelDia.precio * 0.8) }, 1)} className="btn btn-primary h-11 px-6 text-sm shrink-0">
                Agregar
              </button>
            </div>
          </div>
        )}

        {/* GRID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-ink">
              {seccion === 'favoritos' ? 'Tus favoritos' : seccion === 'todos' ? 'Todo · Ropa y Belleza' : `Colección ${seccionActual.label}`}
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-sm text-ink-3">{filtrados.length} {filtrados.length === 1 ? 'producto' : 'productos'}</p>
              <EditorInSitu
                esEdicion={modoEdicion}
                titulo="Forma de tarjetas del catálogo"
                ancho="w-72"
                envoltura="relative shrink-0"
                edicion={<PanelFormaCatalogo valor={catalogoForma} onChange={(v) => editar('catalogoForma', v)} />}
              >
                <span className="hidden sm:inline text-[11px] text-ink-3">{catalogoForma === 'vertical' ? '' : 'Tarjetas'}</span>
              </EditorInSitu>
            </div>
          </div>

          {filtrados.length === 0 ? (
            <div className="text-center py-16 card">
              <span className="text-4xl block mb-2">{seccion === 'favoritos' ? '💗' : '🔍'}</span>
              <p className="text-ink-3 text-sm">{seccion === 'favoritos' ? 'Aún no tienes favoritos. Toca el corazón de un producto.' : 'No se encontraron productos.'}</p>
            </div>
          ) : (
            <div className={catalogoForma === 'horizontal' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'}>
              {filtrados.map((p, idx) => (
                <TarjetaProducto
                  key={p.id}
                  p={p}
                  i={idx}
                  forma={catalogoForma}
                  onVer={verDetalle}
                  onAgregar={agregar}
                  onComprar={(prod) => comprarProducto(prod)}
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
            <h2 className="font-display text-lg font-bold text-ink mb-3">Vistos recientemente</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {vistos.map((p) => (
                <div key={p.id} className="shrink-0 w-32 rounded-xl card overflow-hidden cursor-pointer bg-bg-soft" onClick={() => verDetalle(p)}>
                  <div className="h-24"><VisualProducto p={p} className="w-full h-full" /></div>
                  <div className="p-2">
                    <p className="text-[11px] text-ink truncate">{p.nombre}</p>
                    <p className="text-xs font-semibold text-gold">{formatPrecio(p.precio)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODALES */}
      {detalle && (
        <DetalleProducto
          p={detalle}
          onClose={() => setDetalle(null)}
          onAgregar={agregar}
          onComprar={(prod, cant) => { comprarProducto(prod, cant); setDetalle(null) }}
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
          onPedirWhatsApp={pedirWhatsApp}
          numeroWhatsApp={contenido.telefonoWhatsApp}
        />
      )}
      {modoEdicion && editando && (
        <EditProductoModal
          producto={productos.find((p) => p.id === editando.id) || null}
          onClose={() => setEditando(null)}
          onGuardar={guardarProducto}
        />
      )}

      {/* Asistente "¿No sabes qué elegir?" */}
      <AyudaElegir
        open={ayudaOpen}
        onClose={() => setAyudaOpen(false)}
        productos={productos}
        colecciones={colecciones}
        onAgregar={agregar}
        onComprar={(prod) => comprarProducto(prod)}
        onVer={verDetalle}
        numeroWhatsApp={contenido.telefonoWhatsApp}
      />

      {/* Panel admin: carrusel de productos recomendados */}
      {modoEdicion && (
        <PanelRecomendados
          open={recomendadosOpen}
          contenido={contenido}
          colecciones={colecciones}
          onClose={() => setRecomendadosOpen(false)}
          onGuardar={guardarCarrusel}
        />
      )}
    </div>
  )
}

export default function Catalogo() {
  return <CatalogoInterno />
}