import { useNavigate } from 'react-router-dom'
import { cargarContenido } from '../utils/contenido'
import { useEdicion } from '../hooks/useEdicion'
import EditableTexto from '../components/EditableTexto'
import { abrirWhatsApp } from '../utils/whatsapp'
import IconoWhatsApp from '../components/IconoWhatsApp'
import ImagenProducto from '../components/ImagenProducto'
import FadeIn from '../components/ui/FadeIn'
import AuroraBackground from '../components/AuroraBackground'

const CATEGORIAS = {
  maquillaje: { label: 'Maquillaje', emoji: '💄' },
  ropa: { label: 'Ropa', emoji: '👗' },
  accesorios: { label: 'Accesorios', emoji: '👜' },
}

function saludoSegunHora() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const VALORES = [
  {
    titulo: 'Productos originales',
    descripcion: 'Maquillaje, ropa y accesorios seleccionados con calidad verificada.',
    icono: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" /></svg>),
  },
  {
    titulo: 'Tendencia constante',
    descripcion: 'Novedades cada semana para que tu estilo nunca pase de moda.',
    icono: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" /><path d="M12 2l2.2 3.4L18 7l-3.6 1.4L12 12l-2.4-3.6L6 7l3.8-1.6L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>),
  },
  {
    titulo: 'Envío a todo el país',
    descripcion: 'Empacamos con amor; tu pedido llega en 24-72 horas.',
    icono: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 7h11v10H3V7zm11 3h4l3 3v4h-7v-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="7" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.6" /><circle cx="17" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.6" /></svg>),
  },
  {
    titulo: 'Precio justo',
    descripcion: 'Belleza de calidad a precios pensados para ti.',
    icono: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 6.5c0-1.9-2.2-3-5-3s-5 1.4-5 3 2.2 3 5 3 5 1.1 5 3-2.2 3-5 3-5-1.1-5-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>),
  },
]

const ACCESOS = [
  { to: '/cliente/pedidos', titulo: 'Mis pedidos' },
  { to: '/cliente/carrito', titulo: 'Mi carrito' },
]

function obtenerDestacados() {
  // Los productos destacados salen del contenido editable (como el catálogo),
  // intercalando las colecciones para mostrar variedad de la tienda.
  const contenido = cargarContenido()
  const productos = contenido.productos || []
  const porColeccion = {}
  for (const p of productos) {
    if (!porColeccion[p.categoria]) porColeccion[p.categoria] = []
    porColeccion[p.categoria].push(p)
  }
  const alternados = []
  const listas = Object.values(porColeccion)
  const maximo = Math.max(...listas.map((l) => l.length), 0)
  for (let i = 0; i < Math.min(4, maximo); i++) {
    for (const lista of listas) {
      if (lista[i] && alternados.length < 4) alternados.push(lista[i])
    }
  }
  return alternados
}

