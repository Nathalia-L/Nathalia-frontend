// Contenido editable de la página pública de Nathalia (moda, ropa, maquillaje).
// El panel admin edita estos campos (modo edición) y se guardan en localStorage
// (clave "nathalia_contenido"). El front usa estos valores con fallback a los
// defaults de la marca. Soporta edición de textos, subida de imágenes (data URL)
// y productos del catálogo.

const CONTENIDO_DEFAULT = {
  // Marca
  marca: 'Nathalia',
  eslogan: 'Moda & Belleza',

  // Logo (se edita en vivo desde el panel de administrador)
  logo: {
    nombre: 'Nathalia',
    eslogan: 'Moda & Belleza',
    forma: 'anillo', // anillo | rombo | flor
    anilloDe: '#E9CD8A',
    anilloA: '#D4AF37',
    letra: '#C77A9C',
    fondoDe: '#3A1E2E',
    fondoA: '#1A0E13',
  },

  // Tema (sobreescribe los colores de marca; se aplican como CSS vars)
  tema: {
    fuente: 'nathalia',
    rose: '#B4517B',
    roseStrong: '#9C3F66',
    roseSoft: '#E9C3D4',
    roseLight: '#F6E0E9',
    blush: '#FAEFF4',
    gold: '#B8912C',
    goldLight: '#A87F1F',
    extra1: '#8E6BB6',
    extra2: '#5E9C8A',
    extra3: '#C77A9C',
    extra4: '#E9CD8A',
  },

  // Landing
  banner: '', // imagen de fondo del hero (data URL) — opcional (legado)
  banners: [], // carrusel de imágenes de fondo del hero (data URL o URL)
  heroBadge: 'Belleza y estilo para ti',
  heroTitulo1: 'Descubre tu',
  heroTitulo2: 'lado más bello',
  heroTexto: 'Moda, maquillaje y accesorios seleccionados con amor, para que te sientas única en cada ocasión.',
  heroCta: 'Explorar catálogo',
  heroCta2: 'Ver colecciones',
  explorarTodo: 'Explorar todo',
  ctaFinalTitulo1: '¿Lista para',
  ctaFinalTitulo2: 'lucir increíble',
  ctaFinalTexto: 'Únete a cientos de personas que ya disfrutan del estilo Nathalia.',
  ctaBadge: 'Únete al estilo Nathalia',
  explorarTienda: 'Explorar la tienda',
  pedidosWhatsApp: 'Mis pedidos por WhatsApp',
  nosotrosTitulo: 'Por qué elegirnos',
  nosotrosSubtitulo: 'Cada detalle cuenta',
  coleccionesKicker: 'Colecciones',
  destacadosKicker: 'Destacados',
  destacadosTitulo: 'Los favoritos de la temporada',
  procesoKicker: 'Cómo comprar',
  procesoTitulo: 'Cómo comprar',
  procesoSubtitulo: 'Simple como un latido',
  testimoniosKicker: 'Testimonios',
  testimoniosTitulo: 'Lo que dicen de nosotras',

  // Presentación de la sección de productos (se elige con el lápiz)
  destacadosEstilo: 'cuadricula', // cuadricula | amplio | carrusel
  destacadosForma: 'clasica', // clasica | boutique | minimal

  // Presentación de las tarjetas del catálogo (se elige con el lápiz)
  catalogoForma: 'vertical', // vertical | horizontal | boutique | minimal | editorial
  catalogoKicker: 'Tienda · Moda y Belleza',

  // Carrusel de imágenes del catálogo (editable desde el panel admin)
  carrusel: [], // [{ id, imagen, titulo, kicker, texto, cta, destino, posicion, overlay }]
  carruselAuto: 5000, // velocidad del auto (ms)
  carruselAltura: 'media', // baja | media | alta
  carruselMostrarTexto: true,

  // Carrusel de clientas en acción (inicio) — editable desde el panel admin
  clientas: [], // [{ id, imagen, titulo, texto }]
  clientasActivo: true,
  clientasAuto: 4500, // velocidad (ms)
  clientasKicker: 'En acción',
  clientasTitulo: 'Ellas ya lo lucen',

  // Carrusel de productos recomendados (catálogo) — editable desde el panel admin
  recomendadosActivo: true,
  recomendadosColeccion: '', // id de colección o '' para todas
  recomendadosAuto: 3500, // velocidad (ms)
  recomendadosTitulo: 'Tal vez te guste ✨',

  // Textos de la página de inicio del cliente (se editan con el lápiz)
  clienteBadge: 'Moda & Belleza',
  clienteTitulo: 'Bienvenida a Nathalia 💖',
  clienteTexto: 'Moda, maquillaje y accesorios seleccionados con amor, para que te sientas única en cada ocasión.',
  clienteCta1: 'Ir al catálogo',
  clienteCta2: 'Pedir por WhatsApp',
  clienteDestKicker: 'Del catálogo',
  clienteDestTitulo: 'Lo que está triunfando',
  clienteVerTodo: 'Ver todo',

  // Textos de Mis pedidos (se editan con el lápiz)
  pedidosKicker: 'Historial',
  pedidosTitulo: 'Mis pedidos',
  pedidosVacioTitulo: 'Aún no tienes pedidos',
  pedidosVacioTexto: 'Cuando compres en el catálogo, cada pedido y su estado aparecerán aquí.',
  pedidosExplorar: 'Explorar catálogo',

  // Botón de ayuda del catálogo ("¿No sabes qué elegir?")
  catalogoAyuda: '¿No sabes qué elegir?',
  ayudaPregunta1: '¿Qué te apetece hoy?',
  ayudaPregunta2: '¿Cuánto quieres gastar?',
  ayudaReiniciar: 'Empezar de nuevo',
  ayudaNada: '¿Nada te convence? Escríbenos 🤳',

  // Textos del Foro (se editan con el lápiz)
  foroKicker: 'Comunidad Nathalia',
  foroTitulo: 'Foro',
  foroSubtitulo: 'Calificaciones y opiniones reales de nuestros clientes.',
  foroVerOpiniones: 'Ver opiniones',
  foroCalificar: 'Calificar',
  foroCalificado: 'Calificado',
  foroSinCalif: 'Sin calificaciones aún',
  foroSePrimero: 'Sé la primera en opinar 💬',
  foroNecesitasCompra: 'Califica este producto después de recibir tu pedido 💖',
  foroNecesitasLogin: 'Completa una compra y al recibir tu producto podrás calificarlo.',
  foroOpinionesDe: 'Opiniones de',
  footerDescripcion: 'Moda, maquillaje y accesorios con estilo propio, pensados para ti.',
  footerColProductos: 'Productos',
  footerColEmpresa: 'Empresa',
  footerColNewsletter: 'Newsletter',
  footerNewsletterTexto: 'Recibe novedades y promociones exclusivas.',
  copyright: '© 2026 Nathalia. Todos los derechos reservados.',

  // Cinta y secciones de la página (x = index; se editan en el lugar con lápiz)
  marquee: [
    { icono: 'truck', texto: 'Envío en 24 horas' },
    { icono: 'badge', texto: 'Calidad premium certificada' },
    { icono: 'shield', texto: 'Pagos 100% seguros' },
    { icono: 'gem', texto: 'Marcas aliadas de confianza' },
    { icono: 'heart', texto: 'Pensado para tu estilo' },
    { icono: 'crown', texto: 'Programa de lealtad Nathalia' },
  ],
  estadisticas: [
    { numero: '1.000+', label: 'Clientas felices', icono: 'heart' },
    { numero: '15', label: 'Marcas aliadas', icono: 'gem' },
    { numero: '98%', label: 'Nos recomiendan', icono: 'badge' },
    { numero: '24h', label: 'De entrega', icono: 'clock' },
  ],
  caracteristicas: [
    { icono: 'sparkle', titulo: 'Belleza auténtica', descripcion: 'Maquillaje y cosmética que resaltan lo mejor de ti, con calidad certificada.' },
    { icono: 'palette', titulo: 'Moda con estilo', descripcion: 'Prendas y accesorios seleccionados para que cada look sea único.' },
    { icono: 'gem', titulo: 'Calidad premium', descripcion: 'Trabajamos con marcas que cuidan cada detalle de sus productos.' },
    { icono: 'truck', titulo: 'Entrega en 24 horas', descripcion: 'Procesamos tu pedido el mismo día y llega a tu puerta.' },
    { icono: 'shield', titulo: 'Compra segura', descripcion: 'Tus datos protegidos y pagos cifrados con los más altos estándares.' },
    { icono: 'heart', titulo: 'Hecho para ti', descripcion: 'Cada recomendación y detalle está pensado para acompañar tu estilo.' },
  ],
  pasos: [
    { numero: '01', icono: 'heart', titulo: 'Elige tu estilo', descripcion: 'Explora nuestra colección y escoge lo que más te gusta.' },
    { numero: '02', icono: 'bag', titulo: 'Haz tu pedido', descripcion: 'Agrega al carrito, personaliza tu compra y confirma.' },
    { numero: '03', icono: 'badge', titulo: 'Confirmamos', descripcion: 'Preparamos tu pedido con el mayor cuidado y cariño.' },
    { numero: '04', icono: 'truck', titulo: 'Lo recibes', descripcion: 'Tu pedido llega a tu puerta en menos de 24 horas.' },
  ],
  testimonios: [
    { nombre: 'Valentina R.', rol: 'Clienta Nathalia', texto: 'El labial es mi favorito, dura todo el día y el envío fue rapidísimo. ¡Me llega siempre a tiempo!', nota: 5 },
    { nombre: 'Mariana G.', rol: 'Clienta Nathalia', texto: 'El blazer beige es hermoso, la tela se siente premium. Ya compré dos veces y todo impecable.', nota: 5 },
    { nombre: 'Camila T.', rol: 'Clienta Nathalia', texto: 'Amo el programa de lealtad, ya soy nivel oro. La atención y calidad hacen que valga cada peso.', nota: 5 },
  ],

  // Tarjetas flotantes del hero (solo se ven sin imagen de portada)
  flotantes: [
    { emoji: '💄', titulo: 'Labial Mate Rosé', precio: '$45K', badge: 'Bestseller', top: '18%', left: '70%', delay: '0s' },
    { emoji: '👗', titulo: 'Vestido Floral', precio: '$139K', badge: 'Bestseller', top: '30%', left: '6%', delay: '1.6s' },
    { emoji: '👜', titulo: 'Bolso Dorado', precio: '$159K', badge: 'Bestseller', top: '58%', left: '64%', delay: '2.8s' },
    { emoji: '👠', titulo: 'Tacón Rosé', precio: '$199K', badge: 'Bestseller', top: '52%', left: '12%', delay: '1.1s' },
  ],

  // WhatsApp de la tienda (se edita desde el panel de administrador)
  telefonoWhatsApp: '573160935626',

  // Catálogo
  catalogoTitulo: 'Colección Nathalia',
  catalogoSubtitulo: 'Belleza, moda y accesorios pensados para ti',
  colecciones: [
    { id: 'maquillaje', label: 'Maquillaje', emoji: '💄' },
    { id: 'ropa', label: 'Ropa', emoji: '👗' },
  ],
  productos: [
    { id: 1, nombre: 'Labial Mate Rosé', categoria: 'maquillaje', precio: 45000, antes: 55000, emoji: '💄', imagen: '', desc: 'Labial de larga duración con acabado mate sedoso.', stock: 20, badge: 'Top ventas' },
    { id: 2, nombre: 'Paleta de Sombras Nude', categoria: 'maquillaje', precio: 89000, antes: 0, emoji: '🎨', imagen: '', desc: '12 tonos nude para un look natural o intenso.', stock: 15, badge: 'Nuevo' },
    { id: 3, nombre: 'Base Líquida Radiance', categoria: 'maquillaje', precio: 72000, antes: 0, emoji: '✨', imagen: '', desc: 'Cobertura media con acabado luminoso.', stock: 18, badge: '' },
    { id: 4, nombre: 'Rimel Volumen Extra', categoria: 'maquillaje', precio: 48000, antes: 60000, emoji: '👁️', imagen: '', desc: 'Pestañas voluminosas desde la primera pasada.', stock: 30, badge: 'Oferta' },
    { id: 5, nombre: 'Vestido Floral Verano', categoria: 'ropa', precio: 139000, antes: 0, emoji: '👗', imagen: '', desc: 'Corte fluido, estampado floral, tallas XS a L.', stock: 12, badge: 'Nuevo' },
    { id: 6, nombre: 'Blazer Oversize Beige', categoria: 'ropa', precio: 189000, antes: 0, emoji: '🧥', imagen: '', desc: 'Un básico elegante que combina con todo.', stock: 8, badge: 'Top ventas' },
    { id: 7, nombre: 'Camisa Seda Blanca', categoria: 'ropa', precio: 99000, antes: 0, emoji: '👚', imagen: '', desc: 'Seda suave, corte clásico, perfecta para oficina.', stock: 22, badge: '' },
    { id: 8, nombre: 'Jeans Mom Fit', categoria: 'ropa', precio: 119000, antes: 145000, emoji: '👖', imagen: '', desc: 'Corte relajado y cómodo, denim premium.', stock: 25, badge: 'Oferta' },
  ],
}

