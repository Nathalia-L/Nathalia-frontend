import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { API_URL } from "../config";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SkeletonRow } from '../components/ui/Skeleton';
import FadeIn from '../components/ui/FadeIn';
import OrderStepper from '../components/ui/OrderStepper';
import { useEdicion } from '../hooks/useEdicion'
import EditableTexto from '../components/EditableTexto'
import { cargarPedidosLocales, reabrirPedidoWhatsApp, eliminarPedidoLocal } from '../utils/pedidos'

const descargarFactura = async (id_pedido) => {
  try {
    // Genera la factura si no existe
    await fetch(`${API_URL}/api/facturas`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id_pedido })
    })

    // Obtiene la factura
    const res  = await fetch(`${API_URL}/api/facturas/${id_pedido}`)
    const json = await res.json()

    if (!json.ok) throw new Error(json.mensaje)

    const factura = json.data
    const doc     = new jsPDF()

    doc.setFontSize(20)
    doc.setTextColor(45, 90, 39)
    doc.text('FACTURA', 105, 20, { align: 'center' })

    doc.setFontSize(9)
    doc.setTextColor(100)
    doc.text(`N°: ${factura.numero_factura}`, 150, 30)
    doc.text(`Fecha: ${new Date(factura.fecha_emision).toLocaleDateString('es-CO')}`, 150, 35)

    doc.setFontSize(10)
    doc.setTextColor(0)
    doc.text('Datos del cliente', 15, 45)
    doc.setFontSize(9)
    doc.setTextColor(80)
    doc.text(`Nombre: ${factura.nombre_cliente} ${factura.apellido_cliente}`, 15, 52)
    doc.text(`Correo: ${factura.email_cliente}`,      15, 57)
    doc.text(`Ciudad: ${factura.ciudad_envio}`,       15, 62)
    doc.text(`Dirección: ${factura.direccion_envio}`, 15, 67)

    doc.setFontSize(10)
    doc.setTextColor(0)
    doc.text('Datos del pedido', 110, 45)
    doc.setFontSize(9)
    doc.setTextColor(80)
    doc.text(`Método de pago: ${factura.metodo_pago}`, 110, 52)
    doc.text(`Estado: ${factura.estado_pedido}`,        110, 57)

    autoTable(doc, {
      startY: 75,
      head: [['Producto', 'Presentación', 'Cantidad', 'Precio Unit.', 'Subtotal']],
      body: factura.productos.map(p => [
        p.producto_nombre,
        p.producto_presentacion || '-',
        p.cantidad,
        `$${Number(p.precio_unitario).toLocaleString()}`,
        `$${Number(p.subtotal).toLocaleString()}`
      ]),
      headStyles:         { fillColor: [45, 90, 39], textColor: 255, fontSize: 9 },
      bodyStyles:         { fontSize: 9 },
      alternateRowStyles: { fillColor: [240, 247, 238] }
    })

    const finalY = doc.lastAutoTable.finalY + 10

    doc.setFontSize(9)
    doc.setTextColor(80)
    doc.text('Subtotal:', 130, finalY)
    doc.text(`$${Number(factura.subtotal).toLocaleString()}`, 175, finalY, { align: 'right' })

    doc.setTextColor(200, 0, 0)
    doc.text('IVA:', 130, finalY + 6)
    doc.text(`$${Number(factura.impuestos).toLocaleString()}`, 175, finalY + 6, { align: 'right' })

    doc.setTextColor(0)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', 130, finalY + 14)
    doc.text(`$${Number(factura.total).toLocaleString()}`, 175, finalY + 14, { align: 'right' })

    doc.save(`factura-${factura.numero_factura}.pdf`)

  } catch (error) {
    console.error('Error descargando factura:', error.message)
    alert('❌ No se pudo generar la factura')
  }
}

const estadoTexto = {
  pendiente: 'text-warning',
  confirmado: 'text-accent',
  en_proceso: 'text-warning',
  enviado: 'text-accent',
  entregado: 'text-success',
  cancelado: 'text-error',
}

const estadoLabel = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_proceso: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

function obtenerIdCliente() {
  try {
    const cliente = JSON.parse(localStorage.getItem('cliente'))
    return cliente?.id ?? null
  } catch {
    return null
  }
}

