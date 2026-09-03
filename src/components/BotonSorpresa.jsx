import { Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  cargarContenido,
  guardarContenido,
  esAdmin,
  ESTILOS_DESTACADOS,
  FORMAS_DESTACADOS,
  FORMAS_CATALOGO,
} from '../utils/contenido'
import { generarDiseñoAleatorio } from '../utils/paletas'
import { FUENTES } from '../utils/fuentes'

// BotonSorpresa — botón global (solo admin) que aparece en todas las páginas.
// "¿No sabes qué personalizar hoy?" hace una mezcla total al azar: colores,
// logo, tipografía, presentación de destacados y forma de las tarjetas del
// catálogo. Todo se guarda y se propaga en vivo a toda la tienda.
function azar(lista) {
  return lista[Math.floor(Math.random() * lista.length)]
}

export default function BotonSorpresa() {
  if (!esAdmin()) return null

  const lanzarSorpresa = () => {
    const d = generarDiseñoAleatorio()
    const actual = cargarContenido()
    const nuevo = {
      ...actual,
      tema: { ...actual.tema, ...d.tema, fuente: azar(FUENTES).id },
      logo: { ...actual.logo, ...d.logo },
      destacadosEstilo: azar(ESTILOS_DESTACADOS).id,
      destacadosForma: azar(FORMAS_DESTACADOS).id,
      catalogoForma: azar(FORMAS_CATALOGO).id,
    }
    guardarContenido(nuevo)
    toast.success('🎲 ¡Sorpresa! Colores, letra y tarjetas cambiaron')
  }

  return (
    <button
      type="button"
      onClick={lanzarSorpresa}
      title="Mezcla todo al azar: colores, logo, tipografía y formas de tarjetas"
      className="group fixed bottom-5 right-5 z-[70] flex items-center gap-2 h-12 pl-4 pr-5 rounded-full shadow-2xl shadow-black/25 text-sm font-semibold text-white cursor-pointer hover:scale-[1.03] active:scale-95 transition-all bg-gradient-to-r from-accent to-gold ring-2 ring-white/25 anim-pop"
    >
      <Sparkles size={17} className="shrink-0" />
      <span className="max-w-[230px] truncate text-left leading-tight">
        ¿No sabes qué personalizar hoy?
      </span>
    </button>
  )
}