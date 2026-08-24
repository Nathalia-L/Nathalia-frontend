import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import registerBg from '../assets/register-bg.mp4'
import { API_URL } from "../config";
import FadeIn from '../components/ui/FadeIn'
import LogoNathalia from '../components/LogoNathalia'
import { cargarContenido } from '../utils/contenido'

function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const oneTapInicializado = useRef(false)
  const contenido = cargarContenido()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const inicializarOneTap = () => {
      if (!window.google) return
      if (oneTapInicializado.current) return
      oneTapInicializado.current = true

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
                  const respuesta = await fetch(`${API_URL}/auth/google-onetap`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            })

            const datos = await respuesta.json()

            if (respuesta.ok) {
              localStorage.setItem('token', datos.token)
              localStorage.setItem('cliente', JSON.stringify(datos.cliente))
              navigate('/cliente')
            } else {
              toast.error(datos.error || 'No se pudo iniciar sesión con Google')
            }
          } catch (error) {
            console.error('Error en One Tap:', error)
          }
        },
      })

      window.google.accounts.id.prompt((notification) => {
        console.log('One Tap notification:', notification.getMomentType())
      })
    }

    if (window.google) {
      inicializarOneTap()
    } else {
      window.addEventListener('load', inicializarOneTap)
      return () => window.removeEventListener('load', inicializarOneTap)
    }
  }, [navigate])

  return (
    <div className="min-h-screen text-white" style={{ background: '#1A0E13' }}>

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#1A0E13]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2">
            <LogoNathalia size={36} />
          </button>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#nosotros" className="text-sm text-white/70 hover:text-[#EBC6D6] transition">Productos</a>
            <a href="#nosotros" className="text-sm text-white/70 hover:text-[#EBC6D6] transition">Nosotros</a>
            <a href="#proceso" className="text-sm text-white/70 hover:text-[#EBC6D6] transition">Proceso</a>
          </div>

          {/* Botones desktop */}
          <div className="hidden md:flex items-center gap-3">
            <button type="button" onClick={() => navigate('/login')} className="text-sm text-white/70 hover:text-white transition px-4 py-2">
              Iniciar sesión
            </button>
            <button type="button" onClick={() => navigate('/register')} className="text-sm bg-[#C77A9C] text-white px-4 py-2 rounded-lg hover:bg-[#A65E80] transition">
              Comenzar
            </button>
          </div>

          {/* Menú hamburguesa móvil */}
          <button
            type="button"
            className="md:hidden text-white/70 hover:text-white transition"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            {menuAbierto ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>

        {/* Menú móvil desplegable */}
        {menuAbierto && (
          <div className="md:hidden bg-[#1A0E13]/95 backdrop-blur-md border-t border-white/10 px-4 py-4 flex flex-col gap-4">
            <a href="#nosotros" onClick={() => setMenuAbierto(false)} className="text-sm text-white/70 hover:text-[#EBC6D6] transition py-2">Productos</a>
            <a href="#nosotros" onClick={() => setMenuAbierto(false)} className="text-sm text-white/70 hover:text-[#EBC6D6] transition py-2">Nosotros</a>
            <a href="#proceso" onClick={() => setMenuAbierto(false)} className="text-sm text-white/70 hover:text-[#EBC6D6] transition py-2">Proceso</a>
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <button type="button" onClick={() => navigate('/login')} className="text-sm text-white/70 hover:text-white transition py-2 text-left">
                Iniciar sesión
              </button>
              <button type="button" onClick={() => navigate('/register')} className="text-sm bg-[#C77A9C] text-white px-4 py-2.5 rounded-lg hover:bg-[#A65E80] transition text-center">
                Comenzar
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {contenido.banner ? (
          <img src={contenido.banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" src={registerBg} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(26,14,19,0.82) 0%, rgba(42,21,33,0.72) 55%, rgba(26,14,19,0.88) 100%)' }}></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-[#D4AF37]/40 rounded-full px-3 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D4AF37' }}></span>
            <span className="text-xs text-white/85">{contenido.heroBadge}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            <span>{contenido.heroTitulo1}</span>
            <span className="block bg-gradient-to-r from-[#EBC6D6] via-[#E9CD8A] to-[#C77A9C] bg-clip-text text-transparent">{contenido.heroTitulo2}</span>
          </h1>
          <p className="text-base sm:text-lg text-white/75 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            {contenido.heroTexto}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <button type="button" onClick={() => navigate('/register')} className="px-6 sm:px-8 py-3.5 sm:py-4 bg-[#C77A9C] text-white rounded-xl font-medium text-sm hover:bg-[#A65E80] transition-all duration-300 hover:scale-105">
              {contenido.heroCta} →
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('nosotros').scrollIntoView({ behavior: 'smooth' })}
              className="px-6 sm:px-8 py-3.5 sm:py-4 text-white rounded-xl font-medium text-sm transition-all duration-300 hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Ver colección
            </button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M7 10l5 5 5-5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* CONTADORES */}
      <section className="py-12 sm:py-16" style={{ background: '#2A1521' }}>
        <FadeIn>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { numero: "1.000+", label: "Clientas felices" },
              { numero: "15", label: "Marcas aliadas" },
              { numero: "98%", label: "Recomiendan Nathalia" },
              { numero: "24h", label: "Tiempo de entrega" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#E9CD8A]">{item.numero}</span>
                <span className="text-xs sm:text-sm text-white/60">{item.label}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* POR QUÉ NATHALIA */}
      <section id="nosotros" className="py-16 sm:py-24" style={{ background: '#1A0E13' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-10 sm:mb-16">
              <span className="text-xs text-[#E9CD8A] uppercase tracking-widest">Nathalia</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">{contenido.nosotrosTitulo}</h2>
              <p className="text-white/60 mt-4 max-w-xl mx-auto text-sm sm:text-base">{contenido.nosotrosSubtitulo}</p>
            </div>
          </FadeIn>
          <FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
              {[
                { icono: "👗", titulo: "Moda con estilo", descripcion: "Prendas y accesorios seleccionados para que cada look sea único y auténtico." },
                { icono: "💄", titulo: "Belleza real", descripcion: "Maquillaje y cosmética que resaltan lo mejor de ti, con calidad certificada." },
                { icono: "✨", titulo: "Calidad premium", descripcion: "Trabajamos con marcas aliadas que cuidan cada detalle de sus productos." },
                { icono: "🚀", titulo: "Entrega en 24 horas", descripcion: "Procesamos tu pedido el mismo día y llega fresco a tu puerta." },
                { icono: "🔒", titulo: "Compra segura", descripcion: "Tus datos protegidos y pagos cifrados con los más altos estándares." },
                { icono: "💖", titulo: "Pensado para ti", descripcion: "Cada recomendación y detalle está hecho para acompañar tu estilo." },
              ].map((item, i) => (
                <div key={i} className="p-5 sm:p-6 rounded-2xl transition-all duration-300 hover:bg-white/5 group cursor-default" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-3xl sm:text-4xl mb-4 block">{item.icono}</span>
                  <h3 className="text-white font-medium mb-2 text-sm sm:text-base group-hover:text-[#E9CD8A] transition">{item.titulo}</h3>
                  <p className="text-xs sm:text-sm text-white/50 leading-relaxed">{item.descripcion}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* PROCESO */}
      <section id="proceso" className="py-16 sm:py-24" style={{ background: '#2A1521' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-10 sm:mb-16">
              <span className="text-xs text-[#E9CD8A] uppercase tracking-widest">Nathalia</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">{contenido.procesoTitulo}</h2>
              <p className="text-white/60 mt-4 max-w-xl mx-auto text-sm sm:text-base">{contenido.procesoSubtitulo}</p>
            </div>
          </FadeIn>
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 relative">
              <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px" style={{ background: 'rgba(212,175,55,0.35)' }}></div>
              {[
                { numero: "01", icono: "💅", titulo: "Elige tu estilo", descripcion: "Explora nuestra colección y escoge lo que más te guste" },
                { numero: "02", icono: "🛒", titulo: "Haz tu pedido", descripcion: "Agrega al carrito, personaliza la cantidad y confirma" },
                { numero: "03", icono: "✅", titulo: "Confirmamos", descripcion: "Revisamos tu pedido y lo preparamos con el mayor cuidado" },
                { numero: "04", icono: "📦", titulo: "Lo recibes", descripcion: "Tu pedido llega a tu puerta en menos de 24 horas" },
              ].map((paso, i) => (
                <div key={i} className="flex flex-col items-center text-center relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 z-10" style={{ background: '#1A0E13', border: '2px solid #D4AF37' }}>
                    {paso.icono}
                  </div>
                  <span className="text-xs text-[#E9CD8A] font-mono mb-1 sm:mb-2">{paso.numero}</span>
                  <h3 className="text-white font-medium mb-1 sm:mb-2 text-sm">{paso.titulo}</h3>
                  <p className="text-xs text-white/50 leading-relaxed hidden sm:block">{paso.descripcion}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 sm:py-24 relative overflow-hidden" style={{ background: '#1A0E13' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#C77A9C]/10 to-transparent"></div>
        <FadeIn>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              <span>{contenido.ctaFinalTitulo1}</span>
              <span className="bg-gradient-to-r from-[#EBC6D6] to-[#E9CD8A] bg-clip-text text-transparent"> {contenido.ctaFinalTitulo2}</span>?
            </h2>
            <p className="text-white/60 mb-8 sm:mb-10 text-base sm:text-lg max-w-2xl mx-auto">
              {contenido.ctaFinalTexto}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <button type="button" onClick={() => navigate('/register')} className="px-8 sm:px-10 py-3.5 sm:py-4 bg-[#C77A9C] text-white rounded-xl font-medium hover:bg-[#A65E80] transition-all duration-300 hover:scale-105">
                Crear cuenta →
              </button>
              <button type="button" onClick={() => navigate('/login')} className="px-8 sm:px-10 py-3.5 sm:py-4 text-white rounded-xl font-medium transition-all duration-300 hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                Iniciar sesión
              </button>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer className="py-10 sm:py-12" style={{ background: '#2A1521' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <span className="text-[#F9E7EE] text-xl font-medium mb-4 block">Nathalia</span>
              <p className="text-sm text-white/50 leading-relaxed">{contenido.footerDescripcion}</p>
            </div>
            <div>
              <h4 className="text-white text-sm font-medium mb-4">Productos</h4>
              <ul className="space-y-2">
                {["Ropa", "Maquillaje", "Accesorios", "Cuidado personal"].map((item, i) => (
                  <li key={i} className="text-xs sm:text-sm text-white/50 hover:text-[#E9CD8A] cursor-pointer transition">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-medium mb-4">Empresa</h4>
              <ul className="space-y-2">
                {["Sobre Nathalia", "Marcas aliadas", "Sostenibilidad", "Contacto"].map((item, i) => (
                  <li key={i} className="text-xs sm:text-sm text-white/50 hover:text-[#E9CD8A] cursor-pointer transition">{item}</li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-white text-sm font-medium mb-4">Newsletter</h4>
              <p className="text-xs sm:text-sm text-white/50 mb-3">Recibe novedades y promociones exclusivas.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="tucorreo@ejemplo.com" className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
                <button type="button" className="px-3 py-2 bg-[#C77A9C] text-white rounded-lg text-sm hover:bg-[#A65E80] transition">→</button>
              </div>
            </div>
          </div>
          </FadeIn>
          <div className="border-t border-white/10 pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">© 2026 Nathalia. Todos los derechos reservados.</p>
            <div className="flex gap-4 sm:gap-6">
              {["Privacidad", "Términos", "Cookies"].map((item, i) => (
                <span key={i} className="text-xs text-white/40 hover:text-white/70 cursor-pointer transition">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default Landing
