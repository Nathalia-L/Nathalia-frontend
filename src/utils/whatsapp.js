// Pedidos por WhatsApp: al darle "Comprar", en lugar de un checkout en la
// página, se abre el chat del vendedor con el detalle (y emoji/imagen) de lo
// que el cliente quiere. La venta se cierra conversando ahí.

export const TEXTOS_PREDETERMINADOS = {
  saludo: 'Hola 👋, quiero comprar en Nathalia:',
  cierre: '¿Me ayudan a confirmarlo? 🙏',
}

export function formatearPrecio(n) {
  return '$' + Number(n || 0).toLocaleString('es-CO')
}

// Mensaje para comprar un producto específico (desde el catálogo).
export function construirMensajeProducto(p, cantidad = 1) {
  const lineas = [
    TEXTOS_PREDETERMINADOS.saludo,
    '',
    `${p.emoji || '✨'} ${p.nombre}`,
  ]
  if (p.desc) lineas.push(`📝 ${p.desc}`)
  lineas.push(`💰 ${formatearPrecio(p.precio)}`)
  if (p.antes > p.precio) lineas.push(`🏷️ Antes: ${formatearPrecio(p.antes)}`)
  lineas.push(`🔢 Cantidad: ${cantidad}`)
  lineas.push('', TEXTOS_PREDETERMINADOS.cierre)
  return lineas.join('\n')
}

// Mensaje con varias líneas del carrito.
export function construirMensajePedido(lineas, total) {
  const detalle = lineas.map((l, i) =>
    `${i + 1}. ${l.emoji || '✨'} ${l.nombre} × ${l.cantidad || l.cant || 1} — ${formatearPrecio((l.precio || 0) * (l.cantidad || l.cant || 1))}`
  )
  return [
    TEXTOS_PREDETERMINADOS.saludo,
    '',
    detalle.join('\n'),
    '',
    `💰 Total: ${formatearPrecio(total)}`,
    '',
    TEXTOS_PREDETERMINADOS.cierre,
  ].join('\n')
}

// Abre el chat de WhatsApp en una pestaña nueva. El número llega formateado
// como "573122073007" (sin el "+").
export function abrirWhatsApp(texto, numero = '573122073007') {
  const limpio = String(numero).replace(/[^\d]/g, '').replace(/^0+/, '')
  const url = `https://wa.me/${limpio}?text=${encodeURIComponent(texto)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}