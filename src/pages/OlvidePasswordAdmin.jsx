import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import { API_URL } from '../config'

const REGEX_EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,24}$/

function OlvidePasswordAdmin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    toast.dismiss('error-olvide-admin')

    if (!email.trim()) {
      toast.error('Ingresa tu correo electrónico', { id: 'error-olvide-admin' })
      return
    }

    if (!REGEX_EMAIL.test(email)) {
      toast.error('Ingresa un correo electrónico válido', { id: 'error-olvide-admin' })
      return
    }

    setCargando(true)

    try {
      const respuesta = await fetch(`${API_URL}/auth/recuperar-password-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        toast.error(datos.error || 'No se pudo enviar el correo', { id: 'error-olvide-admin' })
        return
      }

      toast.success(datos.mensaje || 'Correo enviado correctamente')
      setTimeout(() => navigate('/control-interno'), 3000)
    } catch (error) {
      console.error('Error en OlvidePasswordAdmin:', error)
      toast.error('No se pudo conectar con el servidor', { id: 'error-olvide-admin' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <AuthLayout subtitulo="Acceso privado" ancho="max-w-sm">
      <h1 className="font-display text-xl sm:text-2xl font-bold text-center mb-1.5 flex items-center justify-center gap-2">
        <ShieldCheck size={20} className="text-accent" /> ¿Olvidaste tu contraseña?
      </h1>
      <p className="text-sm text-ink-3 text-center mb-7">Ingresa tu correo de administrador y te enviaremos un enlace</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="email-olvide-admin" className="block text-sm font-medium text-ink mb-1.5">Correo electrónico</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="email-olvide-admin"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nathalia.com"
              className="input pl-10"
              autoComplete="email"
            />
          </div>
        </div>

        <button type="submit" disabled={cargando} className="btn btn-primary btn-lg w-full mb-4">
          {cargando ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Enviando...
            </>
          ) : (
            'Enviar enlace'
          )}
        </button>

        <p className="text-center text-sm text-ink-3">
          <Link to="/control-interno" className="inline-flex items-center gap-1.5 text-accent font-semibold hover:underline">
            <ArrowLeft size={14} /> Volver al panel administrativo
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default OlvidePasswordAdmin