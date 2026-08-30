import { useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { Settings2, ShieldCheck, Gift, Building2, Ticket, BadgePercent, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { cargarContenido } from '../utils/contenido'
import { construirMensajePedido, abrirWhatsApp } from '../utils/whatsapp'
import { registrarPedidoWhatsApp } from '../utils/pedidos'

function ResumenPedido() {
  const navigate = useNavigate()
  const { subtotal, descuentoMonto, total, DESCUENTO, descuentoFuente, unidadesRumboPremio, esJuridica, productos } = useCarrito()

  const etiquetaFuente =
    descuentoFuente === 'volumen' ? 'Descuento por volumen' :
    descuentoFuente === 'empresa' ? 'Descuento empresa' :
    descuentoFuente === 'cupon' ? 'Cupón' :
    descuentoFuente === 'promo' ? 'Promoción' : 'Descuento'

  const IconoFuente =
    descuentoFuente === 'volumen' ? Building2 :
    descuentoFuente === 'empresa' ? Building2 :
    descuentoFuente === 'cupon' ? Ticket :
    descuentoFuente === 'promo' ? BadgePercent : Gift

  const pedirPorWhatsApp = () => {
    const numero = cargarContenido().telefonoWhatsApp
    const lineas = productos.map((p) => ({
      nombre: p.nombre || 'Producto',
      precio: p.precio || 0,
      cantidad: p.cantidad || 1,
      emoji: '✨',
    }))
    registrarPedidoWhatsApp(lineas, total)
    abrirWhatsApp(construirMensajePedido(lineas, total), numero)
    toast.success('Pedido enviado a WhatsApp ✅ Se guardó en Mis pedidos')
  }

  return (
    <div className="w-full lg:w-80 flex flex-col gap-4">

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface">
          <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">
            Resumen del pedido
          </h2>
        </div>
        <div className="px-6 py-4 flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-sm text-ink-3">Subtotal</span>
            <span className="text-sm text-ink">${subtotal.toLocaleString()}</span>
          </div>
          {descuentoFuente && (
            <div className="flex justify-between">
              <span className="text-sm text-ink-3 flex items-center gap-1.5">
                <IconoFuente size={14} className="text-gold" /> {etiquetaFuente} {(DESCUENTO * 100).toFixed(0)}%
              </span>
              <span className="text-sm text-accent font-medium">- ${descuentoMonto.toLocaleString()}</span>
            </div>
          )}
          {!descuentoFuente && !esJuridica && unidadesRumboPremio > 0.9 && (
            <div className="text-xs text-accent bg-accent-light/40 border border-accent/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <Gift size={14} className="shrink-0" />
              Llevas {unidadesRumboPremio} de 5 productos para ganar 10% en tu próxima compra
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-3">
            <span className="text-sm font-semibold text-ink">TOTAL</span>
            <span className="text-sm font-semibold text-ink">${total.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-ink-3">Todos los precios incluyen IVA</p>
        </div>
      </div>

      <button
        type="button"
        onClick={pedirPorWhatsApp}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <MessageCircle size={16} /> Pedir por WhatsApp
      </button>
      <button
        type="button"
        onClick={() => navigate('/cliente/pedidos')}
        className="w-full text-xs text-ink-3 hover:text-accent transition-colors"
      >
        <Settings2 size={12} className="inline mr-1 -mt-0.5" /> Ver todos mis pedidos
      </button>

      <div className="flex items-center justify-center gap-3 py-3 px-6 bg-success/10 border border-success/20 rounded-xl">
        <ShieldCheck size={15} className="text-ink-2" />
        <span className="text-xs font-semibold text-ink-2 uppercase tracking-widest">Compra 100% Segura</span>
      </div>

    </div>
  )
}

export default ResumenPedido