// Categorías activas por ahora: maquillaje y ropa.
export const CATEGORIAS_ACTIVAS = ['maquillaje', 'ropa']

// Opciones de presentación de la sección de productos destacados.
export const ESTILOS_DESTACADOS = [
  { id: 'cuadricula', nombre: 'Cuadrícula', emoji: '🔲' },
  { id: 'amplio', nombre: 'Amplio', emoji: '🖼️' },
  { id: 'carrusel', nombre: 'Carrusel', emoji: '🎠' },
  { id: 'vitrina', nombre: 'Vitrina', emoji: '✨' },
]

export const FORMAS_DESTACADOS = [
  { id: 'clasica', nombre: 'Clásica', emoji: '💐' },
  { id: 'boutique', nombre: 'Boutique', emoji: '🛍️' },
  { id: 'minimal', nombre: 'Minimal', emoji: '🤍' },
]

// Opciones de forma de las tarjetas del catálogo.
export const FORMAS_CATALOGO = [
  { id: 'vertical', nombre: 'Vertical', emoji: '🪞' },
  { id: 'horizontal', nombre: 'Horizontal', emoji: '🛍️' },
  { id: 'boutique', nombre: 'Boutique', emoji: '💖' },
  { id: 'minimal', nombre: 'Minimal', emoji: '🤍' },
  { id: 'editorial', nombre: 'Editorial', emoji: '📖' },
]

