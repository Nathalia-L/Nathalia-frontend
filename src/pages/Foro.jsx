import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Star, X, MessageSquare, ShoppingBag, Heart } from 'lucide-react'
import { API_URL } from '../config'
import { useEdicion } from '../hooks/useEdicion'
import EditableTexto from '../components/EditableTexto'
import FormularioResena from '../components/FormularioResena'
import { CATEGORIAS_ACTIVAS } from '../utils/contenido'

function obtenerIdCliente() {
  try {
    const cliente = JSON.parse(localStorage.getItem('cliente'))
    return cliente?.id ?? null
  } catch {
    return null
  }
}

function VisualMini({ p }) {
  if (p.imagen) return <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blush to-accent-light/70">
      <span className="text-4xl drop-shadow-lg">{p.emoji || '✨'}</span>
    </div>
  )
}

function Estrellas({ promedio, tamaño = 14 }) {
  const valor = Math.round(Number(promedio || 0))
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={tamaño} className={n <= valor ? 'text-gold' : 'text-ink-3/40'} fill={n <= valor ? 'currentColor' : 'none'} />
      ))}
    </span>
  )
}

function Foro() {
  const navigate = useNavigate()
  const { contenido, editar, esEdicion } = useEdicion()
  const [ratings, setRatings] = useState({})
  const [cargando, setCargando] = useState(true)
  const [opiniones, setOpiniones] = useState(null) // producto cuyas opiniones se ven
  const [formulario, setFormulario] = useState(null) // { id_detalle, producto_nombre }
  const [aviso, setAviso] = useState(null) // { tipo, producto }

  const productos = useMemo(
    () => (contenido.productos || []).filter((p) => CATEGORIAS_ACTIVAS.includes(p.categoria)),
    [contenido.productos]
  )

  const traerRatings = async () => {
  const resultados = {}
  await Promise.allSettled(
    (productos || []).map(async (p) => {
      try {
        const res = await fetch(`${API_URL}/resenas/producto/${p.id}`)
        const json = await res.json()
        if (json.ok && json.data) {
          resultados[p.id] = {
            promedio: json.data.promedio,
            total_resenas: json.data.total_resenas,
            resenas: json.data.resenas || [],
          }
        }
      } catch {
        /* producto sin reseñas en el servidor */
      }
    })
  )
  return resultados
}

useEffect(() => {
  let activo = true
  traerRatings().then((resultados) => {
    if (!activo) return
    setRatings(resultados)
    setCargando(false)
  })
  return () => { activo = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [productos.length])

  const ordenados = useMemo(() => {
    const conRating = (productos || []).filter((p) => Number(ratings[p.id]?.total_resenas) > 0)
    const sinRating = (productos || []).filter((p) => !Number(ratings[p.id]?.total_resenas))
    const estrellas = (p) => Number(ratings[p.id]?.promedio || 0)
    conRating.sort((a, b) => estrellas(b) - estrellas(a) || ratings[b.id].total_resenas - ratings[a.id].total_resenas)
    return [...conRating, ...sinRating]
  }, [productos, ratings])

  const conseguirDetalleParaCalificar = async (producto) => {
    const id_cliente = obtenerIdCliente()
    if (!id_cliente) {
      setAviso({ tipo: 'login', producto })
      return
    }
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_URL}/api/pedidos/cliente/${id_cliente}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.mensaje)
      const entregados = (json.data || []).filter((p) => p.estado === 'entregado')
      for (const ped of entregados) {
        const det = await fetch(`${API_URL}/api/pedidos/${ped.id_pedido}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const detJson = await det.json()
        if (!detJson.ok) continue
        const match = (detJson.data.productos || []).find((dp) => Number(dp.id_producto) === Number(producto.id))
        if (match) {
          setFormulario({ id_detalle: match.id_detalle, producto_nombre: producto.nombre })
          return
        }
      }
      setAviso({ tipo: 'compra', producto })
    } catch {
      setAviso({ tipo: 'login', producto })
    }
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Cabecera */}
        <span className="kicker">
          <EditableTexto clave="foroKicker" valor={contenido.foroKicker} onCambio={editar} esEdicion={esEdicion} />
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mt-2 tracking-tight text-ink">
          <EditableTexto clave="foroTitulo" valor={contenido.foroTitulo} onCambio={editar} esEdicion={esEdicion} />
        </h1>
        <p className="text-ink-2 text-sm mt-2">
          <EditableTexto clave="foroSubtitulo" valor={contenido.foroSubtitulo} onCambio={editar} esEdicion={esEdicion} multilinea />
        </p>

        <div className="flex items-center gap-2 mt-6 mb-4 text-xs text-ink-3">
          <Heart size={13} className="text-gold" /> Las más queridas aparecen primero. Tu opinión también cuenta.
        </div>

        {/* Grid */}
        {cargando ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card rounded-2xl overflow-hidden">
                <div className="h-28 animate-pulse bg-accent-light/30" />
                <div className="p-3 space-y-2">
                  <div className="h-3 rounded-full animate-pulse bg-accent-light/40 w-3/4" />
                  <div className="h-3 rounded-full animate-pulse bg-accent-light/40 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {ordenados.map((p) => {
              const r = ratings[p.id] || { promedio: 0, total_resenas: 0, resenas: [] }
              const ultimo = r.resenas[0]?.comentario
              return (
                <div key={p.id} className="card card-hover rounded-2xl overflow-hidden flex flex-col">
                  <div className="h-28 sm:h-32 shrink-0 bg-bg-soft">
                    <VisualMini p={p} />
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-ink-3">{p.categoria}</span>
                    <p className="text-sm font-semibold text-ink mt-1 leading-snug">{p.nombre}</p>

                    <div className="flex items-center gap-1.5 mt-2">
                      <Estrellas promedio={r.promedio} />
                      {r.total_resenas > 0 ? (
                        <span className="text-[11px] text-ink-3">({r.total_resenas})</span>
                      ) : (
                        <span className="text-[11px] text-ink-3">Sin calificaciones</span>
                      )}
                    </div>

                    {ultimo ? (
                      <p className="text-[11px] text-ink-2 mt-2 line-clamp-2 leading-relaxed">“{ultimo}”</p>
                    ) : (
                      <p className="text-[11px] text-ink-3 mt-2">Sé la primera en opinar 💬</p>
                    )}

                    <div className="flex gap-2 mt-auto pt-3">
                      <button
                        type="button"
                        onClick={() => conseguirDetalleParaCalificar(p)}
                        className="flex-1 h-8 rounded-lg bg-accent text-white text-[11px] font-semibold hover:bg-accent-strong transition flex items-center justify-center gap-1"
                      >
                        <Star size={11} /> Calificar
                      </button>
                      {r.total_resenas > 0 && (
                        <button
                          type="button"
                          onClick={() => setOpiniones(p)}
                          className="h-8 px-2.5 rounded-lg border border-line text-ink-2 text-[11px] font-semibold hover:border-accent hover:text-accent transition flex items-center justify-center gap-1"
                        >
                          <MessageSquare size={11} /> Ver
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de opiniones */}
      {opiniones && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm" onClick={() => setOpiniones(null)}>
          <div className="card w-full max-w-md rounded-2xl p-6 anim-pop max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-ink-3">
                  {contenido.foroOpinionesDe} {opiniones.categoria}
                </p>
                <h3 className="font-display font-bold text-ink">{opiniones.nombre}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Estrellas promedio={ratings[opiniones.id]?.promedio} />
                  <span className="text-xs text-ink-3 font-medium">{ratings[opiniones.id]?.promedio || '0'} / 5</span>
                </div>
              </div>
              <button type="button" onClick={() => setOpiniones(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-3 hover:text-error hover:bg-error/10 transition" aria-label="Cerrar">
                <X size={17} />
              </button>
            </div>

            {(ratings[opiniones.id]?.resenas || []).length === 0 ? (
              <p className="text-center text-sm text-ink-3 py-8">Aún no hay opiniones para este producto.</p>
            ) : (
              <div className="space-y-3">
                {ratings[opiniones.id].resenas.map((r) => (
                  <div key={r.id_resena} className="card rounded-xl p-4 bg-bg-soft">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-ink">{r.cliente_nombre || 'Cliente'}</p>
                      <span className="text-[10px] text-ink-3">{new Date(r.fecha_resena).toLocaleDateString('es-CO')}</span>
                    </div>
                    <div className="mt-1"><Estrellas promedio={r.calificacion} tamaño={12} /></div>
                    {r.comentario && <p className="text-xs text-ink-2 mt-1.5 leading-relaxed">{r.comentario}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulario de reseña */}
      {formulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm" onClick={() => setFormulario(null)}>
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <FormularioResena
              id_detalle={formulario.id_detalle}
              producto_nombre={formulario.producto_nombre}
              onCerrar={() => setFormulario(null)}
              onEnviado={() => {
                setFormulario(null)
                toast.success('¡Gracias por tu reseña! 💖')
                traerRatings().then(setRatings)
              }}
            />
          </div>
        </div>
      )}

      {/* Aviso (necesitas login o compra entregada) */}
      {aviso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm" onClick={() => setAviso(null)}>
          <div className="card w-full max-w-sm rounded-2xl p-6 sm:p-7 anim-pop text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-accent-light/40 text-ink-2 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={22} />
            </div>
            <h3 className="font-display font-bold text-ink mb-2">{aviso.producto.nombre}</h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              {aviso.tipo === 'login' ? contenido.foroNecesitasLogin : contenido.foroNecesitasCompra}
            </p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setAviso(null)}
                className="flex-1 h-10 rounded-xl text-sm font-medium text-ink-3 hover:text-ink transition"
              >
                Entendido
              </button>
              <button
                type="button"
                onClick={() => { setAviso(null); navigate('/cliente/catalogo') }}
                className="flex-1 h-10 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-strong transition"
              >
                Ir al catálogo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Foro