function ClienteInicio() {
  const navigate = useNavigate()
  const { contenido, editar, esEdicion } = useEdicion()
  const numeroWhatsApp = contenido.telefonoWhatsApp
  const destacados = obtenerDestacados()

  return (
    <div className="bg-bg">
      {/* HERO DE BIENVENIDA */}
      <section className="relative overflow-hidden min-h-[520px] flex items-end">
        <AuroraBackground />
        <div className="hero-ring" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-bg/60 via-transparent to-transparent"></div>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {[
            { e: '✨', top: '18%', left: '12%', d: '0s' },
            { e: '💄', top: '24%', left: '88%', d: '1.4s' },
            { e: '👗', top: '72%', left: '7%', d: '2.1s' },
            { e: '👜', top: '80%', left: '86%', d: '0.9s' },
            { e: '👑', top: '10%', left: '58%', d: '1.8s' },
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

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12 sm:pb-16 w-full">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
            <span className="text-xs text-ink-3 uppercase tracking-wide">
              {saludoSegunHora()} ·{' '}
              <EditableTexto clave="clienteBadge" valor={contenido.clienteBadge} onCambio={editar} esEdicion={esEdicion} />
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold leading-tight tracking-tight text-ink max-w-xl">
            <EditableTexto clave="clienteTitulo" valor={contenido.clienteTitulo} onCambio={editar} esEdicion={esEdicion} />
          </h1>
          <p className="text-ink-3 mt-4 max-w-md text-sm sm:text-base">
            <EditableTexto clave="clienteTexto" valor={contenido.clienteTexto} onCambio={editar} esEdicion={esEdicion} multilinea />
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate('/cliente/catalogo')}
              className="btn btn-primary btn-md btn-shine"
            >
              <EditableTexto clave="clienteCta1" valor={contenido.clienteCta1} onCambio={editar} esEdicion={esEdicion} />
            </button>
            <button
              type="button"
              onClick={() => abrirWhatsApp(`Hola 👋, me interesa conocer los productos de Beauty Esme y comprar por WhatsApp.`, numeroWhatsApp)}
              className="btn btn-md bg-[#25D366] text-white border-0 hover:bg-[#1DAB54] shadow-lg shadow-[#25D366]/25"
            >
              <IconoWhatsApp className="w-4 h-4" />
              <EditableTexto clave="clienteCta2" valor={contenido.clienteCta2} onCambio={editar} esEdicion={esEdicion} />
            </button>
          </div>
        </div>
      </section>

      {/* FRANJA DE VALORES */}
      <section className="border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4">
          {VALORES.map((v, i) => (
            <FadeIn key={v.titulo} delay={i * 0.1}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-accent bg-accent-light/40">
                  {v.icono}
                </div>
                <div>
                  <p className="text-ink text-sm font-medium">{v.titulo}</p>
                  <p className="text-ink-3 text-xs mt-0.5 leading-relaxed">{v.descripcion}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* DESTACADOS DEL CATÁLOGO */}
      <FadeIn>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <EditableTexto clave="clienteDestKicker" valor={contenido.clienteDestKicker} onCambio={editar} esEdicion={esEdicion} clase="kicker" />
              <h2 className="text-xl sm:text-2xl font-display font-bold text-ink mt-1">
                <EditableTexto clave="clienteDestTitulo" valor={contenido.clienteDestTitulo} onCambio={editar} esEdicion={esEdicion} />
              </h2>
            </div>
            <button type="button" onClick={() => navigate('/cliente/catalogo')} className="text-sm text-ink-2 hover:text-accent shrink-0">
              <EditableTexto clave="clienteVerTodo" valor={contenido.clienteVerTodo} onCambio={editar} esEdicion={esEdicion} /> →
            </button>
          </div>

        {destacados.length === 0 && (
          <div className="card p-8 rounded-2xl text-center">
            <p className="text-ink-3 text-sm">No se pudo cargar el catálogo por ahora.</p>
          </div>
        )}

        {destacados.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {destacados.map((p, i) => {
              const cat = CATEGORIAS[p.categoria] || { label: p.categoria || 'Beauty Esme', emoji: '✨' }
              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver ${p.nombre} en el catálogo`}
                  onClick={() => navigate(p.categoria === 'maquillaje' ? '/cliente/catalogo' : `/cliente/catalogo?seccion=${p.categoria}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(p.categoria === 'maquillaje' ? '/cliente/catalogo' : `/cliente/catalogo?seccion=${p.categoria}`) }}
                  style={{ animationDelay: `${i * 70}ms` }}
                  className="anim-pop card-hover group rounded-2xl overflow-hidden cursor-pointer"
                >
                  <div className="h-48 overflow-hidden">
                    {p.imagen ? (
                      <ImagenProducto src={p.imagen} alt={p.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blush to-accent-light/70 text-6xl">
                        {p.emoji || '✨'}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-medium text-accent uppercase tracking-wide">{cat.emoji} {cat.label}</p>
                    <p className="text-sm font-medium text-ink mt-0.5 line-clamp-2">{p.nombre}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-ink text-sm font-semibold">
                        ${Number(p.precio || 0).toLocaleString('es-CO')}
                        {p.antes > 0 && (
                          <span className="text-ink-3 font-normal text-xs line-through ml-1">${Number(p.antes).toLocaleString('es-CO')}</span>
                        )}
                      </p>
                      <span className="text-xs font-medium text-accent group-hover:underline">Ver →</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
      </FadeIn>

      {/* ACCESOS SECUNDARIOS */}
      <FadeIn>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="card overflow-hidden divide-y sm:divide-y-0 sm:divide-x sm:grid sm:grid-cols-3">
            {ACCESOS.map((a) => (
              <button
                type="button"
                key={a.to}
                onClick={() => navigate(a.to)}
                className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-accent-light/30 transition group"
              >
                <span className="text-sm font-medium text-ink">{a.titulo}</span>
                <span className="text-ink-3 group-hover:text-accent group-hover:translate-x-0.5 transition-all">→</span>
              </button>
            ))}
          </div>
        </section>
      </FadeIn>
    </div>
  )
}

export default ClienteInicio