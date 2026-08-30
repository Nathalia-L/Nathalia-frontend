import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import AdminLogin from './pages/AdminLogin'
import RutaProtegida from './components/RutaProtegida'
import NotFound from './pages/NotFound'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import { Toaster } from 'react-hot-toast'
import OlvidePasswordAdmin from './pages/OlvidePasswordAdmin'
import ResetPasswordAdmin from './pages/ResetPasswordAdmin'
import Landing from './pages/Landing'
import BotonSorpresa from './components/BotonSorpresa'
import ControlStock from './pages/ControlStock'
import GestionPedidos from './pages/GestionPedidos'
import RegistroDeVentas from './pages/RegistroDeVentas'
import ReportesVentas from './pages/ReportesVentas'
import Catalogo from './pages/Catalogo'
import ClienteLayout from './layouts/ClienteLayout'
import ClienteInicio from './pages/ClienteInicio'
import MisPedidos from './pages/MisPedidos'
import CarritoPage from './pages/CarritoPage'
import EstadoPedidoPage from './pages/EstadoPedidoPage'
import ComparacionPage from './pages/ComparacionPage'
import Empresas from './pages/Empresas'
import { aplicarTemaGuardado } from './utils/tema'
import { suscribirseContenido } from './utils/contenido'
import { sincronizarDesdeServidor, programarSubidaContenido } from './utils/contenidoRemoto'

function App() {
  useEffect(() => {
    aplicarTemaGuardado()
    sincronizarDesdeServidor()

    // Al volver a la pestaña, se re-descarga el contenido si cambió
    // (para que la tienda del visitante esté al día sin recargar).
    const syncAlEnfocar = () => sincronizarDesdeServidor()
    window.addEventListener('focus', syncAlEnfocar)

    const desuscribirse = suscribirseContenido(() => {
      aplicarTemaGuardado()
      programarSubidaContenido()
    })

    return () => {
      desuscribirse()
      window.removeEventListener('focus', syncAlEnfocar)
    }
  }, [])
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#FBF3F6',
            color: '#3A2430',
            border: '1px solid rgba(58,36,48,0.12)',
          },
          error: {
            iconTheme: {
              primary: '#D64550',
              secondary: '#FBF3F6',
            },
          },
          success: {
            iconTheme: {
              primary: '#C77A9C',
              secondary: '#FBF3F6',
            },
          },
        }}
      />
      <BotonSorpresa />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/control-interno" element={<AdminLogin />} />
        <Route path="/olvide-password-admin" element={<OlvidePasswordAdmin />} />
        <Route path="/reset-password-admin" element={<ResetPasswordAdmin />} />

        <Route path="/cliente" element={<ClienteLayout />}>
          <Route index element={<ClienteInicio />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="pedidos" element={<MisPedidos />} />
          <Route path="pedidos/:id" element={<EstadoPedidoPage />} />
          <Route path="carrito" element={<CarritoPage />} />
          <Route path="comparar" element={<ComparacionPage />} />
          <Route path="empresas" element={<Empresas />} />
        </Route>

        {/* Compatibilidad: cualquier link viejo a /catalogo cae en la vista nueva */}
        <Route path="/catalogo" element={<Navigate to="/cliente/catalogo" replace />} />

        <Route path="/dashboard" element={
          <RutaProtegida>
            <DashboardLayout />
          </RutaProtegida>
        }>
          <Route index element={<DashboardHome />} />

          {/* Ventas */}
          <Route path="ventas" element={<RegistroDeVentas />} />
          <Route path="reportes" element={<ReportesVentas />} />

          {/* Pedidos */}
          <Route path="pedidos" element={<GestionPedidos />} />

          {/* Inventario */}
          <Route path="inventario" element={<ControlStock />} />
        </Route>

        {/* Catch-all: siempre al final por claridad, aunque en RR v6 el orden no cambia la prioridad del wildcard */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App