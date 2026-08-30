import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { API_URL } from "../config";
import FormularioResena from '../components/FormularioResena'
import OrderStepper from '../components/ui/OrderStepper'

function EstadoPedidoPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [pedido, setPedido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [resenaAbierta, setResenaAbierta] = useState(null) // guarda el id_detalle abierto, o null

  useEffect(() => {
    async function cargarPedido() {
      try {
        setCargando(true)
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/pedidos/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        const json = await res.json()
        if (!json.ok) throw new Error(json.mensaje)
        setPedido(json.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }
    cargarPedido()
  }, [id])

  if (cargando) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-ink-3 text-sm">Cargando pedido...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-error text-sm">{error}</p>
    </div>
  )

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric', month: 'long', year: 'numeric'
    })

  const formatearNumero = (id) =>
    `PED-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`

  const productoEnResena = pedido.productos?.find(p => p.id_detalle === resenaAbierta)

  return (
    <div className="py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">

        {/* Encabezado */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-ink mb-1 tracking-tight">Estado del pedido</h1>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-sm font-medium text-ink">
            Pedido #{formatearNumero(pedido.id_pedido)}
          </span>
          <span className="badge badge-rose">
            {pedido.estado === 'en_proceso' ? 'En preparación' : pedido.estado}
          </span>
        </div>
        <p className="text-xs text-ink-3 mb-8">
          Realizado el {formatearFecha(pedido.fecha_pedido)}
        </p>

        {/* Timeline */}
        <div className="card p-6 sm:p-8 mb-6">
          <OrderStepper estado={pedido.estado} fechaPedido={formatearFecha(pedido.fecha_pedido)} />
        </div>

        {/* Cards info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          {/* Información del pedido */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-ink mb-4">Información del pedido</h3>
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-3">Número</span>
                <span className="text-ink font-medium">{formatearNumero(pedido.id_pedido)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-3">Método de pago</span>
                <span className="text-accent font-medium">{pedido.metodo_pago}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-ink-3">Dirección</span>
                <span className="text-ink text-right">
                  {pedido.direccion_envio}<br />{pedido.ciudad_envio}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 mt-1">
                <span className="text-ink-3">Total pagado</span>
                <span className="text-ink font-semibold">${Number(pedido.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Productos */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-ink">
            Productos ({pedido.productos?.length || 0})
          </h3>
        </div>
        <div className="flex flex-col gap-3">
     {pedido.productos?.map((p, i) => (
  <div key={i} className="flex items-center gap-3">
    <div className="w-8 h-8 bg-accent/15 rounded-lg flex items-center justify-center text-sm">✨</div>
    <div className="flex-1">
      <p className="text-xs font-medium text-ink">{p.producto_nombre}</p>
      <p className="text-[10px] text-ink-3">{p.presentacion}</p>
      {pedido.estado === 'entregado' && resenaAbierta !== p.id_detalle && (
        <button
          type="button"
          onClick={() => setResenaAbierta(p.id_detalle)}
          className="text-[10px] text-accent hover:underline block mt-1"
        >
          Escribir reseña →
        </button>
      )}
    </div>
    <span className="text-xs text-ink-3">{p.cantidad} und</span>
  </div>
))}
        </div>
      </div>

          {/* Información de envío */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-ink mb-4">Información de envío</h3>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <p className="text-ink-3">Dirección de envío</p>
                <p className="text-ink font-semibold mt-1">{pedido.direccion_envio}</p>
              </div>
              <div>
                <p className="text-ink-3">Ciudad</p>
                <p className="text-ink font-semibold mt-1">{pedido.ciudad_envio}</p>
              </div>
              <button type="button" className="mt-2 w-full btn-ghost rounded-xl py-2 text-xs flex items-center justify-center gap-2">
                📍 Rastrear envío
              </button>
            </div>
          </div>

        </div>

        {/* Formulario de reseña: a todo el ancho, fuera del grid de 3 columnas */}
        {resenaAbierta && productoEnResena && (
          <div className="mb-6">
            <FormularioResena
              id_detalle={resenaAbierta}
              producto_nombre={productoEnResena.producto_nombre}
              onCerrar={() => setResenaAbierta(null)}
              onEnviado={() => setResenaAbierta(null)}
            />
          </div>
        )}

        {/* Notificación */}
        <div className="card px-6 py-4 flex items-center gap-4">
          <div className="w-8 h-8 bg-accent/15 rounded-full flex items-center justify-center text-sm flex-shrink-0">
            🛡️
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Te notificaremos cuando tu pedido esté en camino.</p>
            <p className="text-xs text-ink-3">Si tienes dudas, contáctanos por WhatsApp 300 123 4567</p>
          </div>
        </div>

        {/* Volver */}
        <button
          type="button"
          onClick={() => navigate('/cliente/pedidos')}
          className="mt-6 flex items-center gap-2 text-accent text-sm hover:underline"
        >
          ← Volver al historial
        </button>

      </div>
    </div>
  )
}



export default EstadoPedidoPage