import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Sparkles,
  Heart,
  Palette,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Gem,
  Star,
  ArrowRight,
  ChevronDown,
  Clock,
  BadgeCheck,
  Crown,
  Menu,
  X,
  Pencil,
  Dices,
} from 'lucide-react'
import FadeIn from '../components/ui/FadeIn'
import LogoNathalia from '../components/LogoNathalia'
import EditorInSitu from '../components/EditorInSitu'
import { useClampAlViewport } from '../utils/useClampAlViewport'
import PanelMarca from '../components/PanelMarca'
import EditarProducto from '../components/EditarProducto'
import EditarFlotante from '../components/EditarFlotante'
import ThemeToggle from '../components/ThemeToggle'
import AuroraBackground from '../components/AuroraBackground'
import IconoWhatsApp from '../components/IconoWhatsApp'
import heroArt from '../assets/hero-nathalia.svg'
import CarruselClientas from '../components/CarruselClientas'
import PanelClientas from '../components/PanelClientas'
import {
  cargarContenido,
  guardarContenido,
  suscribirseContenido,
  actualizarCampo,
  esAdmin,
  ESTILOS_DESTACADOS,
  FORMAS_DESTACADOS,
} from '../utils/contenido'
import EditableTexto from '../components/EditableTexto'
import { formatMoney } from '../utils/format'
import { construirMensajeProducto, abrirWhatsApp } from '../utils/whatsapp'

// Íconos usados por las secciones editables (se guardan como string en el
// contenido para poder editarlas con lápiz desde la página).
const ICONOS = {
  sparkle: Sparkles,
  palette: Palette,
  gem: Gem,
  truck: Truck,
  shield: ShieldCheck,
  heart: Heart,
  crown: Crown,
  badge: BadgeCheck,
  clock: Clock,
  bag: ShoppingBag,
}

