import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { Eye, EyeOff, Loader2, Mail, Lock, User as UserIcon, ArrowLeft, ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import { API_URL } from '../config'

const REGEX_EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,24}$/
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

function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ nombreCompleto: '', email: '', contraseña: '', confirmarContraseña: '' })
  const [cargando, setCargando] = useState(false)
  const [verificandoEmail, setVerificandoEmail] = useState(false)
  const [verContraseña, setVerContraseña] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [contraseñaFocus, setContraseñaFocus] = useState(false)

  const [reglasContraseña, setReglasContraseña] = useState({
    longitud: false,
    mayuscula: false,
    numero: false,
    especial: false,
  })
  const [erroresNombre, setErroresNombre] = useState('')
  const [erroresEmail, setErroresEmail] = useState('')

  const contraseñaValida = Object.values(reglasContraseña).every(Boolean)
  const confirmarTocado = formData.confirmarContraseña.length > 0
  const contraseñasCoinciden = formData.contraseña === formData.confirmarContraseña
  const puedeContinuarPaso2 = contraseñaValida && confirmarTocado && contraseñasCoinciden

  const nombreCompletoValido = (() => {
    const partes = formData.nombreCompleto.trim().split(/\s+/).filter(Boolean)
    return partes.length >= 2 && partes.every((p) => p.length >= 2)
  })()
  const emailValidoPaso1 = REGEX_EMAIL.test(formData.email.trim())
  const puedeContinuarPaso1 = nombreCompletoValido && emailValidoPaso1

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (name === 'contraseña') {
      setReglasContraseña(evaluarReglasContraseña(value))
    }

    if (name === 'nombreCompleto') {
      const partes = value.trim().split(/\s+/).filter(Boolean)
      if (partes.length < 2) setErroresNombre('Falta el apellido')
      else if (!partes.every((p) => p.length >= 2)) setErroresNombre('Cada nombre debe tener mínimo 2 letras')
      else setErroresNombre('')
    }

    if (name === 'email') {
      setErroresEmail(value && !REGEX_EMAIL.test(value) ? 'Correo no válido' : '')
    }
  }

  async function handleSiguientePaso1() {
    toast.dismiss('error-register')

    if (!formData.nombreCompleto.trim() || !formData.email.trim()) {
      toast.error('Todos los campos son obligatorios', { id: 'error-register' })
      return
    }

    const partes = formData.nombreCompleto.trim().split(/\s+/).filter(Boolean)
    if (partes.length < 2) {
      toast.error('Ingresa tu nombre y apellido', { id: 'error-register' })
      return
    }
    if (!partes.every((p) => p.length >= 2)) {
      toast.error('Cada nombre y apellido debe tener al menos 2 letras', { id: 'error-register' })
      return
    }
    if (!REGEX_EMAIL.test(formData.email.trim())) {
      toast.error('Ingresa un correo electrónico válido', { id: 'error-register' })
      return
    }

    setVerificandoEmail(true)
    try {
      const respuesta = await fetch(`${API_URL}/auth/verificar-email?email=${encodeURIComponent(formData.email.trim())}`)
      const datos = await respuesta.json()

      if (!respuesta.ok) {
        toast.error('No se pudo verificar el correo, intenta de nuevo', { id: 'error-register' })
        return
      }
      if (!datos.disponible) {
        toast.error('Ese correo ya está registrado', { id: 'error-register' })
        return
      }

      setStep(2)
    } catch (error) {
      console.error('Error en Register:', error)
      toast.error('No se pudo conectar con el servidor', { id: 'error-register' })
    } finally {
      setVerificandoEmail(false)
    }
  }

  async function handleRegister() {
    toast.dismiss('error-register')

    if (!formData.contraseña || !formData.confirmarContraseña) {
      toast.error('Todos los campos son obligatorios', { id: 'error-register' })
      return
    }
    if (!contraseñaValida) {
      toast.error('La contraseña debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial', { id: 'error-register' })
      return
    }
    if (!contraseñasCoinciden) {
      toast.error('Las contraseñas no coinciden', { id: 'error-register' })
      return
    }

    setCargando(true)

    const [nombre, ...resto] = formData.nombreCompleto.trim().split(' ')
    const apellido = resto.join(' ')

    try {
      const respuesta = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido,
          email: formData.email,
          contraseña: formData.contraseña,
        }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        toast.error(datos.error || 'Error al registrar', { id: 'error-register' })
        return
      }

      toast.success('¡Cuenta creada exitosamente! 🎉')
      setStep(3)
    } catch (error) {
      console.error('Error en Register:', error)
      toast.error('No se pudo conectar con el servidor', { id: 'error-register' })
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
    <AuthLayout subtitulo="Únete a Beauty Esme" ancho="max-w-[440px]">
      {/* Indicador de pasos */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                step >= s ? 'bg-gradient-to-br from-accent to-accent-strong text-white shadow-md' : 'bg-elevated text-ink-3 border border-line'
              }`}
            >
              {step > s ? <Check size={14} /> : s}
            </span>
            {s < 3 && <span className={`w-8 h-px transition-all ${step > s ? 'bg-accent' : 'bg-line-strong'}`} />}
          </div>
        ))}
      </div>

      {/* Paso 1 */}
      {step === 1 && (
        <div className="anim-sheet-up">
          <h2 className="font-display text-2xl font-bold mb-1">Datos personales</h2>
          <p className="text-sm text-ink-3 mb-6">Cuéntanos quién eres</p>

          <div className="mb-4">
            <label htmlFor="nombre-register" className="block text-sm font-medium text-ink mb-1.5">Nombre completo</label>
            <div className="relative">
              <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                id="nombre-register"
                type="text"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                className="input pl-10"
                autoComplete="name"
              />
            </div>
            {erroresNombre && <p className="text-xs text-error mt-1.5">{erroresNombre}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="email-register" className="block text-sm font-medium text-ink mb-1.5">Correo electrónico</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                id="email-register"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tucorreo@ejemplo.com"
                className="input pl-10"
                autoComplete="email"
              />
            </div>
            {erroresEmail && <p className="text-xs text-error mt-1.5">{erroresEmail}</p>}
          </div>

          <button
            type="button"
            onClick={handleSiguientePaso1}
            disabled={!puedeContinuarPaso1 || verificandoEmail}
            className="btn btn-primary btn-lg w-full"
          >
            {verificandoEmail ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verificando...
              </>
            ) : (
              <>Continuar <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      )}

      {/* Paso 2 */}
      {step === 2 && (
        <div className="anim-sheet-up">
          <h2 className="font-display text-2xl font-bold mb-1">Crea tu acceso</h2>
          <p className="text-sm text-ink-3 mb-6">Elige una contraseña segura</p>

          <div className="mb-2 relative">
            <label htmlFor="password-register" className="block text-sm font-medium text-ink mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                id="password-register"
                type={verContraseña ? 'text' : 'password'}
                name="contraseña"
                value={formData.contraseña}
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

          <div className={`overflow-hidden transition-all duration-300 ${(contraseñaFocus || formData.contraseña) && !contraseñaValida ? 'max-h-32 opacity-100 my-3' : 'max-h-0 opacity-0'}`}>
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
          {contraseñaValida && formData.contraseña && (
            <p className="text-xs text-success flex items-center gap-1.5 mb-2 mt-1">
              <ShieldCheck size={13} /> Contraseña segura
            </p>
          )}

          <div className="mb-2 relative">
            <label htmlFor="confirmar-password-register" className="block text-sm font-medium text-ink mb-1.5">Confirmar contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                id="confirmar-password-register"
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

          <div className="flex gap-3 mt-5">
            <button type="button" onClick={() => setStep(1)} disabled={cargando} className="btn btn-ghost btn-lg flex-1">
              <ArrowLeft size={16} /> Atrás
            </button>
            <button
              type="button"
              onClick={handleRegister}
              disabled={cargando || !puedeContinuarPaso2}
              className="btn btn-primary btn-lg flex-1"
            >
              {cargando ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Registrando...
                </>
              ) : (
                <>Crear cuenta</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Paso 3 */}
      {step === 3 && (
        <div className="text-center anim-pop">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-strong flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Check size={30} className="text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">¡Ya casi!</h2>
          <p className="text-sm text-ink-3 mb-8">
            Te enviamos un correo a <span className="text-accent font-semibold">{formData.email}</span>. Confirma tu cuenta desde ese enlace antes de iniciar sesión.
          </p>
          <button type="button" onClick={() => navigate('/login')} className="btn btn-primary btn-lg w-full">
            Iniciar sesión
          </button>
        </div>
      )}

      {step !== 3 && (
        <p className="text-center text-sm text-ink-3 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-accent font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      )}
    </AuthLayout>
  )
}

export default Register