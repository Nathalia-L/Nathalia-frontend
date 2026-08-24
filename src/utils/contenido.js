// Contenido editable de la página pública de Nathalia (moda, ropa, maquillaje).
// El panel admin edita estos campos (modo edición) y se guardan en localStorage
// (clave "nathalia_contenido"). El front usa estos valores con fallback a los
// defaults de la marca. Soporta edición de textos, subida de imágenes (data URL)
// y productos del catálogo.

const CONTENIDO_DEFAULT = {
  // Marca
  marca: 'Nathalia',
  eslogan: 'Moda & Belleza',

  // Landing
  banner: '', // imagen de fondo del hero (data URL) — opcional
  heroBadge: 'Belleza y estilo para ti',
  heroTitulo1: 'Descubre tu',
  heroTitulo2: 'lado más bello',
  heroTexto: 'Moda, maquillaje y accesorios seleccionados con amor, para que te sientas única en cada ocasión.',
  heroCta: 'Explorar catálogo',
  ctaFinalTitulo1: '¿Lista para',
  ctaFinalTitulo2: 'lucir increíble',
  ctaFinalTexto: 'Únete a cientos de personas que ya disfrutan del estilo Nathalia.',
  nosotrosTitulo: 'Por qué elegirnos',
  nosotrosSubtitulo: 'Cada detalle cuenta',
  procesoTitulo: 'Cómo comprar',
  procesoSubtitulo: 'Simple como un latido',
  footerDescripcion: 'Moda, maquillaje y accesorios con estilo propio, pensados para ti.',

  // Catálogo
  catalogoTitulo: 'Colección Nathalia',
  catalogoSubtitulo: 'Belleza, moda y accesorios pensados para ti',
  colecciones: [
    { id: 'maquillaje', label: 'Maquillaje', emoji: '💄' },
    { id: 'ropa', label: 'Ropa', emoji: '👗' },
    { id: 'accesorios', label: 'Accesorios', emoji: '👜' },
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
    { id: 9, nombre: 'Bolso de Mano Dorado', categoria: 'accesorios', precio: 159000, antes: 0, emoji: '👜', imagen: '', desc: 'Detalle elegante en dorado, ideal para noche.', stock: 10, badge: 'Top ventas' },
    { id: 10, nombre: 'Collar Perlas Nathalia', categoria: 'accesorios', precio: 69000, antes: 0, emoji: '📿', imagen: '', desc: 'Perlas elegantes que iluminan cualquier look.', stock: 40, badge: 'Nuevo' },
    { id: 11, nombre: 'Gafas de Sol Retro', categoria: 'accesorios', precio: 84000, antes: 0, emoji: '🕶️', imagen: '', desc: 'Estilo retro con protección UV400.', stock: 18, badge: '' },
    { id: 12, nombre: 'Zapatos Tacón Rosé', categoria: 'accesorios', precio: 199000, antes: 240000, emoji: '👠', imagen: '', desc: 'Tacón cómodo de 6cm, color rosé.', stock: 9, badge: 'Oferta' },
  ],
}

export function cargarContenido() {
  try {
    const guardado = JSON.parse(localStorage.getItem('nathalia_contenido'))
    return { ...CONTENIDO_DEFAULT, ...(guardado || {}) }
  } catch {
    return { ...CONTENIDO_DEFAULT }
  }
}

export function guardarContenido(contenido) {
  localStorage.setItem('nathalia_contenido', JSON.stringify(contenido))
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