// Carrusel de imágenes de fondo del hero: cruza con fade y avanza solo.
// Si solo hay una imagen, se muestra estática (igual que antes).
function HeroFondos({ imagenes, auto = 6000 }) {
  const lista = (imagenes || []).filter(Boolean)
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)

  useEffect(() => {
    if (lista.length <= 1 || pausado) return
    const id = setInterval(() => setIndice((i) => (i + 1) % lista.length), auto)
    return () => clearInterval(id)
  }, [lista.length, pausado, auto])

  if (lista.length === 0) return null

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {lista.map((img, i) => (
        <img
          key={i}
          src={img}
          alt=""
          aria-hidden="true"
          draggable="false"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-out ${i === indice ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      {lista.length > 1 && (
        <div
          className="absolute bottom-5 right-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          {lista.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Imagen ${i + 1}`}
              onClick={() => setIndice(i)}
              className={`rounded-full transition-all ${i === indice ? 'w-5 h-2 bg-gold' : 'w-2 h-2 bg-white/60 hover:bg-white'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Landing({ dentroCliente = false }) {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [heroEditando, setHeroEditando] = useState(false)
  const [destEditando, setDestEditando] = useState(false)
  const heroPanelRef = useClampAlViewport(heroEditando)
  const destPanelRef = useClampAlViewport(destEditando)
  const [panelClientas, setPanelClientas] = useState(false)
  const [contenido, setContenido] = useState(() => cargarContenido())
  const soyAdmin = esAdmin()

  // Si el visitante es admin, TODO es editable de inmediato (sin botón de modo).
  const esEdicion = soyAdmin

  function editar(clave, valor) {
    setContenido((prev) => {
      const nuevo = actualizarCampo(prev, clave, valor)
      guardarContenido(nuevo)
      return nuevo
    })
  }

  const presentacionAleatoria = () => {
    const estilo = ESTILOS_DESTACADOS[Math.floor(Math.random() * ESTILOS_DESTACADOS.length)].id
    const forma = FORMAS_DESTACADOS[Math.floor(Math.random() * FORMAS_DESTACADOS.length)].id
    editar('destacadosEstilo', estilo)
    editar('destacadosForma', forma)
    toast.success('🎲 Presentación al azar aplicada')
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => suscribirseContenido((nuevo) => setContenido(nuevo)), [])

  const irANosotros = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const enlaces = ['Productos', 'Colecciones', 'Cómo comprar']
  const irAEnlace = (label) => {
    const mapa = { Productos: 'productos', Colecciones: 'colecciones', 'Cómo comprar': 'como-comprar' }
    irANosotros(mapa[label])
  }
  const productosDestacados = contenido.productos.slice(0, 4)

  // Imágenes de fondo del hero: usan el carrusel nuevo (banners); si solo
  // existe la portada antigua (banner), se muestra como imagen única.
  const imagenesPortada = (contenido.banners && contenido.banners.length)
    ? contenido.banners
    : (contenido.banner ? [contenido.banner] : [])
  const hayBanner = imagenesPortada.length > 0

  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-accent/20">
      {/* ── NAVBAR ─────────────────────────────── */}
      {!dentroCliente && (<nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass shadow-lg py-2.5' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <EditorInSitu esEdicion={esEdicion} titulo="Personalizar marca" ancho="w-80 sm:w-[22rem]" botonPosicion="-top-1 -right-1" edicion={<PanelMarca />}>
            <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2" aria-label="Inicio Beauty Esme">
              <LogoNathalia size={40} config={contenido.logo} esEdicion={esEdicion} onCambiar={editar} />
            </button>
          </EditorInSitu>

          <div className="hidden md:flex items-center gap-8">
            {enlaces.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => irAEnlace(label)}
                className="text-sm text-ink-2 hover:text-ink font-medium transition"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <button type="button" onClick={() => navigate('/cliente/catalogo')} className="btn btn-primary btn-md btn-shine">
              Ir a la tienda <ArrowRight size={15} />
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="p-2 text-ink-2 hover:text-ink transition"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Menú"
            >
              {menuAbierto ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menuAbierto && (
          <div className="md:hidden glass border-t border-line px-4 py-4 flex flex-col gap-1">
            {enlaces.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => { setMenuAbierto(false); irAEnlace(label) }}
                className="text-sm text-ink-2 hover:text-ink transition py-2.5 text-left"
              >
                {label}
              </button>
            ))}
            <div className="flex gap-2 pt-2 mt-2 border-t border-line">
              <button type="button" onClick={() => { setMenuAbierto(false); navigate('/cliente') }} className="btn btn-primary btn-md flex-1">
                Ir a la tienda
              </button>
            </div>
          </div>
        )}

      </nav>)}

      {/* ── HERO ───────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {hayBanner && (
          <HeroFondos imagenes={imagenesPortada} />
        )}
        {esEdicion && (
          <>
            <button
              type="button"
              onClick={() => setHeroEditando((a) => !a)}
              className={`absolute top-24 right-5 z-30 w-9 h-9 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition ${heroEditando ? 'rotate-90' : ''}`}
              title={heroEditando ? 'Cerrar edición de portada' : 'Editar portada y marca'}
              aria-label="Editar portada y marca"
            >
              {heroEditando ? <X size={15} /> : <Pencil size={15} />}
            </button>
            {heroEditando && (
              <div
                ref={heroPanelRef}
                className="absolute top-[7.5rem] right-5 z-40 w-80 max-h-[75vh] overflow-y-auto card rounded-xl shadow-2xl p-3.5 space-y-3 anim-pop"
              >
                <p className="text-[10px] uppercase tracking-widest text-accent font-semibold">
                  Portada y marca
                </p>
                <PanelMarca />
              </div>
            )}
          </>
        )}
        {!hayBanner && (
          <div className="hero-ring" aria-hidden="true" />
        )}
        <div className="absolute inset-0" aria-hidden="true">
          <AuroraBackground intensidad={hayBanner ? 0.35 : 1} />
        </div>
        <img
          src={heroArt}
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-[46%] max-w-md opacity-[0.14] pointer-events-none select-none mix-blend-plus-lighter"
        />
        {hayBanner && (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, var(--bg) 0%, transparent 55%, var(--bg) 100%)' }} />
        )}

        {/* Destellos flotantes ✨ */}
        {!hayBanner && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {[
              { e: '✨', top: '16%', left: '14%', d: '0s' },
              { e: '💄', top: '26%', left: '86%', d: '1.2s' },
              { e: '👗', top: '70%', left: '8%', d: '2.2s' },
              { e: '👜', top: '78%', left: '90%', d: '0.7s' },
              { e: '👑', top: '12%', left: '62%', d: '1.7s' },
              { e: '✨', top: '64%', left: '72%', d: '2.9s' },
            ].map((s, i) => (
              <span
                key={i}
                className="sparkle absolute text-2xl sm:text-3xl drop-shadow"
                style={{ top: s.top, left: s.left, animationDelay: s.d }}
              >
                {s.e}
              </span>
            ))}
          </div>
        )}

        {/* Tarjetas flotantes */}
        {!hayBanner && (
          <div className="absolute inset-0 hidden lg:block pointer-events-none" aria-hidden="true">
            {contenido.flotantes.map((f, i) => (
              <div
                key={i}
                className={`float-soft absolute pointer-events-auto ${esEdicion ? 'z-30' : ''}`}
                style={{ top: f.top, left: f.left, animationDelay: f.delay }}
              >
                <EditorInSitu
                  esEdicion={esEdicion}
                  titulo="Editar tarjeta"
                  botonPosicion="-top-2 right-0"
                  ancho="w-64"
                  envoltura="relative inline-block"
                  edicion={<EditarFlotante flotante={f} ruta={`flotantes.${i}`} onCambio={editar} />}
                >
                  <ImagenFlotante emoji={f.emoji} titulo={f.titulo} precio={f.precio} badge={f.badge} />
                </EditorInSitu>
              </div>
            ))}
          </div>
        )}

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-7">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-gold pulse-ring"></span>
              <span className="relative inline-flex w-2 h-2 rounded-full bg-gold"></span>
            </span>
            <span className="text-xs font-medium text-ink-2">
              <EditableTexto valor={contenido.heroBadge} clave="heroBadge" onCambio={editar} esEdicion={esEdicion} />
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            <EditableTexto valor={contenido.heroTitulo1} clave="heroTitulo1" onCambio={editar} esEdicion={esEdicion} />
            <br />
            <EditableTexto valor={contenido.heroTitulo2} clave="heroTitulo2" onCambio={editar} esEdicion={esEdicion} clase="text-gradient" />
            <span className="text-gradient">.</span>
          </h1>

          <p className="text-base sm:text-lg text-ink-2 mb-10 max-w-2xl mx-auto leading-relaxed">
            <EditableTexto valor={contenido.heroTexto} clave="heroTexto" onCambio={editar} esEdicion={esEdicion} multilinea />
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button type="button" onClick={() => navigate('/cliente/catalogo')} className="btn btn-primary btn-lg btn-shine">
              <EditableTexto valor={contenido.heroCta} clave="heroCta" onCambio={editar} esEdicion={esEdicion} /> <ArrowRight size={17} />
            </button>
            <button type="button" onClick={() => irANosotros('colecciones')} className="btn btn-ghost btn-lg">
              <EditableTexto valor={contenido.heroCta2} clave="heroCta2" onCambio={editar} esEdicion={esEdicion} />
            </button>
          </div>

          {/* Prueba social */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <div className="flex -space-x-3">
              {['#F6A', '#9C6', '#C77', '#E9C'].map((c, i) => (
                <span
                  key={i}
                  className="w-9 h-9 rounded-full ring-2 ring-bg flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${c}, #A65E80)` }}
                >
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex gap-0.5 text-gold-soft">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} fill="currentColor" strokeWidth={0} />)}
              </span>
              <span className="text-sm text-ink-3"><strong className="text-ink-2">1.000+</strong> clientas felices</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-ink-3">
          <ChevronDown size={26} />
        </div>
      </section>

      {/* ── CINTA MARQUEE ──────────────────────── */}
      <div className="border-y border-line bg-bg-soft/60 py-3 overflow-hidden">
        <div className="marquee-track">
          {[...contenido.marquee, ...contenido.marquee].map((item, i) => (
            <span key={i} className="flex items-center gap-2.5 mx-6 text-sm font-medium text-ink-2 whitespace-nowrap">
              {(() => { const Ico = ICONOS[item.icono] || Heart; return <Ico size={16} className="text-accent" /> })()}
              <EditableTexto valor={item.texto} clave={`marquee.${i % contenido.marquee.length}.texto`} onCambio={editar} esEdicion={esEdicion} />
              <span className="text-gold mx-1">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── ESTADÍSTICAS ───────────────────────── */}
      <section className="py-14 sm:py-20">
        <FadeIn>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {contenido.estadisticas.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2.5">
                <span className="w-11 h-11 rounded-2xl bg-accent-light flex items-center justify-center">
                  {(() => { const Ico = ICONOS[item.icono] || Heart; return <Ico size={20} className="text-accent" /> })()}
                </span>
                <span className="font-display text-3xl sm:text-4xl font-bold text-gold">
                  <EditableTexto valor={item.numero} clave={`estadisticas.${i}.numero`} onCambio={editar} esEdicion={esEdicion} />
                </span>
                <span className="text-xs sm:text-sm text-ink-3">
                  <EditableTexto valor={item.label} clave={`estadisticas.${i}.label`} onCambio={editar} esEdicion={esEdicion} />
                </span>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── POR QUÉ ELEGIRNOS ──────────────────── */}
      <section id="nosotros" className="py-14 sm:py-24 bg-bg-soft/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-16">
              <span className="kicker">
                <EditableTexto valor={contenido.nosotrosTitulo} clave="nosotrosTitulo" onCambio={editar} esEdicion={esEdicion} />
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold mt-3 tracking-tight">
                <EditableTexto valor={contenido.nosotrosSubtitulo} clave="nosotrosSubtitulo" onCambio={editar} esEdicion={esEdicion} />
              </h2>
              <div className="w-20 h-px bg-gold/50 mx-auto mt-5" />
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {contenido.caracteristicas.map((item, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="card card-hover p-6 h-full group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-soft/30 to-blush flex items-center justify-center mb-4 group-hover:from-accent-soft/50 transition">
                    {(() => { const Ico = ICONOS[item.icono] || Sparkles; return <Ico size={22} className="text-accent" /> })()}
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-1.5 group-hover:text-accent transition">
                    <EditableTexto valor={item.titulo} clave={`caracteristicas.${i}.titulo`} onCambio={editar} esEdicion={esEdicion} />
                  </h3>
                  <p className="text-sm text-ink-3 leading-relaxed">
                    <EditableTexto valor={item.descripcion} clave={`caracteristicas.${i}.descripcion`} onCambio={editar} esEdicion={esEdicion} multilinea />
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLECCIONES ────────────────────────── */}
      <section id="colecciones" className="py-14 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-14">
              <div>
                <span className="kicker">
                  <EditableTexto valor={contenido.coleccionesKicker} clave="coleccionesKicker" onCambio={editar} esEdicion={esEdicion} />
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 tracking-tight">
                  <EditableTexto valor={contenido.catalogoTitulo} clave="catalogoTitulo" onCambio={editar} esEdicion={esEdicion} />
                </h2>
                <p className="text-ink-3 mt-2 max-w-md">
                  <EditableTexto valor={contenido.catalogoSubtitulo} clave="catalogoSubtitulo" onCambio={editar} esEdicion={esEdicion} multilinea />
                </p>
              </div>
              <button type="button" onClick={() => navigate('/cliente/catalogo')} className="btn btn-ghost btn-md self-start sm:self-auto">
                <EditableTexto valor={contenido.explorarTodo} clave="explorarTodo" onCambio={editar} esEdicion={esEdicion} /> <ArrowRight size={15} />
              </button>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {contenido.colecciones.map((col, i) => (
              <FadeIn key={col.id} delay={i * 0.08}>
                <button
                  type="button"
                  onClick={() => navigate(`/cliente/catalogo?seccion=${col.id}`)}
                  className="card card-hover card-gradient card-shine relative overflow-hidden p-8 text-center w-full h-full group"
                >
                  <span className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-accent-light opacity-60 blur-2xl group-hover:opacity-100 transition" />
                  <span className="text-5xl block mb-4 drop-shadow-sm">{col.emoji}</span>
                  <h3 className="font-display text-2xl font-semibold mb-2 group-hover:text-accent transition">{col.label}</h3>
                  <span className="inline-flex items-center gap-1.5 text-sm text-accent font-medium">
                    Ver colección <ArrowRight size={15} />
                  </span>
                </button>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTOS DESTACADOS ───────────────── */}
      <section id="productos" className="py-14 sm:py-24 bg-bg-soft/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="relative text-center mb-12 sm:mb-16">
              {esEdicion && (
                <>
                  <button
                    type="button"
                    onClick={() => setDestEditando((a) => !a)}
                    className={`absolute top-0 right-0 z-30 w-9 h-9 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition ${destEditando ? 'rotate-90' : ''}`}
                    title={destEditando ? 'Cerrar presentación' : 'Personalizar presentación de productos'}
                    aria-label="Personalizar presentación de productos"
                  >
                    {destEditando ? <X size={15} /> : <Pencil size={15} />}
                  </button>
                  {destEditando && (
                    <div
                      ref={destPanelRef}
                      className="absolute top-12 right-0 z-40 w-72 card rounded-xl shadow-2xl p-3.5 space-y-3 anim-pop text-left"
                    >
                      <p className="text-[10px] uppercase tracking-widest text-accent font-semibold">
                        Presentación de productos
                      </p>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-ink-3 mb-1">Diseño</span>
                        <div className="flex flex-wrap gap-1.5">
                          {ESTILOS_DESTACADOS.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => editar('destacadosEstilo', s.id)}
                              className={`h-7 px-2.5 rounded-full text-[11px] font-medium transition border ${
                                contenido.destacadosEstilo === s.id
                                  ? 'bg-accent text-white border-accent'
                                  : 'bg-surface text-ink-2 border-line hover:border-accent'
                              }`}
                            >
                              {s.emoji} {s.nombre}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-ink-3 mb-1">Tarjeta</span>
                        <div className="flex flex-wrap gap-1.5">
                          {FORMAS_DESTACADOS.map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => editar('destacadosForma', f.id)}
                              className={`h-7 px-2.5 rounded-full text-[11px] font-medium transition border ${
                                contenido.destacadosForma === f.id
                                  ? 'bg-accent text-white border-accent'
                                  : 'bg-surface text-ink-2 border-line hover:border-accent'
                              }`}
                            >
                              {f.emoji} {f.nombre}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={presentacionAleatoria}
                        className="w-full h-8 rounded-lg bg-gold/10 text-gold border border-gold/30 text-[11px] font-semibold hover:bg-gold hover:text-white transition flex items-center justify-center gap-1.5"
                      >
                        <Dices size={13} /> Distribución al azar
                      </button>
                      <p className="text-[10px] text-ink-3">
                        Cada producto también tiene su propio lápiz para editar nombre, precio, descripción e imagen.
                      </p>
                    </div>
                  )}
                </>
              )}
              <span className="kicker justify-center">
                <EditableTexto valor={contenido.destacadosKicker} clave="destacadosKicker" onCambio={editar} esEdicion={esEdicion} />
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold mt-3 tracking-tight">
                <EditableTexto valor={contenido.destacadosTitulo} clave="destacadosTitulo" onCambio={editar} esEdicion={esEdicion} />
              </h2>
              <div className="w-20 h-px bg-gold/50 mx-auto mt-5" />
            </div>
          </FadeIn>

          {contenido.destacadosEstilo === 'vitrina' ? (
            <VitrinaDestacados
              productos={productosDestacados}
              esEdicion={esEdicion}
              onEditar={editar}
              onIr={() => navigate('/cliente/catalogo')}
              telefono={contenido.telefonoWhatsApp}
            />
          ) : contenido.destacadosEstilo === 'carrusel' ? (
            <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-px-4 px-1 pb-3 -mx-1">
              {productosDestacados.map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.05} className="snap-start shrink-0 w-64 sm:w-72">
                  <TarjetaProducto p={p} i={i} forma={contenido.destacadosForma} esEdicion={esEdicion} onEditar={editar} onIr={() => navigate('/cliente/catalogo')} />
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className={`grid grid-cols-2 ${contenido.destacadosEstilo === 'amplio' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4 sm:gap-6`}>
              {productosDestacados.map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.06}>
                  <TarjetaProducto p={p} i={i} forma={contenido.destacadosForma} esEdicion={esEdicion} onEditar={editar} onIr={() => navigate('/cliente/catalogo')} />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CÓMO COMPRAR ───────────────────────── */}
      <section id="como-comprar" className="py-14 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-16">
              <span className="kicker justify-center">
                <EditableTexto valor={contenido.procesoKicker} clave="procesoKicker" onCambio={editar} esEdicion={esEdicion} />
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold mt-3 tracking-tight">
                <EditableTexto valor={contenido.procesoTitulo} clave="procesoTitulo" onCambio={editar} esEdicion={esEdicion} />
              </h2>
              <p className="text-ink-3 mt-3 max-w-xl mx-auto">
                <EditableTexto valor={contenido.procesoSubtitulo} clave="procesoSubtitulo" onCambio={editar} esEdicion={esEdicion} multilinea />
              </p>
              <div className="w-20 h-px bg-gold/50 mx-auto mt-5" />
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            {contenido.pasos.map((paso, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center relative group">
                  <div className="relative z-10 w-20 h-20 rounded-full card flex items-center justify-center mb-5 transition-transform duration-300 group-hover:-translate-y-1.5">
                    {(() => { const Ico = ICONOS[paso.icono] || Heart; return <Ico size={26} className="text-accent" /> })()}
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-gold-soft to-gold text-[10px] font-bold text-[#3A2028] flex items-center justify-center font-mono">
                      <EditableTexto valor={paso.numero} clave={`pasos.${i}.numero`} onCambio={editar} esEdicion={esEdicion} />
                    </span>
                  </div>
                  <span className="font-mono text-xs text-gold mb-1.5">
                    <EditableTexto valor={paso.numero} clave={`pasos.${i}.numero`} onCambio={editar} esEdicion={esEdicion} />
                  </span>
                  <h3 className="font-display font-semibold mb-1.5">
                    <EditableTexto valor={paso.titulo} clave={`pasos.${i}.titulo`} onCambio={editar} esEdicion={esEdicion} />
                  </h3>
                  <p className="text-xs text-ink-3 leading-relaxed max-w-[220px]">
                    <EditableTexto valor={paso.descripcion} clave={`pasos.${i}.descripcion`} onCambio={editar} esEdicion={esEdicion} multilinea />
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ────────────────────────── */}
      <section id="testimonios" className="py-14 sm:py-24 bg-bg-soft/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-16">
              <span className="kicker justify-center">
                <EditableTexto valor={contenido.testimoniosKicker} clave="testimoniosKicker" onCambio={editar} esEdicion={esEdicion} />
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold mt-3 tracking-tight">
                <EditableTexto valor={contenido.testimoniosTitulo} clave="testimoniosTitulo" onCambio={editar} esEdicion={esEdicion} />
              </h2>
              <div className="w-20 h-px bg-gold/50 mx-auto mt-5" />
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {contenido.testimonios.map((t, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <figure className="card card-hover p-6 h-full flex flex-col">
                  <span className="flex gap-0.5 text-gold-soft mb-4">
                    {Array.from({ length: t.nota }).map((_, s) => <Star key={s} size={16} fill="currentColor" strokeWidth={0} />)}
                  </span>
                  <blockquote className="text-sm text-ink-2 leading-relaxed flex-1">
                    "<EditableTexto valor={t.texto} clave={`testimonios.${i}.texto`} onCambio={editar} esEdicion={esEdicion} multilinea />"
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-soft to-accent text-white text-sm font-bold flex items-center justify-center">
                      {t.nombre.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        <EditableTexto valor={t.nombre} clave={`testimonios.${i}.nombre`} onCambio={editar} esEdicion={esEdicion} />
                      </span>
                      <span className="block text-xs text-ink-3">
                        <EditableTexto valor={t.rol} clave={`testimonios.${i}.rol`} onCambio={editar} esEdicion={esEdicion} />
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLIENTAS EN ACCIÓN ──────────────────── */}
      {contenido.clientasActivo !== false && contenido.clientas && contenido.clientas.length > 0 && (
        <CarruselClientas
          slides={contenido.clientas}
          auto={contenido.clientasAuto}
          esEdicion={esEdicion}
          onEditar={() => setPanelClientas(true)}
          contenido={contenido}
          onCambio={editar}
        />
      )}

      {/* ── CTA FINAL ──────────────────────────── */}
      <section className="py-16 sm:py-28">
        <FadeIn>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-[2rem] p-10 sm:p-16 text-center bg-gradient-to-br from-inverse to-[#2A1521] shadow-lg">
              <AuroraBackground intensidad={0.8} />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
                  <Crown size={14} className="text-gold-light" />
                  <span className="text-xs text-ink-inverse-2">
                    <EditableTexto valor={contenido.ctaBadge} clave="ctaBadge" onCambio={editar} esEdicion={esEdicion} />
                  </span>
                </span>
                <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink-inverse mb-5">
                  <EditableTexto valor={contenido.ctaFinalTitulo1} clave="ctaFinalTitulo1" onCambio={editar} esEdicion={esEdicion} />{' '}
                  <EditableTexto valor={contenido.ctaFinalTitulo2} clave="ctaFinalTitulo2" onCambio={editar} esEdicion={esEdicion} clase="text-gradient" />?
                </h2>
                <p className="text-ink-inverse-2 mb-9 max-w-xl mx-auto">
                  <EditableTexto valor={contenido.ctaFinalTexto} clave="ctaFinalTexto" onCambio={editar} esEdicion={esEdicion} multilinea />
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <button type="button" onClick={() => navigate('/cliente/catalogo')} className="btn btn-gold btn-lg btn-shine">
                    <EditableTexto valor={contenido.explorarTienda} clave="explorarTienda" onCambio={editar} esEdicion={esEdicion} /> <ArrowRight size={17} />
                  </button>
                  <button type="button" onClick={() => navigate('/cliente/pedidos')} className="btn btn-lg bg-[#25D366] text-white border-0 hover:bg-[#1DAB54] shadow-lg shadow-[#25D366]/25 inline-flex items-center gap-2">
                    <IconoWhatsApp className="w-4 h-4" />
                    <EditableTexto valor={contenido.pedidosWhatsApp} clave="pedidosWhatsApp" onCambio={editar} esEdicion={esEdicion} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ─────────────────────────────── */}
      {!dentroCliente && (<footer className="border-t border-line bg-bg-soft/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <LogoNathalia size={40} config={contenido.logo} esEdicion={esEdicion} onCambiar={editar} />
              <p className="text-sm text-ink-3 leading-relaxed mt-4 max-w-xs">
                <EditableTexto valor={contenido.footerDescripcion} clave="footerDescripcion" onCambio={editar} esEdicion={esEdicion} multilinea />
              </p>
              <div className="flex gap-3 mt-5">
                {[
                  {
                    camino: 'M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.06-.69a1.06 1.06 0 1 1 0 2.12 1.06 1.06 0 0 1 0-2.12Z',
                    label: 'Instagram',
                  },
                  {
                    camino: 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z',
                    label: 'Facebook',
                  },
                  {
                    camino: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84-8.16-10.66h6.83l4.72 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z',
                    label: 'X',
                  },
                ].map(({ camino, label }) => (
                  <button
                    key={label}
                    type="button"
                    className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink-2 hover:text-white hover:bg-accent hover:border-accent transition"
                    aria-label={label}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={camino} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">
              <EditableTexto valor={contenido.footerColProductos} clave="footerColProductos" onCambio={editar} esEdicion={esEdicion} />
            </h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Ropa', seccion: 'ropa' },
                  { label: 'Maquillaje', seccion: 'maquillaje' },
                  { label: 'Accesorios', seccion: null },
                  { label: 'Cuidado personal', seccion: null },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => navigate(item.seccion ? `/cliente/catalogo?seccion=${item.seccion}` : '/cliente/catalogo')}
                      className="text-sm text-ink-3 hover:text-accent transition"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">
                <EditableTexto valor={contenido.footerColEmpresa} clave="footerColEmpresa" onCambio={editar} esEdicion={esEdicion} />
              </h4>
              <ul className="space-y-2.5">
                {['Sobre Beauty Esme', 'Marcas aliadas', 'Sostenibilidad', 'Contacto'].map((item, i) => (
                  <li key={i}>
                    <button type="button" className="text-sm text-ink-3 hover:text-accent transition">{item}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-semibold text-sm mb-4">
                <EditableTexto valor={contenido.footerColNewsletter} clave="footerColNewsletter" onCambio={editar} esEdicion={esEdicion} />
              </h4>
              <p className="text-sm text-ink-3 mb-3">
                <EditableTexto valor={contenido.footerNewsletterTexto} clave="footerNewsletterTexto" onCambio={editar} esEdicion={esEdicion} multilinea />
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  toast.success('¡Te has suscrito! 🎉')
                  e.currentTarget.reset()
                }}
                className="flex gap-2"
              >
                <input type="email" required placeholder="tucorreo@ejemplo.com" className="input" />
                <button type="submit" className="btn btn-primary btn-md shrink-0" aria-label="Suscribirme">
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>

          <div className="divider-gold" />
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-ink-3">
              <EditableTexto valor={contenido.copyright} clave="copyright" onCambio={editar} esEdicion={esEdicion} />
            </p>
            <div className="flex gap-6">
              {['Privacidad', 'Términos', 'Cookies'].map((item, i) => (
                <span key={i} className="text-xs text-ink-3 hover:text-accent cursor-pointer transition">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>)}

      {/* Panel admin: carrusel de clientas */}
      {esEdicion && panelClientas && (
        <PanelClientas
          open={panelClientas}
          contenido={contenido}
          onClose={() => setPanelClientas(false)}
          onGuardar={(nuevo) => { guardarContenido(nuevo); setContenido(nuevo) }}
        />
      )}
    </div>
  )
}

function TarjetaProducto({ p, i, forma, esEdicion, onEditar, onIr }) {
  const fondoImagen = {
    clasica: 'bg-gradient-to-br from-blush to-accent-light/60',
    boutique: 'bg-gradient-to-br from-gold/25 via-blush to-accent-light/60',
    minimal: 'bg-bg-soft/60',
  }[forma] || 'bg-gradient-to-br from-blush to-accent-light/60'

  const tarjetaClase = {
    clasica: 'card card-hover group overflow-hidden h-full flex flex-col',
    boutique: 'card card-hover card-gradient group overflow-hidden h-full flex flex-col ring-1 ring-gold/30',
    minimal: 'card card-hover group overflow-hidden h-full flex flex-col bg-transparent border border-line',
  }[forma] || 'card card-hover group overflow-hidden h-full flex flex-col'

  return (
    <EditorInSitu
      esEdicion={esEdicion}
      titulo="Editar producto"
      botonPosicion="top-2 right-2"
      envoltura="relative block w-full h-full"
      edicion={<EditarProducto producto={p} ruta={`productos.${i}`} onCambio={onEditar} />}
    >
      <div className={tarjetaClase}>
        <div className={`relative aspect-square flex items-center justify-center ${fondoImagen}`}>
          {p.imagen ? (
            <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <span className="text-6xl drop-shadow-sm transition-transform duration-500 group-hover:scale-110">{p.emoji}</span>
          )}
          {p.badge && (
            <span className={`absolute top-3 left-3 badge ${forma === 'boutique' ? 'badge-gold' : 'badge-gold'}`}>{p.badge}</span>
          )}
          <button
            type="button"
            onClick={onIr}
            className={`absolute bottom-3 right-3 w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center transition-all ${forma === 'minimal' ? 'opacity-100' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}
            aria-label="Agregar"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
        <div className={`p-4 flex flex-col flex-1 ${forma === 'minimal' ? 'px-3 py-3.5' : ''}`}>
          <h4 className={`leading-snug mb-2 ${forma === 'boutique' ? 'font-display text-base font-semibold' : 'text-sm font-semibold'}`}>{p.nombre}</h4>
          <div className="mt-auto flex items-center justify-between">
            <div>
              {p.antes > 0 && (
                <span className="block text-[11px] text-ink-3 line-through">{formatMoney(p.antes)}</span>
              )}
              <span className={`${forma === 'boutique' ? 'text-sm font-bold text-gold' : 'text-sm font-bold text-accent'}`}>
                {formatMoney(p.precio)}
              </span>
            </div>
            <span className="badge badge-rose">{p.categoria}</span>
          </div>
        </div>
      </div>
    </EditorInSitu>
  )
}

/* ── VITRINA DE LUJO: PRODUCTO ESTRELLA + ACOMPAÑANTES ───────── */
function VitrinaDestacados({ productos, esEdicion, onEditar, onIr, telefono }) {
  const precioCompleto = (n) => '$' + Number(n || 0).toLocaleString('es-CO')
  if (!productos.length) return null

  const estrella = productos[0]
  const resto = productos.slice(1)
  const descuento = estrella.antes > estrella.precio
    ? Math.round(((estrella.antes - estrella.precio) / estrella.antes) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Spotlight: producto estrella de la semana */}
      <EditorInSitu
        esEdicion={esEdicion}
        titulo="Editar producto estrella"
        botonPosicion="top-3 right-3"
        envoltura="relative block w-full"
        edicion={<EditarProducto producto={estrella} ruta="productos.0" onCambio={onEditar} />}
      >
        <div className="relative card card-gradient card-shine overflow-hidden">
          <span className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-accent/25 blur-3xl pointer-events-none" aria-hidden="true" />
          <span className="absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-gold/20 blur-3xl pointer-events-none" aria-hidden="true" />
          <span className="absolute top-8 right-12 w-28 h-28 rounded-full border border-gold/30 pointer-events-none" aria-hidden="true" />
          <span className="absolute bottom-12 left-1/3 w-3 h-3 rounded-full bg-gold/50 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 grid lg:grid-cols-2 items-center gap-8 p-6 sm:p-10">
            {/* Imagen del producto */}
            <div className="relative">
              <div className="relative aspect-square lg:aspect-[4/5] max-h-[540px] mx-auto w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-gold/25 bg-gradient-to-br from-blush to-accent-light/60">
                {estrella.imagen ? (
                  <img src={estrella.imagen} alt={estrella.nombre} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[9rem] drop-shadow-sm">{estrella.emoji || '✨'}</span>
                )}
                {estrella.badge && <span className="absolute top-4 left-4 badge badge-gold">{estrella.badge}</span>}
                {descuento > 0 && <span className="absolute bottom-4 left-4 badge badge-rose">-{descuento}% OFF</span>}
              </div>
              <span className="hidden sm:flex absolute -bottom-4 -right-2 glass rounded-2xl px-4 py-2.5 shadow-lg items-center gap-2 anim-pop">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-soft to-accent text-white flex items-center justify-center">
                  <ShoppingBag size={16} />
                </span>
                <span className="text-xs">
                  <span className="block text-ink-3">Desde</span>
                  <span className="block font-bold text-accent">{precioCompleto(estrella.precio)}</span>
                </span>
              </span>
            </div>

            {/* Información del producto estrella */}
            <div className="text-center lg:text-left">
              <span className="kicker justify-center lg:justify-start"><Sparkles size={12} /> Producto estrella de la semana</span>
              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 leading-tight">{estrella.nombre}</h3>
              <p className="text-ink-3 text-sm sm:text-base mt-3 max-w-md mx-auto lg:mx-0 leading-relaxed">
                {estrella.desc || 'Una pieza que no puede faltar en tu colección: estilo, calidad y un detalle pensado para ti.'}
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-3 mt-5">
                <span className="font-display text-2xl sm:text-3xl font-bold text-accent">{precioCompleto(estrella.precio)}</span>
                {estrella.antes > estrella.precio && (
                  <span className="text-ink-3 line-through">{precioCompleto(estrella.antes)}</span>
                )}
                {descuento > 0 && <span className="badge badge-gold">-{descuento}%</span>}
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-7">
                <button
                  type="button"
                  onClick={() => abrirWhatsApp(construirMensajeProducto(estrella, 1), telefono)}
                  className="btn btn-lg bg-[#25D366] text-white border-0 hover:bg-[#1DAB54] shadow-lg shadow-[#25D366]/25"
                >
                  <IconoWhatsApp className="w-4 h-4" /> Comprar por WhatsApp
                </button>
                <button type="button" onClick={onIr} className="btn btn-ghost btn-lg">
                  Ver catálogo <ArrowRight size={16} />
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 mt-7 text-xs text-ink-2">
                <span className="flex items-center gap-1.5"><Truck size={14} className="text-accent" /> Envío en 24h</span>
                <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-accent" /> Calidad premium</span>
                <span className="flex items-center gap-1.5"><Star size={14} className="text-gold" fill="currentColor" /> Las más pedidas</span>
              </div>
            </div>
          </div>
        </div>
      </EditorInSitu>

      {/* Acompañantes en vitrina */}
      {resto.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {resto.map((p, k) => (
            <EditorInSitu
              key={p.id}
              esEdicion={esEdicion}
              titulo="Editar producto"
              botonPosicion="top-2 right-2"
              envoltura="relative block w-full h-full"
              edicion={<EditarProducto producto={p} ruta={`productos.${k + 1}`} onCambio={onEditar} />}
            >
              <div
                className="card card-hover card-gradient group overflow-hidden h-full flex flex-col cursor-pointer"
                onClick={onIr}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onIr() }}
              >
                <div className="relative aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-blush to-accent-light/60 overflow-hidden">
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <span className="text-6xl drop-shadow-sm transition-transform duration-500 group-hover:scale-110">{p.emoji}</span>
                  )}
                  <span className="absolute top-3 left-3 font-mono text-[10px] font-bold text-white bg-accent rounded-full px-2 py-0.5 shadow">
                    Nº {String(k + 2).padStart(2, '0')}
                  </span>
                  {p.badge && <span className="absolute top-3 right-3 badge badge-gold">{p.badge}</span>}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="text-sm font-semibold leading-snug">{p.nombre}</h4>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-sm font-bold text-gold">{formatMoney(p.precio)}</span>
                    <span className="flex items-center gap-1 text-accent text-xs font-medium">
                      Ver <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            </EditorInSitu>
          ))}
        </div>
      )}
    </div>
  )
}

function ImagenFlotante({ emoji, titulo, precio, badge = 'Bestseller' }) {
  return (
    <div className="glass rounded-2xl p-3 pr-4 flex items-center gap-3 shadow-lg">
      <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blush to-accent-light/70 flex items-center justify-center text-2xl">
        {emoji}
      </span>
      <span className="flex flex-col">
        <span className="text-xs font-semibold whitespace-nowrap">{titulo}</span>
        <span className="text-[11px] text-accent font-bold">{precio}</span>
      </span>
      {badge && <span className="badge badge-gold whitespace-nowrap">{badge}</span>}
    </div>
  )
}

export default Landing