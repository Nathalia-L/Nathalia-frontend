// Nathalia — Pantalla de Login
import { useNavigate, Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import { API_URL, FRONTEND_URL } from '../config'
import { useCarrito } from '../context/CarritoContext'

const REGEX_EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,24}$/

function Login() {
  const navigate = useNavigate()
  const { actualizarPerfilCliente } = useCarrito()
  const [loading, setLoading] = useState(false)
  const [verContraseña, setVerContraseña] = useState(false)
  const loginEnCurso = useRef(false)

  const [formData, setFormData] = useState({ email: '', contraseña: '' })

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (loginEnCurso.current) return

    toast.dismiss()

    if (!formData.email.trim() || !formData.contraseña.trim()) {
      toast.error('Todos los campos son obligatorios')
      return
    }

    if (!REGEX_EMAIL.test(formData.email)) {
      toast.error('Ingresa un correo electrónico válido')
      return
    }

    loginEnCurso.current = true
    setLoading(true)

    try {
      const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          contraseña: formData.contraseña,
        }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        toast.dismiss()
        toast.error(datos.error || 'Error al iniciar sesión')
        return
      }

      toast.dismiss()

      localStorage.setItem('token', datos.token)
      localStorage.setItem('cliente', JSON.stringify(datos.cliente))
      actualizarPerfilCliente(datos.cliente)

      navigate('/cliente')
    } catch (error) {
      console.error('Error en Login:', error)
      toast.dismiss()
      toast.error('Error al iniciar sesión')
    } finally {
      setLoading(false)
      loginEnCurso.current = false
    }
  }

  function iniciarLoginGoogle() {
    const ancho = 480
    const alto = 600
    const izquierda = (window.screen.width - ancho) / 2
    const arriba = (window.screen.height - alto) / 2

    const popup = window.open(
      `${API_URL}/auth/google`,
      'googleLogin',
      `width=${ancho},height=${alto},left=${izquierda},top=${arriba}`
    )

    if (!popup) {
      toast.error('Tu navegador bloqueó la ventana de Google. Habilita los popups e intenta de nuevo.')
      return
    }

    function manejarMensaje(evento) {
      if (evento.origin !== FRONTEND_URL) return

      const { token, cliente, error } = evento.data

      if (error) {
        toast.dismiss()
        toast.error(error)
        window.removeEventListener('message', manejarMensaje)
        popup.close()
        return
      }

      if (token && cliente) {
        let clienteObj = cliente
        if (typeof cliente === 'string') {
          try {
            clienteObj = JSON.parse(cliente)
          } catch {
            clienteObj = {}
          }
        }

        localStorage.setItem('token', token)
        localStorage.setItem('cliente', JSON.stringify(clienteObj))
        actualizarPerfilCliente(clienteObj)

        window.removeEventListener('message', manejarMensaje)
        popup.close()
        navigate('/cliente')
      }
    }

    window.addEventListener('message', manejarMensaje)
  }

  return (
    <AuthLayout subtitulo="Bienvenida a Beauty Esme" ancho="max-w-[440px]">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-center mb-1.5">Bienvenido de nuevo</h1>
      <p className="text-sm text-ink-3 text-center mb-7">Inicia sesión en tu cuenta de Beauty Esme</p>

      <button
        type="button"
        onClick={iniciarLoginGoogle}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium text-ink border border-line-strong hover:border-accent hover:bg-accent-light/40 transition mb-6"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 1 9 18z" />
          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
        </svg>
        Continuar con Google
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-line-strong"></div>
        <span className="text-xs text-ink-3">o continúa con tu correo</span>
        <div className="flex-1 h-px bg-line-strong"></div>
      </div>

      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="email-login" className="block text-sm font-medium text-ink mb-1.5">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="email-login"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tucorreo@ejemplo.com"
              className="input pl-10"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="mb-2">
          <label htmlFor="password-login" className="block text-sm font-medium text-ink mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="password-login"
              type={verContraseña ? 'text' : 'password'}
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              placeholder="••••••••"
              className="input pl-10 pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setVerContraseña(!verContraseña)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-accent transition"
              tabIndex={-1}
              aria-label="Mostrar contraseña"
            >
              {verContraseña ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <Link to="/olvide-password" className="block text-right text-xs text-accent hover:underline mb-6 mt-1">
          ¿Olvidaste tu contraseña?
        </Link>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mb-6">
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-ink-3">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-accent font-semibold hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login