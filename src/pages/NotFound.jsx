import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import LogoNathalia from '../components/LogoNathalia'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-ink px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-8">
          <LogoNathalia size={56} tagline={false} />
        </div>
        <p className="font-mono text-sm text-gold mb-3 tracking-widest">ERROR 404</p>
        <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight mb-4 flex items-center justify-center gap-3">
          Oops <Sparkles size={30} className="text-accent" />
        </h1>
        <p className="text-ink-3 mb-8">
          Esta página no existe o se movió de lugar. Pero no te preocupes, tu próximo look favorito te está esperando.
        </p>
        <div className="flex justify-center">
          <button type="button" onClick={() => navigate('/')} className="btn btn-primary btn-lg">
            <ArrowLeft size={17} /> Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound