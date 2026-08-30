import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { API_URL } from "../config";
import { SkeletonTable } from '../components/ui/Skeleton';

function ComparacionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ids = searchParams.get('ids') // ej: "5,9,14"

  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargarComparacion() {
      if (!ids) {
        setError('No seleccionaste productos para comparar')
        setCargando(false)
        return
      }
      try {
        setCargando(true)
        const res = await fetch(`${API_URL}/productos/comparar?ids=${ids}`)
        const json = await res.json()
        if (!json.ok) throw new Error(json.mensaje)
        setProductos(json.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }
    cargarComparacion()
  }, [ids])

  if (cargando) return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="h-8 skeleton rounded w-48 mb-2" />
        <div className="h-3 skeleton rounded w-32 mb-8" />
        <SkeletonTable rows={4} cols={3} />
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
      <p className="text-error text-sm">{error}</p>
      <Link to="/cliente/catalogo" className="text-accent text-sm hover:underline">← Volver al catálogo</Link>
    </div>
  )

  // Filas de la tabla: cada una sabe cómo leer su valor de un producto
  const filas = [
    { label: 'Precio', render: (p) => `$${Number(p.precio).toLocaleString('es-CO')}` },
    { label: 'Categoría', render: (p) => p.categoria || p.tipo_cafe || '—' },
    { label: 'Presentación', render: (p) => p.presentacion || '—' },
    {
      label: 'Valoración',
      render: (p) => Number(p.total_resenas) > 0
        ? `★ ${Number(p.promedio).toFixed(1)} (${p.total_resenas})`
        : 'Sin reseñas todavía'
    },
  ]

  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">

        <h1 className="text-2xl sm:text-3xl font-semibold text-ink mb-1 tracking-tight">Comparar productos</h1>
        <p className="text-xs text-ink-3 mb-8">{productos.length} productos seleccionados</p>

        <div className="card p-6 sm:p-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <td className="w-32"></td>
                {productos.map(p => (
                  <th key={p.id_producto} className="text-center pb-4 px-3 border-b border-line">
                    <div className="w-16 h-16 mx-auto rounded-lg overflow-hidden bg-surface border border-line mb-2">
                      {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />}
                    </div>
                    <p className="text-ink font-medium text-xs leading-snug">{p.nombre}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, i) => (
                <tr key={fila.label}>
                  <td className="text-ink-3 text-xs py-3 pr-3">{fila.label}</td>
                  {productos.map(p => (
                    <td
                      key={p.id_producto}
                      className={`text-center py-3 px-3 ${i < filas.length - 1 ? 'border-b border-line' : ''}`}
                    >
                      {fila.label === 'Valoración'
                        ? <span className="text-gold">{fila.render(p)}</span>
                        : <span className="text-ink">{fila.render(p)}</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={() => navigate('/cliente/catalogo')}
          className="mt-6 flex items-center gap-2 text-accent text-sm hover:underline"
        >
          ← Volver al catálogo
        </button>

      </div>
    </div>
  )
}

export default ComparacionPage