function MisPedidos() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(() => Boolean(obtenerIdCliente()))
  const [error, setError] = useState(null)
  const [pedidosLocales, setPedidosLocales] = useState(() => cargarPedidosLocales())
  const { contenido, editar, esEdicion } = useEdicion()
  const numeroWhatsApp = contenido.telefonoWhatsApp

  useEffect(() => {
    const id_cliente = obtenerIdCliente()
    if (!id_cliente) return

    let cancelado = false
    async function cargarPedidos() {
      try {
        setCargando(true)
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/pedidos/cliente/${id_cliente}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        const json = await res.json()
        if (!json.ok) throw new Error(json.mensaje)
        if (!cancelado) setPedidos(json.data)
      } catch (err) {
        if (!cancelado) setError(err.message)
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargarPedidos()
    return () => { cancelado = true }
  }, [])

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const formatearNumero = (id) =>
    `PED-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <span className="kicker">
          <EditableTexto clave="pedidosKicker" valor={contenido.pedidosKicker} onCambio={editar} esEdicion={esEdicion} />
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-ink mt-2 mb-8 sm:mb-10 tracking-tight">
          <EditableTexto clave="pedidosTitulo" valor={contenido.pedidosTitulo} onCambio={editar} esEdicion={esEdicion} />
        </h1>

            {cargando && (
          <div className="card overflow-hidden divide-y divide-line">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {!cargando && error && (
          <div className="card p-10 sm:p-16 text-center">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        {!cargando && !error && pedidos.length === 0 && pedidosLocales.length === 0 && (
          <div className="card p-10 sm:p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent-light/40 text-ink-2 flex items-center justify-center mx-auto mb-5">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M4 7l8-4 8 4-8 4-8-4zm0 0v10l8 4m0-14v14m8-14v10l-8 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-ink font-semibold mb-2">
              <EditableTexto clave="pedidosVacioTitulo" valor={contenido.pedidosVacioTitulo} onCambio={editar} esEdicion={esEdicion} />
            </p>
            <p className="text-ink-3 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              <EditableTexto clave="pedidosVacioTexto" valor={contenido.pedidosVacioTexto} onCambio={editar} esEdicion={esEdicion} multilinea />
            </p>
            <button
              type="button"
              onClick={() => navigate('/cliente/catalogo')}
              className="btn-gold"
            >
              <EditableTexto clave="pedidosExplorar" valor={contenido.pedidosExplorar} onCambio={editar} esEdicion={esEdicion} />
            </button>
          </div>
        )}

        {/* Pedidos hechos por WhatsApp (locales, pendientes de cerrar en el chat) */}
        {pedidosLocales.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">
              Pedidos por WhatsApp
            </p>
            <div className="card overflow-hidden divide-y divide-line">
              {pedidosLocales.map((ped) => (
                <div key={ped.id} className="px-5 sm:px-6 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-warning/15 text-warning rounded px-2 py-0.5">
                          Pendiente
                        </span>
                        <p className="text-xs text-ink-3">{formatearFecha(ped.fecha)}</p>
                      </div>
                      <p className="text-sm text-ink-2 mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                        {ped.productos.map((l, i) => (
                          <span key={i} className="text-ink-2">
                            {l.emoji} {l.nombre} ×{l.cantidad}
                          </span>
                        ))}
                      </p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                      <p className="text-sm font-semibold text-ink">
                        ${Number(ped.total).toLocaleString('es-CO')}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => reabrirPedidoWhatsApp(ped, numeroWhatsApp)}
                          className="text-xs font-semibold text-accent hover:underline"
                        >
                          💬 Abrir chat
                        </button>
                        <button
                          type="button"
                          title="Eliminar de mi historial"
                          onClick={() => { eliminarPedidoLocal(ped.id); setPedidosLocales(cargarPedidosLocales()) }}
                          className="w-7 h-7 rounded-lg bg-elevated border border-line text-ink-3 hover:text-error hover:border-error/40 transition text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!cargando && !error && pedidos.length > 0 && (
        <FadeIn>
        <div className="card overflow-hidden divide-y divide-line">
          {pedidos.map((p) => (
            <div key={p.id_pedido} className="flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-accent-light/20 transition">
              
              {/* Info del pedido — navega al detalle */}
              <button
                type="button"
                onClick={() => navigate(`/cliente/pedidos/${p.id_pedido}`)}
                className="flex-1 text-left"
              >
                <p className="text-sm font-medium text-ink">{formatearNumero(p.id_pedido)}</p>
                <p className="text-xs text-ink-3 mt-0.5">{formatearFecha(p.fecha_pedido)}</p>
              </button>

              <div className="flex items-center gap-4">
                <div className="hidden sm:block">
                  <OrderStepper estado={p.estado} compacto />
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium ${estadoTexto[p.estado] || 'text-ink-3'}`}>
                    {estadoLabel[p.estado] || p.estado}
                  </p>
                  <p className="text-sm font-semibold text-ink mt-0.5">
                    ${Number(p.total).toLocaleString('es-CO')}
                  </p>
                </div>

                {/* Botón descargar factura */}
                <button
                  type="button"
                  onClick={() => descargarFactura(p.id_pedido)}
                  title="Descargar factura"
                  className="w-8 h-8 rounded-lg bg-accent-light/30 flex items-center justify-center text-ink-3 hover:text-accent hover:bg-accent-light/60 transition"
                >
                  ⬇️
                </button>
              </div>

            </div>
          ))}
        </div>
        </FadeIn>
      )}

        <FadeIn>
        <div className="mt-6 card p-6 sm:p-8">
          <p className="text-sm font-semibold text-ink mb-6">Así se ve el seguimiento de tu pedido</p>
          <OrderStepper estado="enviado" />
        </div>
        </FadeIn>
      </div>
    </div>
  )
}

export default MisPedidos
