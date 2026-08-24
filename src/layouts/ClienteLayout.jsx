import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import LogoNathalia from '../components/LogoNathalia'

const ENLACES = [
  { to: '/cliente', label: 'Inicio', end: true },
  { to: '/cliente/catalogo', label: 'Catálogo' },
  { to: '/cliente/pedidos', label: 'Mis pedidos' },
]

function ClienteLayout() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cuentaOpen, setCuentaOpen] = useState(false)
  const cuentaRef = useRef(null)

  const cliente = (() => {
    try {
      return JSON.parse(localStorage.getItem('cliente')) || {}
    } catch {
      return {}
    }
  })()

  const inicial = (cliente.nombre || 'C').charAt(0).toUpperCase()

  useEffect(() => {
    function cerrarSiClicFuera(e) {
      if (cuentaRef.current && !cuentaRef.current.contains(e.target)) {
        setCuentaOpen(false)
      }
    }
    document.addEventListener('mousedown', cerrarSiClicFuera)
    return () => document.removeEventListener('mousedown', cerrarSiClicFuera)
  }, [])

  function cerrarSesion() {
    localStorage.removeItem('token')
    localStorage.removeItem('cliente')
    navigate('/')
  }

  return (
    <div className="min-h-screen" style={{ background: '#1A0E13' }}>
      {/* NAVBAR */}
      <nav
        className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{ background: 'rgba(26,14,19,0.85)', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8 sm:gap-10">
            <button type="button" onClick={() => navigate('/cliente')} className="flex items-center gap-2.5 shrink-0">
              <LogoNathalia size={34} showText={false} />
              <span className="font-display text-[#F9E7EE] text-lg font-semibold tracking-tight">Nathalia</span>
            </button>
            <div className="hidden md:flex items-center gap-7">
              {ENLACES.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className="text-sm transition">
                  {({ isActive }) => (
                    <span className={`relative pb-5 -mb-5 ${isActive ? 'text-white font-medium' : 'text-white/50 hover:text-white'}`}>
                      {l.label}
                      {isActive && <span className="absolute left-0 right-0 bottom-[18px] h-[2px] bg-[#C77A9C] rounded-full"></span>}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cuenta (desktop) */}
            <div className="relative hidden md:block" ref={cuentaRef}>
             <button
  type="button"
  onClick={() => setCuentaOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-[#C77A9C] text-white text-sm font-semibold flex items-center justify-center hover:bg-[#A65E80] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C77A9C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A0E13]"
              >
                {inicial}
              </button>
              {cuentaOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden py-1"
                  style={{ background: 'rgba(42,21,33,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <p className="px-4 py-2 text-xs text-white/40 truncate border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>{cliente.email}</p>
                  <button
  type="button"
  onClick={() => { setCuentaOpen(false); navigate('/cliente/cuenta') }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
                  >
                    Mi cuenta
                  </button>
                  <button
  type="button"
  onClick={cerrarSesion}
  className="w-full text-left px-4 py-2.5 text-sm text-[#E9CD8A] hover:bg-white/10 transition"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>

            {/* Hamburguesa móvil */}
            <button type="button" className="md:hidden text-white/70 hover:text-white transition p-2" onClick={() => setMenuOpen((o) => !o)}> 
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div
            className="md:hidden backdrop-blur-md border-t px-4 sm:px-6 py-4 flex flex-col gap-1"
            style={{ background: 'rgba(26,14,19,0.98)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {ENLACES.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-sm py-2.5 transition ${isActive ? 'text-white font-medium' : 'text-white/60'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="flex flex-col gap-1 pt-2 mt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <button
  type="button"
  onClick={() => { setMenuOpen(false); navigate('/cliente/cuenta') }}
  className="text-left text-sm py-2.5 text-white/60"
              >
                Mi cuenta
              </button>
              <button type="button" onClick={cerrarSesion} className="text-left text-sm py-2.5 text-[#E9CD8A]">
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      <Outlet />
    </div>
  )
}

export default ClienteLayout
