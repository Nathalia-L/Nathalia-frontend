import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ShoppingBag, Menu, X, ArrowLeft } from 'lucide-react'
import LogoNathalia from '../components/LogoNathalia'
import EditorInSitu from '../components/EditorInSitu'
import PanelMarca from '../components/PanelMarca'
import ThemeToggle from '../components/ThemeToggle'
import { useCarrito } from '../context/CarritoContext'
import { suscribirseContenido, esAdmin } from '../utils/contenido'

const ENLACES = [
  { to: '/cliente', label: 'Inicio', end: true },
  { to: '/cliente/catalogo', label: 'Catálogo' },
  { to: '/cliente/pedidos', label: 'Mis pedidos' },
]

function ClienteLayout() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [, forzarRender] = useState(0)
  const soyAdmin = esAdmin()
  const { totalUnidades } = useCarrito()

  useEffect(() => {
    // Refresca el logo (nombre, eslogan, forma, colores) cuando el admin
    // edita desde el panel, sin necesidad de recargar la página.
    return suscribirseContenido(() => forzarRender((v) => v + 1))
  }, [])

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 glass border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8 sm:gap-10">
            {/* Flecha para volver al inicio/tienda */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink-2 hover:text-accent hover:border-accent transition shrink-0"
              aria-label="Volver atrás"
              title="Volver atrás"
            >
              <ArrowLeft size={17} />
            </button>
            <EditorInSitu esEdicion={soyAdmin} titulo="Personalizar marca" ancho="w-80 sm:w-[22rem]" botonPosicion="-top-1 -right-1" edicion={<PanelMarca />}>
              <button type="button" onClick={() => navigate('/cliente')} className="flex items-center gap-2.5 shrink-0" aria-label="Inicio">
                <LogoNathalia size={36} showText />
              </button>
            </EditorInSitu>
            <div className="hidden md:flex items-center gap-7">
              {ENLACES.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className="text-sm transition">
                  {({ isActive }) => (
                    <span className={`relative pb-5 -mb-5 ${isActive ? 'text-accent font-semibold' : 'text-ink-2 hover:text-ink'}`}>
                      {l.label}
                      {isActive && (
                        <span className="absolute left-0 right-0 bottom-[18px] h-[2px] bg-gradient-to-r from-accent to-gold rounded-full"></span>
                      )}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Carrito */}
            <button
              type="button"
              onClick={() => navigate('/cliente/carrito')}
              className="relative w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink-2 hover:text-accent hover:border-accent transition"
              aria-label="Carrito"
            >
              <ShoppingBag size={17} />
              {totalUnidades > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-accent to-accent-strong text-white text-[10px] font-bold flex items-center justify-center">
                  {totalUnidades}
                </span>
              )}
            </button>

            <ThemeToggle />

            {/* Hamburguesa móvil */}
            <button type="button" className="md:hidden text-ink-2 hover:text-ink transition p-2" onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="md:hidden border-t border-line bg-bg px-4 sm:px-6 py-4 flex flex-col gap-1 anim-sheet-up">
            {ENLACES.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-sm py-2.5 px-3 rounded-lg transition ${isActive ? 'text-accent font-semibold bg-accent-light/50' : 'text-ink-2'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <Outlet />
    </div>
  )
}

export default ClienteLayout