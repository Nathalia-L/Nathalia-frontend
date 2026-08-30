import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, X, Loader2, LogIn, Mail } from 'lucide-react'
import LogoNathalia from '../components/LogoNathalia'
import ThemeToggle from '../components/ThemeToggle'
import AuroraBackground from '../components/AuroraBackground'
import { API_URL } from '../config'

function VerificarCuenta() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const yaProcesado = useRef(false)

  const [estado, setEstado] = useState('cargando') // cargando | exito | error | expirado
  const [mensaje, setMensaje] = useState('')
  const [email, setEmail] = useState('')
  const [reenviando, setReenviando] = useState(false)
  const [reenviado, setReenviado] = useState(false)

  useEffect(() => {
    if (yaProcesado.current) return
    yaProcesado.current = true

    const token = searchParams.get('token')

    if (!token) {
      setEstado('error')
      setMensaje('El enlace de verificación no es válido.')
      return
    }

    async function verificar() {
      try {
        const respuesta = await fetch(`${API_URL}/auth/verificar-cuenta?token=${encodeURIComponent(token)}`)
        const datos = await respuesta.json()

        if (!respuesta.ok) {
          setEstado(datos.expirado ? 'expirado' : 'error')
          setMensaje(datos.error || 'No se pudo verificar la cuenta.')
          return
        }

        setEstado('exito')
        setMensaje(datos.mensaje || '¡Cuenta verificada!')
      } catch (error) {
        console.error('Error en VerificarCuenta:', error)
        setEstado('error')
        setMensaje('No se pudo conectar con el servidor.')
      }
    }

    verificar()
  }, [searchParams])

  async function handleReenviar(e) {
    e.preventDefault()
    if (!email.trim()) return

    setReenviando(true)
    try {
      const respuesta = await fetch(`${API_URL}/auth/reenviar-verificacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok) {
        setMensaje(datos.error || 'No se pudo reenviar el correo.')
        return
      }

      setReenviado(true)
      setMensaje(datos.mensaje || 'Si el correo existe, te reenviamos el enlace.')
    } catch (error) {
      console.error('Error en VerificarCuenta:', error)
      setMensaje('No se pudo conectar con el servidor.')
    } finally {
      setReenviando(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 bg-bg">
      <div className="absolute inset-0" aria-hidden="true">
        <AuroraBackground intensidad={0.8} />
      </div>

      <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="card p-8 sm:p-10 text-center anim-pop">
          <div className="flex justify-center mb-7">
            <LogoNathalia size={56} tagline={false} />
          </div>

          {estado === 'cargando' && (
            <>
              <Loader2 size={36} className="mx-auto mb-4 text-accent animate-spin" />
              <p className="text-sm text-ink-3">Verificando tu cuenta...</p>
            </>
          )}

          {estado === 'exito' && (
            <>
              <span className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mx-auto mb-5">
                <Check size={32} className="text-success" />
              </span>
              <h1 className="font-display text-2xl font-bold mb-2">¡Cuenta verificada!</h1>
              <p className="text-sm text-ink-3 mb-8">{mensaje}</p>
              <button type="button" onClick={() => navigate('/login')} className="btn btn-primary btn-lg w-full">
                <LogIn size={16} /> Iniciar sesión
              </button>
            </>
          )}

          {(estado === 'error' || estado === 'expirado') && (
            <>
              <span className="w-16 h-16 rounded-full bg-error/15 border border-error/30 flex items-center justify-center mx-auto mb-5">
                <X size={32} className="text-error" />
              </span>
              <h1 className="font-display text-2xl font-bold mb-2">
                {estado === 'expirado' ? 'El enlace expiró' : 'No se pudo verificar'}
              </h1>
              <p className="text-sm text-ink-3 mb-6">{mensaje}</p>

              {!reenviado ? (
                <form onSubmit={handleReenviar} className="flex flex-col gap-3">
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      className="input pl-10"
                      required
                    />
                  </div>
                  <button type="submit" disabled={reenviando} className="btn btn-primary btn-lg w-full">
                    {reenviando ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Enviando...
                      </>
                    ) : (
                      'Reenviar enlace de verificación'
                    )}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-accent mb-2">{mensaje}</p>
              )}

              <p className="text-center text-sm text-ink-3 mt-6">
                <button type="button" className="text-accent font-semibold hover:underline cursor-pointer bg-transparent border-0 p-0" onClick={() => navigate('/login')}>
                  Volver a iniciar sesión
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerificarCuenta