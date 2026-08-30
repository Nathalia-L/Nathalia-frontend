// Tema personalizado: traduce los colores editables del contenido a variables
// CSS reales (--na-rose, --na-gold, ...). Al ser estilos inline sobre <html>,
// siempre ganan sobre el tema claro/oscuro definido en index.css.

import { cargarContenido } from './contenido'
import { FUENTES_POR_ID, FUENTE_DEFAULT } from './fuentes'

const VARIABLES = {
  rose: '--na-rose',
  roseStrong: '--na-rose-strong',
  roseSoft: '--na-rose-soft',
  roseLight: '--na-rose-light',
  blush: '--na-blush',
  gold: '--na-gold',
  goldLight: '--na-gold-light',
  extra1: '--na-extra1',
  extra2: '--na-extra2',
  extra3: '--na-extra3',
  extra4: '--na-extra4',
}

export function aplicarTema(tema = {}) {
  const raiz = document.documentElement
  for (const [clave, variable] of Object.entries(VARIABLES)) {
    if (tema[clave]) raiz.style.setProperty(variable, tema[clave])
    else raiz.style.removeProperty(variable)
  }
  const fuente = (tema && FUENTES_POR_ID[tema.fuente]) || FUENTE_DEFAULT
  raiz.style.setProperty('--na-fuente-display', fuente.display)
  raiz.style.setProperty('--na-fuente-texto', fuente.texto)
}

export function aplicarTemaGuardado() {
  aplicarTema(cargarContenido().tema)
}

export function restaurarTema() {
  const raiz = document.documentElement
  for (const variable of Object.values(VARIABLES)) raiz.style.removeProperty(variable)
  raiz.style.removeProperty('--na-fuente-display')
  raiz.style.removeProperty('--na-fuente-texto')
}