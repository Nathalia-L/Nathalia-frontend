import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck, LogIn } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import { API_URL } from '../config'

const REGEX_EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,24}$/

function AdminLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', contraseña: '' })
  const [cargando, setCargando] = useState(false)
  const [verContraseña, setVerContraseña] = useState(false)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleLogin(e) {
    e.preventDefault()
    toast.dismiss('error-admin')

    if (!formData.email.trim() || !formData.contraseña) {
      toast.error('Completa tu correo y contraseña', { id: 'error-admin' })
      return
    }

    if (!REGEX_EMAIL.test(formData.email)) {
      toast.error('Ingresa un correo electrónico válido', { id: 'error-admin' })
      return
    }

    setCargando(true)

    try {
      const respuesta = await fetch(`${API_URL}/auth/login-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          contraseña: formData.contraseña,
        }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        toast.error(datos.error || 'Error al iniciar sesión', { id: 'error-admin' })
        return
      }

      localStorage.setItem('token', datos.token)
      localStorage.setItem('usuario', JSON.stringify(datos.usuario))
      navigate('/')
    } catch (error) {
      console.error('Error en AdminLogin:', error)
      toast.error('No se pudo conectar con el servidor', { id: 'error-admin' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <AuthLayout subtitulo="Acceso privado" ancho="max-w-sm">
      <h1 className="font-display text-xl sm:text-2xl font-bold text-center mb-1.5 flex items-center justify-center gap-2">
        <ShieldCheck size={22} className="text-accent" /> Panel de Administración
      </h1>
      <p className="text-sm text-ink-3 text-center mb-7">Ingresa para gestionar Beauty Esme</p>

      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="email-admin" className="block text-sm font-medium text-ink mb-1.5">Correo</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="email-admin"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@beautyesme.com"
              className="input pl-10"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="mb-2">
          <label htmlFor="password-admin" className="block text-sm font-medium text-ink mb-1.5">Contraseña</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="password-admin"
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

        <Link to="/olvide-password-admin" className="block text-right text-xs text-accent hover:underline mb-6 mt-1">
          ¿Olvidaste tu contraseña?
        </Link>

        <button type="submit" disabled={cargando} className="btn btn-primary btn-lg w-full">
          {cargando ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Ingresando...
            </>
          ) : (
            <>
              <LogIn size={16} /> Ingresar
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}

export default AdminLogin