// Evento global: se dispara cada vez que se guarda contenido, para que las
// páginas abiertas (Landing, catálogo, navegación, logo) se actualicen en vivo.
const EVENTO_CONTENIDO = 'nathalia-contenido'

export function cargarContenido() {
  try {
    const guardado = JSON.parse(localStorage.getItem('nathalia_contenido'))
    const base = { ...CONTENIDO_DEFAULT, ...(guardado || {}) }
    base.logo = { ...CONTENIDO_DEFAULT.logo, ...(base.logo || {}) }
    base.tema = { ...CONTENIDO_DEFAULT.tema, ...(base.tema || {}) }
    base.colecciones = CATEGORIAS_ACTIVAS
      .map((id) => CONTENIDO_DEFAULT.colecciones.find((c) => c.id === id))
      .filter(Boolean)
    for (const lista of ['marquee', 'estadisticas', 'caracteristicas', 'pasos', 'testimonios', 'flotantes']) {
      if (!Array.isArray(base[lista]) || base[lista].length === 0) base[lista] = CONTENIDO_DEFAULT[lista]
    }
    base.productos = (base.productos || []).filter((p) => CATEGORIAS_ACTIVAS.includes(p.categoria))

    // Migración: número de WhatsApp actualizado a +57 316 093 5626.
    // Si el contenido guardado aún trae el número viejo, se reemplaza.
    const WH_NUEVO = CONTENIDO_DEFAULT.telefonoWhatsApp
    const WH_VIEJOS = ['573122073007', '3122073007']
    const whLimpio = String(base.telefonoWhatsApp || '').replace(/\D/g, '')
    if (WH_VIEJOS.includes(whLimpio)) base.telefonoWhatsApp = WH_NUEVO

    return base
  } catch {
    return { ...CONTENIDO_DEFAULT }
  }
}

