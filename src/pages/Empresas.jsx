import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL as BASE_API_URL } from "../config";
import { cargarContenido } from '../utils/contenido'
import { abrirWhatsApp } from '../utils/whatsapp'
import { useCarrito } from '../context/CarritoContext'
import FadeIn from '../components/ui/FadeIn'

const API_URL = `${BASE_API_URL}/productos`

const DESCUENTO_EMPRESA = 10

const BENEFICIOS = [
  { icono: '🏢', titulo: '10% en todos tus pedidos', texto: 'Por comprar como empresa, el descuento se aplica automáticamente, sin cupones ni letra pequeña.' },
  { icono: '📦', titulo: 'Formatos a tu medida', texto: 'Elige la presentación que tu negocio necesite en cada compra.' },
  { icono: '📈', titulo: 'Precios por volumen', texto: 'Entre más producto lleves, mayor descuento. El mayor beneficio gana, nunca suma.' },
  { icono: '🚚', titulo: 'Envío a todo el país', texto: 'Coordinamos la entrega directa hasta tu negocio.' },
]

function Empresas() {
  const navigate = useNavigate()
  const { cliente } = useCarrito()
  const esJuridica = cliente?.tipo_persona === 'juridica'

  const [productos, setProductos] = useState([])
  const [descuentosVolumen, setDescuentosVolumen] = useState([])
  const [cargando, setCargando] = useState(true)
  const [productoId, setProductoId] = useState(null)
  const [formatoId, setFormatoId] = useState(null)
  const [cantidad, setCantidad] = useState(1)

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      try {
        const res = await fetch(API_URL)
        const json = await res.json()
        if (!json.ok) throw new Error(json.mensaje || 'Error del servidor')
        if (cancelado) return
        // Productos con formatos (los que no tienen, no aplican a la calculadora)
        const conFormato = (json.data || []).filter(p => p.categoria_producto !== 'maquina' && (p.formatos || []).length > 0)
        setProductos(conFormato)
        setDescuentosVolumen(json.descuentosVolumen || [])
        if (conFormato.length > 0) {
          setProductoId(conFormato[0].id_producto)
          setFormatoId(conFormato[0].formatos[0].id_formato)
        }
      } catch (error) {
        console.error('Error cargando productos para empresas:', error.message)
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [])

  const producto = productos.find(p => p.id_producto === productoId)
  const formatos = producto?.formatos || []
  const formato = formatos.find(f => f.id_formato === formatoId)

  const kgTotales = formato ? Number(formato.peso_kg) * cantidad : 0
  const bruto = formato ? Number(formato.precio) * cantidad : 0
  const tier = descuentosVolumen.find(t => kgTotales >= Number(t.kg_min) && (t.kg_max === null || kgTotales <= Number(t.kg_max)))
  const volumenPct = tier ? Number(tier.descuento_pct) : 0
  const pctFinal = Math.max(volumenPct, DESCUENTO_EMPRESA)
  const total = Math.round(bruto * (1 - pctFinal / 100))
  const ahorro = bruto - total

  const inputClase = 'bg-surface border border-line text-ink focus:border-accent w-full px-4 py-3 rounded-xl text-sm outline-none transition'

  return (
    <div className="py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* HERO */}
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="kicker">Nathalia Empresas</span>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink mt-3 tracking-tight">Tu proveedor de belleza, sin papeleo</h1>
            <p className="text-ink-3 text-sm sm:text-base mt-4 leading-relaxed">
              Si compras para tu negocio, Nathalia te premia desde el primer pedido: 10% siempre,
              precios por volumen y descuentos que crecen con tu pedido.
            </p>
            {esJuridica ? (
              <p className="inline-block mt-5 text-sm text-accent bg-accent-light/40 border border-accent/30 rounded-full px-4 py-2">
                🏢 Ya estás registrado como empresa: tienes 10% en todos tus pedidos
              </p>
            ) : (
              <button
                type="button"
                onClick={() => abrirWhatsApp(`Hola 🏢, quiero comprar para mi negocio y obtener el 10% Nathalia.`, cargarContenido().telefonoWhatsApp)}
                className="mt-6 h-12 px-8 rounded-xl btn-primary text-sm font-semibold"
              >
                Comienza por WhatsApp →
              </button>
            )}
          </div>
        </FadeIn>

        {/* BENEFICIOS */}
        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {BENEFICIOS.map(b => (
              <div key={b.titulo} className="card p-5">
                <span className="text-2xl">{b.icono}</span>
                <p className="text-sm font-semibold text-ink mt-3">{b.titulo}</p>
                <p className="text-xs text-ink-3 mt-1.5 leading-relaxed">{b.texto}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* CALCULADORA DE AHORRO */}
        <FadeIn>
        <div className="card border-accent/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-line bg-surface">
            <h2 className="text-lg font-semibold text-ink">Calcula tu ahorro</h2>
            <p className="text-xs text-ink-3 mt-0.5">Estimado — el descuento final se aplica al confirmar tu pedido</p>
          </div>

          {cargando ? (
            <div className="p-8 text-center text-ink-3 text-sm">Cargando productos...</div>
          ) : productos.length === 0 ? (
            <div className="p-8 text-center text-ink-3 text-sm">
              Aún no hay productos con formatos por volumen. Vuelve pronto.
            </div>
          ) : (
            <div className="p-6 flex flex-col lg:flex-row gap-8">
              {/* Inputs */}
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <label htmlFor="empresa-producto" className="block text-xs text-ink-3 mb-1.5">Producto</label>
                  <select
                    id="empresa-producto"
                    value={productoId ?? ''}
                    onChange={e => {
                      const id = Number(e.target.value)
                      setProductoId(id)
                      const prod = productos.find(p => p.id_producto === id)
                      if (prod && prod.formatos.length > 0) setFormatoId(prod.formatos[0].id_formato)
                    }}
                    className={inputClase}
                  >
                    {productos.map(p => (
                      <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="empresa-formato" className="block text-xs text-ink-3 mb-1.5">Formato</label>
                  <select
                    id="empresa-formato"
                    value={formatoId ?? ''}
                    onChange={e => setFormatoId(Number(e.target.value))}
                    className={inputClase}
                  >
                    {formatos.map(f => (
                      <option key={f.id_formato} value={f.id_formato}>
                        {f.etiqueta} — ${Number(f.precio).toLocaleString('es-CO')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="empresa-cantidad" className="block text-xs text-ink-3 mb-1.5">Cantidad</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setCantidad(c => Math.max(1, c - 1))} className="w-11 h-11 rounded-xl text-xl text-ink-2 flex items-center justify-center border border-line bg-surface hover:bg-accent-light/30 transition">−</button>
                    <input
                      id="empresa-cantidad"
                      type="number"
                      min={1}
                      value={cantidad}
                      onChange={e => {
                        const val = Number(e.target.value)
                        setCantidad(Number.isFinite(val) && val > 0 ? val : 1)
                      }}
                      className="w-20 px-3 py-2.5 rounded-xl text-sm text-ink text-center border border-line bg-surface outline-none focus:border-accent"
                    />
                    <button type="button" onClick={() => setCantidad(c => c + 1)} className="w-11 h-11 rounded-xl text-xl text-ink-2 flex items-center justify-center border border-line bg-surface hover:bg-accent-light/30 transition">+</button>
                  </div>
                  {formato && (
                    <p className="text-xs text-ink-3 mt-2">{kgTotales.toLocaleString('es-CO')} kg de producto en total</p>
                  )}
                </div>
              </div>

              {/* Resultado */}
              <div className="flex-1 card p-6 flex flex-col justify-center gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-3">Subtotal</span>
                  <span className="text-ink">${bruto.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-3">Tu descuento {pctFinal}% {volumenPct > DESCUENTO_EMPRESA ? '(por volumen)' : '(empresa)'}</span>
                  <span className="text-accent font-medium">− ${ahorro.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-3">
                  <span className="text-base font-semibold text-ink">Total estimado</span>
                  <span className="text-base font-semibold text-ink">${total.toLocaleString('es-CO')}</span>
                </div>
                <p className="text-xs text-accent mt-2">
                  🎉 Te ahorras ${ahorro.toLocaleString('es-CO')} en este pedido frente al precio sin descuento
                </p>
              </div>
            </div>
          )}
        </div>
        </FadeIn>

        {/* CTA FINAL */}
        <FadeIn>
          <div className="text-center mt-12">
            <button
              type="button"
              onClick={() => navigate('/cliente/catalogo')}
              className="h-12 px-10 rounded-xl btn-primary text-sm font-semibold"
            >
              Ir al catálogo
            </button>
            <p className="text-xs text-ink-3 mt-4">¿Dudas? Escríbenos y coordinamos tu pedido empresarial.</p>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

export default Empresas