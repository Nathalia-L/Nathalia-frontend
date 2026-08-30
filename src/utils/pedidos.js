// Historial local de pedidos hechos por WhatsApp. Se muestran en "Mis pedidos".
// Al darle "Comprar": se guarda el pedido como pendiente y se abre el chat.

import { construirMensajePedido, abrirWhatsApp } from './whatsapp'

const CLAVE = 'nathalia_pedidos'

export function cargarPedidosLocales() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || []
  } catch {
    return []
  }
}

function guardarPedidosLocales(pedidos) {
  localStorage.setItem(CLAVE, JSON.stringify(pedidos))
}

function normalizarCantidad(l) {
  return l.cantidad || l.cant || 1
}

// Registra el pedido como "pendiente" y devuelve su objeto.
export function registrarPedidoWhatsApp(lineas, total) {
  const pedido = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    estado: 'pendiente',
    metodo: 'whatsapp',
    productos: lineas.map((l) => ({
      nombre: l.nombre,
      precio: l.precio || 0,
      cantidad: normalizarCantidad(l),
      emoji: l.emoji || '✨',
    })),
    total: total || 0,
  }
  guardarPedidosLocales([pedido, ...cargarPedidosLocales()])
  return pedido
}

// Reabre el chat de WhatsApp con el contenido de un pedido guardado.
export function reabrirPedidoWhatsApp(pedido, numero) {
  const texto = construirMensajePedido(
    pedido.productos,
    Number(pedido.total) || 0
  )
  abrirWhatsApp(texto, numero)
}

export function eliminarPedidoLocal(id) {
  guardarPedidosLocales(cargarPedidosLocales().filter((p) => p.id !== id))
}