export function guardarContenido(contenido) {
  localStorage.setItem('nathalia_contenido', JSON.stringify(contenido))
  window.dispatchEvent(new CustomEvent(EVENTO_CONTENIDO, { detail: cargarContenido() }))
}

// Actualiza un campo anidado (p. ej. "logo.nombre", "tema.rose",
// "caracteristicas.0.titulo" o "testimonios.1.texto") y devuelve el objeto
// nuevo sin mutar el original. El editor de Landing usa esto.
export function actualizarCampo(contenido, ruta, valor) {
  if (!ruta || !contenido) return contenido
  const partes = ruta.split('.')
  const clonar = (nodo, i) => {
    const clave = partes[i]
    const esUltimo = i === partes.length - 1
    if (esUltimo) return { ...nodo, [clave]: valor }
    const siguiente = nodo[clave]
    if (Array.isArray(siguiente)) {
      const indice = Number(partes[i + 1])
      return {
        ...nodo,
        [clave]: siguiente.map((item, k) => (k === indice ? clonar(item, i + 2) : item)),
      }
    }
    return { ...nodo, [clave]: clonar(siguiente || {}, i + 1) }
  }
  return clonar(contenido, 0)
}

export function suscribirseContenido(callback) {
  const escuchar = (e) => callback(e.detail)
  window.addEventListener(EVENTO_CONTENIDO, escuchar)
  return () => window.removeEventListener(EVENTO_CONTENIDO, escuchar)
}

export function limpiarContenido() {
  localStorage.removeItem('nathalia_contenido')
}

export function esAdmin() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return false
    const decoded = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return decoded.rol === 'admin' || decoded.rol === 'gerente'
  } catch {
    return false
  }
}

export default CONTENIDO_DEFAULT
