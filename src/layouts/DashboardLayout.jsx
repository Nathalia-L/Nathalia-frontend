import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import * as ReactJoyride from 'react-joyride'
import { jwtDecode } from 'jwt-decode'
import LogoNathalia from '../components/LogoNathalia'

const { Joyride, STATUS, EVENTS } = ReactJoyride

function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [seccionesAbiertas, setSeccionesAbiertas] = useState([])

  const [correrTutorial, setCorrerTutorial] = useState(() => {
    return !localStorage.getItem('tutorial_completado')
  })
  const [modalAbiertoEnPagina, setModalAbiertoEnPagina] = useState(false)

  useEffect(() => {
    function manejarEventoModal(e) {
      setModalAbiertoEnPagina(!!e.detail?.abierto)
    }
    window.addEventListener('granova:modal', manejarEventoModal)
    return () => window.removeEventListener('granova:modal', manejarEventoModal)
  }, [])

  const pasos = [
    {
      target: '.sidebar-logo',
      content: '¡Bienvenido al Panel Administrativo de Nathalia! Desde aquí controlas todo el negocio.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.menu-dashboard',
      content: 'Aquí ves el resumen general del negocio: ventas, pedidos, inventario, todo de un vistazo.',
      placement: 'right',
    },
    {
      target: '.menu-contenido',
      content: 'Edita el contenido de la página: textos, imágenes y colección para tus clientes.',
      placement: 'right',
    },
    {
      target: '.grupo-ventas',
      content: 'Aquí está todo lo de Ventas: registro de ventas y reportes. Haz clic para desplegar las opciones.',
      placement: 'right',
      abrirGrupo: 'ventas',
    },
    {
      target: '.grupo-pedidos',
      content: 'En Pedidos gestionas las órdenes de tus clientes.',
      placement: 'right',
      abrirGrupo: 'pedidos',
    },
    {
      target: '.grupo-inventario',
      content: 'Y en Inventario controlas el stock disponible de tus productos.',
      placement: 'right',
      abrirGrupo: 'inventario',
    },
    {
      target: '.boton-cerrar-sesion',
      content: 'Cuando termines, cierra sesión aquí para proteger tu cuenta.',
      placement: 'right',
    },
  ]

  function handleTutorialFinalizado(data) {
    const { status, type, index } = data

    // Cuando el tour está a punto de mostrar un paso que apunta a un grupo colapsable,
    // lo abrimos automáticamente para que el usuario vea las opciones reales, no un botón cerrado.
    if (type === EVENTS.STEP_BEFORE && pasos[index]?.abrirGrupo) {
      const grupo = pasos[index].abrirGrupo
      setSeccionesAbiertas((prev) => (prev.includes(grupo) ? prev : [...prev, grupo]))
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem('tutorial_completado', 'true')
      setCorrerTutorial(false)
    }
  }

  const menuPrincipal = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      label: 'Dashboard',
      path: '/dashboard',
      clase: 'menu-dashboard',
    },
  ]

  const menuGrupos = [
    {
      id: 'ventas',
      titulo: 'Ventas',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      items: [
        { label: 'Registro de ventas', path: '/dashboard/ventas' },
        { label: 'Reportes', path: '/dashboard/reportes' },
      ],
    },
    {
      id: 'pedidos',
      titulo: 'Pedidos',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M21 8l-9-5-9 5 9 5 9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M3 8v8l9 5 9-5V8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M12 13v8" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      items: [
        { label: 'Gestión de pedidos', path: '/dashboard/pedidos' },
      ],
    },
    {
      id: 'inventario',
      titulo: 'Inventario',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 9h14v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M17 9h2a3 3 0 0 1 0 6h-2" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 2v3M10 2v3M14 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      items: [
        { label: 'Control de stock', path: '/dashboard/inventario' },
      ],
    },
  ]

  // Si la ruta activa vive dentro de un grupo, ese grupo debe abrirse solo.
  // Se ajusta el estado durante el render (patrón recomendado), sin efecto.
  const grupoActivo = menuGrupos.find((g) => g.items.some((item) => item.path === location.pathname))
  if (grupoActivo && !seccionesAbiertas.includes(grupoActivo.id)) {
    setSeccionesAbiertas((prev) => (prev.includes(grupoActivo.id) ? prev : [...prev, grupoActivo.id]))
  }

  function toggleGrupo(id) {
    setSeccionesAbiertas((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
  }

  const handleNavigate = (path) => {
    navigate(path)
    setSidebarOpen(false)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('cliente')
    navigate('/control-interno')
  }

  const token = localStorage.getItem('token')
  let nombreAdmin = 'Administrador'
  if (token) {
    try {
      const decoded = jwtDecode(token)
      nombreAdmin = decoded.nombre || decoded.email || 'Administrador'
    } catch {
      // Token inválido o corrupto: seguimos con el nombre por defecto
    }
  }

  return (
    <>
      <Joyride
        steps={pasos}
        run={correrTutorial && !modalAbiertoEnPagina}
        continuous
        showSkipButton
        showProgress
        callback={handleTutorialFinalizado}
        styles={{
          options: {
            primaryColor: 'var(--na-rose)',
            backgroundColor: '#ffffff',
            textColor: '#3A2430',
            arrowColor: '#ffffff',
            zIndex: 20,
          },
          tooltip: {
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(58,36,48,0.15)',
          },
          buttonNext: {
            backgroundColor: 'var(--na-rose)',
            borderRadius: '8px',
          },
          buttonSkip: {
            color: '#A98B97',
          },
        }}
        locale={{
          back: 'Atrás',
          close: 'Cerrar',
          last: '¡Listo!',
          next: 'Siguiente',
          skip: 'Saltar tutorial',
        }}
      />

      <div className="relative flex h-screen overflow-hidden bg-bg">

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -left-32 w-[36rem] h-[36rem] rounded-full"
            style={{ background: 'radial-gradient(circle, var(--na-rose-soft) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-[-10rem] right-[-8rem] w-[30rem] h-[30rem] rounded-full"
            style={{ background: 'radial-gradient(circle, var(--na-rose-soft) 0%, transparent 70%)' }}
          />
        </div>

        {/* Overlay móvil */}
        {sidebarOpen && (
  <div
    className="fixed inset-0 bg-black/20 z-30 lg:hidden"
    style={{ backdropFilter: 'blur(4px)' }}
    onClick={() => setSidebarOpen(false)}
    onKeyDown={(e) => { if (e.key === 'Escape') setSidebarOpen(false) }}
    role="button"
    tabIndex={0}
    aria-label="Cerrar menú"
  />
)}

        {/* SIDEBAR */}
        <aside
          className={`fixed lg:static top-0 left-0 h-full w-64 flex flex-col py-6 px-4 z-40 m-0 lg:my-3 lg:ml-3 lg:rounded-3xl transition-transform duration-300 bg-surface/90 border border-line backdrop-blur-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >

          {/* Logo */}
          <div className="flex items-center gap-2 px-3 mb-8">
            <LogoNathalia size={34} showText={false} />
            <span className="sidebar-logo font-display text-lg font-semibold tracking-tight text-ink">Nathalia</span>
            <span className="text-xs text-ink-3">Admin</span>
          </div>

          {/* Menú */}
          <nav className="flex flex-col gap-1 overflow-y-auto flex-1 min-h-0">
            {menuPrincipal.map((item) => {
              const activo = location.pathname === item.path
              return (
                <button
                            type="button"
                            key={item.path}
                            onClick={() => handleNavigate(item.path)}
                            className={`flex items-center gap-2 pl-4 pr-3 py-2 rounded-lg text-sm transition-all duration-200 text-left ${
                              activo
                                ? 'bg-accent/15 text-accent font-medium'
                                : 'bg-transparent text-ink-2 hover:bg-accent-light/40 hover:text-ink'
                            }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              )
            })}

            <div className="h-px my-2 bg-line" />

            {menuGrupos.map((grupo) => {
              const abierto = seccionesAbiertas.includes(grupo.id)
              const grupoTieneActivo = grupo.items.some((item) => item.path === location.pathname)
              return (
                <div key={grupo.id} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => toggleGrupo(grupo.id)}
                    className={`grupo-${grupo.id} flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      grupoTieneActivo && !abierto
                        ? 'bg-accent/15 text-accent font-medium'
                        : 'bg-transparent text-ink-2 hover:bg-accent-light/40 hover:text-ink'
                    }`}
                  >
                    {grupo.icon}
                    <span className="flex-1 text-left">{grupo.titulo}</span>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      className={`transition-transform duration-200 flex-shrink-0 ${abierto ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <div
                    className="overflow-hidden transition-all duration-200"
                    style={{ maxHeight: abierto ? `${grupo.items.length * 40 + 8}px` : '0px' }}
                  >
                    <div className="flex flex-col gap-0.5 pt-1 pb-1 pl-4">
                      {grupo.items.map((item) => {
                        const activo = location.pathname === item.path
                        return (
                          <button
                  type="button"
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`${item.clase || ''} flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    activo
                      ? 'bg-accent/15 text-accent font-medium border-l-2 border-accent'
                      : 'bg-transparent text-ink-2 border-l-2 border-line hover:bg-accent-light/40 hover:text-ink'
                  }`}
                          >
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>

          {/* Usuario */}
          <div
            className="px-3 py-3 mb-2 rounded-2xl bg-accent-light/30 border border-accent/15"
          >
            <p className="text-xs mb-0.5 text-ink-3">Sesión activa</p>
            <p className="text-sm truncate text-ink-2">{nombreAdmin}</p>
          </div>

          {/* Cerrar sesión */}
          <button
            type="button"
            onClick={handleLogout}
            className="boton-cerrar-sesion flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-error border border-error/40 bg-error/5 hover:bg-error/15"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Cerrar sesión
          </button>

        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <div className="relative flex-1 flex flex-col overflow-hidden">

          {/* Header móvil */}
          <header
            className="lg:hidden flex items-center justify-between px-4 py-4 m-3 rounded-2xl bg-surface/90 border border-line backdrop-blur-xl"
          >
            <button type="button" onClick={() => setSidebarOpen(true)} className="transition text-ink-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <span className="text-base font-medium text-ink">Nathalia Admin</span>
            <div className="w-6" />
          </header>

          {/* Outlet */}
          <main className="relative flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>

        </div>

      </div>

    </>
  )
}

export default DashboardLayout