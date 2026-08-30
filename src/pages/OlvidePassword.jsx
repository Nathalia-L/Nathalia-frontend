import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import { API_URL } from '../config'

const REGEX_EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,24}$/

function OlvidePassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [cargando, setCargando] = useState(false)
  const [erroresEmail, setErroresEmail] = useState('')

  const emailValido = REGEX_EMAIL.test(email.trim())

  function handleChange(e) {
    const value = e.target.value
    setEmail(value)
    setErroresEmail(value && !REGEX_EMAIL.test(value) ? 'Correo no válido' : '')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    toast.dismiss('error-olvide')

    if (!email.trim()) {
      toast.error('Ingresa tu correo electrónico', { id: 'error-olvide' })
      return
    }
    if (!emailValido) {
      toast.error('Ingresa un correo electrónico válido', { id: 'error-olvide' })
      return
    }

    setCargando(true)

    try {
      const respuesta = await fetch(`${API_URL}/auth/recuperar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        toast.error(datos.error || 'No se pudo enviar el correo', { id: 'error-olvide' })
        return
      }

      toast.success(datos.mensaje || 'Correo enviado correctamente')
      setTimeout(() => navigate('/'), 3000)
    } catch (error) {
      console.error('Error en OlvidePassword:', error)
      toast.error('No se pudo conectar con el servidor', { id: 'error-olvide' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <AuthLayout subtitulo="Recupera tu acceso" ancho="max-w-sm">
      <h1 className="font-display text-xl sm:text-2xl font-bold text-center mb-1.5">¿Olvidaste tu contraseña?</h1>
      <p className="text-sm text-ink-3 text-center mb-7">Ingresa tu correo y te enviaremos un enlace para restablecerla</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="email-olvide" className="block text-sm font-medium text-ink mb-1.5">Correo electrónico</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="email-olvide"
              type="email"
              value={email}
              onChange={handleChange}
              disabled={cargando}
              placeholder="tucorreo@ejemplo.com"
              className="input pl-10"
              autoComplete="email"
            />
          </div>
          {erroresEmail && <p className="text-xs text-error mt-1.5">{erroresEmail}</p>}
        </div>

        <button type="submit" disabled={cargando || !emailValido} className="btn btn-primary btn-lg w-full mb-4">
          {cargando ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Enviando...
            </>
          ) : (
            'Enviar enlace'
          )}
        </button>

        <p className="text-center text-sm text-ink-3">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-accent font-semibold hover:underline">
            <ArrowLeft size={14} /> Volver al inicio de sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default OlvidePassword