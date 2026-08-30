import { useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import FilaProducto from '../components/FilaProducto'
import ResumenPedido from '../components/ResumenPedido'
import { ArrowLeft, ShoppingBag, Plus } from 'lucide-react'

function CarritoPage() {
  const navigate = useNavigate()
  const { productos } = useCarrito()

  return (
    <div className="py-10 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">

        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-2 text-sm mb-6 hover:text-accent transition-colors">
          <ArrowLeft size={15} /> Volver
        </button>

        <span className="kicker">Carrito</span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-ink mt-2 mb-1 tracking-tight">
          Tu carrito de compras
        </h1>
        <p className="text-ink-3 text-sm mb-8">
          Revisa los productos que seleccionaste aquí
        </p>

        <div className="flex flex-col lg:flex-row gap-8">

          <div className="flex-1">
            <div className="card overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-3 gap-3 px-4 sm:px-6 py-4 border-b border-line bg-surface">
                <span className="text-xs font-semibold text-ink-3 uppercase">Producto</span>
                <span className="text-xs font-semibold text-ink-3 uppercase">Precio</span>
                <span className="text-xs font-semibold text-ink-3 uppercase justify-self-end">Cantidad</span>
              </div>

              {productos.length === 0 ? (
                <div className="px-6 py-14 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent-light/40 flex items-center justify-center">
                    <ShoppingBag size={24} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-ink font-medium">Tu carrito está vacío</p>
                    <p className="text-sm text-ink-3 mt-1">Descubre nuestros productos y agrega tus favoritos.</p>
                  </div>
                  <button type="button" onClick={() => navigate('/cliente/catalogo')} className="btn-gold flex items-center gap-2">
                    <Plus size={15} /> Ir al catálogo
                  </button>
                </div>
              ) : (
                productos.map(p => (
                  <FilaProducto
                    key={p.id}
                    id={p.id}
                    imagen={p.img}
                    nombre={p.nombre}
                    presentacion={p.presentacion}
                    precio={p.precio}
                    unidad={p.unidad}
                  />
                ))
              )}

              <div className="px-4 sm:px-6 py-4 border-t border-line bg-surface flex justify-between items-center">
                <button type="button" onClick={() => navigate('/cliente/catalogo')} className="text-accent text-sm hover:underline flex items-center gap-1.5">
                  <Plus size={14} /> Agregar más productos
                </button>
              </div>

            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <ResumenPedido />
          </div>

        </div>
      </div>
    </div>
  )
}

export default CarritoPage