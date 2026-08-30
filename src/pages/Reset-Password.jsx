import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import { API_URL } from '../config'

const REGEX_MAYUSCULA = /[A-Z]/
const REGEX_NUMERO = /[0-9]/
const REGEX_ESPECIAL = /[!@#$%^&*(),.?":{}|<>_-]/

function evaluarReglasContraseña(value) {
  return {
    longitud: value.length >= 6,
    mayuscula: REGEX_MAYUSCULA.test(value),
    numero: REGEX_NUMERO.test(value),
    especial: REGEX_ESPECIAL.test(value),
  }
}

function ResetPassword() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ nuevaContraseña: '', confirmarContraseña: '' })
  const [token, setToken] = useState('')
  const [cargando, setCargando] = useState(false)
  const yaProcesado = useRef(false)

  const [verContraseña, setVerContraseña] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [contraseñaFocus, setContraseñaFocus] = useState(false)

  const [reglasContraseña, setReglasContraseña] = useState({
    longitud: false,
    mayuscula: false,
    numero: false,
    especial: false,
  })

  const contraseñaValida = Object.values(reglasContraseña).every(Boolean)
  const confirmarTocado = formData.confirmarContraseña.length > 0
  const contraseñasCoinciden = formData.nuevaContraseña === formData.confirmarContraseña
  const puedeActualizar = contraseñaValida && confirmarTocado && contraseñasCoinciden

  useEffect(() => {
    if (yaProcesado.current) return
    yaProcesado.current = true

    const params = new URLSearchParams(window.location.search)
    const tokenUrl = params.get('token')

    if (!tokenUrl) {
      toast.error('Enlace inválido', { id: 'error-reset' })
      navigate('/')
      return
    }

    setToken(tokenUrl)
  }, [navigate])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (name === 'nuevaContraseña') {
      setReglasContraseña(evaluarReglasContraseña(value))
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    toast.dismiss('error-reset')

    if (!formData.nuevaContraseña || !formData.confirmarContraseña) {
      toast.error('Completa todos los campos', { id: 'error-reset' })
      return
    }
    if (!contraseñaValida) {
      toast.error('La contraseña no cumple los requisitos de seguridad', { id: 'error-reset' })
      return
    }
    if (!contraseñasCoinciden) {
      toast.error('Las contraseñas no coinciden', { id: 'error-reset' })
      return
    }

    setCargando(true)

    try {
      const respuesta = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaContraseña: formData.nuevaContraseña }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        toast.error(datos.error || 'Error al restablecer', { id: 'error-reset' })
        return
      }

      toast.success('¡Contraseña actualizada correctamente!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      console.error('Error en Reset-Password:', error)
      toast.error('No se pudo conectar con el servidor', { id: 'error-reset' })
    } finally {
      setCargando(false)
    }
  }

  const reglasLista = [
    { id: 'longitud', label: 'Mínimo 6 caracteres', cumplida: reglasContraseña.longitud },
    { id: 'mayuscula', label: 'Una letra mayúscula', cumplida: reglasContraseña.mayuscula },
    { id: 'numero', label: 'Un número', cumplida: reglasContraseña.numero },
    { id: 'especial', label: 'Un carácter especial', cumplida: reglasContraseña.especial },
  ]

  return (
    <AuthLayout subtitulo="Recupera tu acceso" ancho="max-w-sm">
      <h1 className="font-display text-xl sm:text-2xl font-bold text-center mb-1.5">Nueva contraseña</h1>
      <p className="text-sm text-ink-3 text-center mb-6">Elige una contraseña segura para tu cuenta</p>

      <form onSubmit={handleReset}>
        <div className="mb-2">
          <label htmlFor="nueva-password-reset" className="block text-sm font-medium text-ink mb-1.5">Nueva contraseña</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="nueva-password-reset"
              type={verContraseña ? 'text' : 'password'}
              name="nuevaContraseña"
              value={formData.nuevaContraseña}
              onChange={handleChange}
              onFocus={() => setContraseñaFocus(true)}
              onBlur={() => setContraseñaFocus(false)}
              disabled={cargando}
              placeholder="••••••••"
              className="input pl-10 pr-10"
              autoComplete="new-password"
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

        <div className={`overflow-hidden transition-all duration-300 ${(contraseñaFocus || formData.nuevaContraseña) && !contraseñaValida ? 'max-h-32 opacity-100 my-3' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col gap-1.5">
            {reglasLista.map((regla) => (
              <div
                key={regla.id}
                className={`transition-all duration-300 flex items-center gap-2 text-xs ${regla.cumplida ? 'text-success opacity-60' : 'text-ink-3'}`}
              >
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${regla.cumplida ? 'bg-success/20 border-success' : 'border-line-strong'}`}>
                  {regla.cumplida && <Check size={9} className="text-success" />}
                </span>
                {regla.label}
              </div>
            ))}
          </div>
        </div>
        {contraseñaValida && formData.nuevaContraseña && (
          <p className="text-xs text-success flex items-center gap-1.5 mb-2 mt-1">
            <ShieldCheck size={13} /> Contraseña segura
          </p>
        )}

        <div className="mb-2">
          <label htmlFor="confirmar-password-reset" className="block text-sm font-medium text-ink mb-1.5">Confirmar contraseña</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              id="confirmar-password-reset"
              type={verConfirmar ? 'text' : 'password'}
              name="confirmarContraseña"
              value={formData.confirmarContraseña}
              onChange={handleChange}
              disabled={cargando}
              placeholder="••••••••"
              className="input pl-10 pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setVerConfirmar(!verConfirmar)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-accent transition"
              tabIndex={-1}
              aria-label="Mostrar contraseña"
            >
              {verConfirmar ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${confirmarTocado && !contraseñasCoinciden ? 'max-h-6 opacity-100 my-2' : 'max-h-0 opacity-0'}`}>
          <p className="text-xs text-error">Las contraseñas no coinciden</p>
        </div>
        {confirmarTocado && contraseñasCoinciden && (
          <p className="text-xs text-success flex items-center gap-1.5 my-2">
            <Check size={13} /> Las contraseñas coinciden
          </p>
        )}

        <button type="submit" disabled={cargando || !puedeActualizar} className="btn btn-primary btn-lg w-full mt-2">
          {cargando ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Actualizando...
            </>
          ) : (
            'Actualizar contraseña'
          )}
        </button>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword