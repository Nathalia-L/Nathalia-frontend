import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LogoNathalia from './LogoNathalia'
import ThemeToggle from './ThemeToggle'
import AuroraBackground from './AuroraBackground'

function AuthLayout({ children, subtitulo, ancho = 'max-w-md' }) {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-10 bg-bg">
      <div className="absolute inset-0" aria-hidden="true">
        <AuroraBackground intensidad={0.9} />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, var(--bg) 0%, transparent 30%, transparent 70%, var(--bg) 100%)' }}
        aria-hidden="true"
      />

      <div className="absolute top-5 left-5 sm:top-7 sm:left-7 z-20">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="glass inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink rounded-full px-3.5 py-2 transition"
        >
          <ArrowLeft size={15} /> Volver
        </button>
      </div>

      <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full">
        <div className={`${ancho} mx-auto`}>
          <div className="card p-7 sm:p-10 anim-pop">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="mb-4">
                <LogoNathalia size={64} tagline={false} />
              </div>
              {subtitulo && (
                <span className="kicker justify-center mb-1.5">{subtitulo}</span>
              )}
              <div className="w-14 h-px bg-gold/40 mt-3" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout